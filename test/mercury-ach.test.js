const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const ach = require('../lib/mercury-ach');
const { normalizeOrder, cleanCustomer, customerDigest } = require('../lib/direct-payment');
const { discountedOrder, VERSION: OFFER_VERSION } = require('../lib/email-offer');
const createHandler = require('../api/create-ach-payment');
const statusHandler = require('../api/ach-payment-status');
const configHandler = require('../api/ach-payment-config');

const ACCOUNT_ID = '11111111-1111-4111-8111-111111111111';
const CUSTOMER_ID = '22222222-2222-4222-8222-222222222222';
const INVOICE_ID = '33333333-3333-4333-8333-333333333333';
const NEXT_PAGE = '44444444-4444-4444-8444-444444444444';
const ORDER_ID = 'NXT-ACH-TEST-123456';
const REVIEW_REFERENCE = 'RR-' + '1'.repeat(32);
const REVIEW_CODE = 'a'.repeat(64);
const REDIS_URL = 'https://ach-ledger.example.test';
const TOKEN = 'test-only-mercury-api-token-never-live';
const SIGNING_SECRET = 'test-only-mercury-ach-receipt-secret-32-characters';
const SITE = 'https://www.nxtlvl-research.com';
const ENV = {
  VERCEL_ENV: 'production', MERCURY_ENV: 'production', MERCURY_API_TOKEN: TOKEN,
  MERCURY_DESTINATION_ACCOUNT_ID: ACCOUNT_ID, MERCURY_ACH_SIGNING_SECRET: SIGNING_SECRET,
  MERCURY_ACH_ENABLED: 'true', MERCURY_RESEARCH_APPROVED: 'true', RESEARCH_COMMERCE_ENABLED: 'true',
  PAYMENT_LEDGER_KV_REST_API_URL: REDIS_URL, PAYMENT_LEDGER_KV_REST_API_TOKEN: 'test-only-ledger-token',
};

function responseRecorder() {
  return {
    statusCode: 200, headers: {}, body: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; return this; },
    end(body) { this.body = body ? JSON.parse(body) : null; return this; },
  };
}

function fixture() {
  const store = new Map();
  const invoices = new Map();
  const customers = [];
  const requests = [];
  const providerPosts = [];
  const state = { loseNextCreateResponse: false, failProvider: false, failLedger: false, customProvider: null };
  const items = [{ key: 'bpc157-10::0', qty: 2, price: 0.01, totalCents: 1 }];
  const order = normalizeOrder(items, 'shipping');
  const customer = cleanCustomer({ name: 'ACH Test Research Lab', email: 'lab@example.test', phone: '5555550100',
    address: '100 Test Street', unit: '', city: 'Miami', state: 'FL', zip: '33101' }, order.mode);
  const approval = { reference: REVIEW_REFERENCE, orderId: ORDER_ID, status: 'approved', policyVersion: '2026-10-16',
    expiresAt: Date.now() + 60_000, itemDigest: order.itemDigest, customerDigest: customerDigest(customer),
    totalCents: order.totalCents, fulfillment: order.mode };
  store.set('nxt:research:v1:code:' + crypto.createHash('sha256').update(REVIEW_CODE).digest('hex'), REVIEW_REFERENCE);
  store.set('nxt:research:v1:' + REVIEW_REFERENCE, JSON.stringify(approval));
  const request = { method: 'POST', headers: { origin: SITE, 'x-forwarded-for': '203.0.113.9' },
    body: { requestId: crypto.randomUUID(), items, fulfillment: order.mode, customer, totalCents: 1,
      researchApprovalCode: REVIEW_CODE, researchConsent: { attestation: true, policyVersion: '2026-10-17-final-sale' } } };
  function redis(command) {
    const [op, key, value, ...options] = command;
    if (op === 'PING') return 'PONG';
    if (op === 'GET') return store.get(key) ?? null;
    if (op === 'SET') {
      if (options.includes('NX') && store.has(key)) return null;
      store.set(key, String(value)); return 'OK';
    }
    if (op === 'HGET') return store.get(key + ':' + value) ?? null;
    if (op === 'EVAL') {
      const script = key;
      const actualKey = command[3];
      if (script.includes("redis.call('INCR'")) {
        const next = Number(store.get(actualKey) || 0) + 1;
        store.set(actualKey, next); return next;
      }
      if (script.includes("redis.call('DEL'")) {
        if (store.get(actualKey) === command[4]) { store.delete(actualKey); return 1; }
        return 0;
      }
    }
    throw new Error('Unexpected mocked ledger command: ' + op);
  }
  const ok = data => ({ ok: true, status: 200, json: async () => structuredClone(data) });
  async function fetchMock(url, options = {}) {
    const target = String(url);
    requests.push({ url: target, ...options });
    if (target === REDIS_URL) {
      if (state.failLedger) throw new TypeError('Mock ledger unavailable');
      return ok({ result: redis(JSON.parse(options.body)) });
    }
    assert.match(target, /^https:\/\/api(?:-sandbox)?\.mercury\.com\/api\/v1\/ar\//,
      'Tests must never make real requests or invoke email, SMS, or transfer APIs');
    if (state.failProvider) throw new TypeError('Mock Mercury unavailable');
    assert.equal(options.headers.Authorization, 'Bearer ' + TOKEN);
    assert.equal(options.redirect, 'error');
    const urlObject = new URL(target);
    const method = options.method || 'GET';
    if (method === 'POST') providerPosts.push({ path: urlObject.pathname, body: JSON.parse(options.body) });
    if (state.customProvider) {
      const custom = await state.customProvider(urlObject, options);
      if (custom !== undefined) return custom;
    }
    if (urlObject.pathname.endsWith('/ar/customers') && method === 'GET') return ok({ customers, page: {} });
    if (urlObject.pathname.endsWith('/ar/customers') && method === 'POST') {
      const created = { id: CUSTOMER_ID, ...JSON.parse(options.body) };
      customers.push(created); return ok(created);
    }
    if (urlObject.pathname.endsWith('/ar/invoices') && method === 'GET') {
      return ok({ invoices: [...invoices.values()].map(({ lineItems, ...rest }) => rest), page: {} });
    }
    if (urlObject.pathname.endsWith('/ar/invoices') && method === 'POST') {
      const body = JSON.parse(options.body);
      if ([...invoices.values()].some(invoice => invoice.invoiceNumber === body.invoiceNumber)) {
        return { ok: false, status: 400, json: async () => ({ error: 'duplicate invoiceNumber' }) };
      }
      const created = { ...body, id: INVOICE_ID, slug: 'test-payment-slug', status: 'Unpaid',
        amount: body.lineItems.reduce((sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity, 0) / 100 };
      invoices.set(created.id, created);
      if (state.loseNextCreateResponse) {
        state.loseNextCreateResponse = false;
        throw new TypeError('Mock lost response after successful creation');
      }
      return ok(created);
    }
    const invoiceId = urlObject.pathname.split('/').pop();
    if (urlObject.pathname.includes('/ar/invoices/') && method === 'GET' && invoices.has(invoiceId)) return ok(invoices.get(invoiceId));
    throw new Error('Unexpected mocked Mercury route: ' + method + ' ' + urlObject.pathname);
  }
  return { store, invoices, customers, requests, providerPosts, state, order, customer, approval, request, fetchMock, ok,
    invoicePosts: () => providerPosts.filter(post => post.path.endsWith('/invoices')),
    record: () => JSON.parse(store.get('nxt:mercury-ach:v1:' + process.env.MERCURY_ENV + ':order:' + ORDER_ID)) };
}

function withFixture(fn) {
  return async () => {
    const savedEnv = Object.fromEntries(Object.keys(ENV).map(key => [key, process.env[key]]));
    const savedFetch = global.fetch;
    const savedError = console.error;
    const logs = [];
    Object.assign(process.env, ENV);
    const f = fixture();
    global.fetch = f.fetchMock;
    console.error = (...args) => logs.push(args);
    try { await fn({ ...f, logs }); }
    finally {
      global.fetch = savedFetch; console.error = savedError;
      for (const [key, value] of Object.entries(savedEnv)) {
        if (value === undefined) delete process.env[key]; else process.env[key] = value;
      }
    }
  };
}

async function create(f) {
  const res = responseRecorder(); await createHandler(f.request, res); return res;
}

test('ACH stays unavailable until credentials, merchant approval, research review, and the live ledger are ready', withFixture(async f => {
  assert.equal((await ach.capabilities()).available, true);
  for (const key of Object.keys(ENV).filter(key => !['VERCEL_ENV', 'MERCURY_ENV'].includes(key))) {
    const original = process.env[key]; delete process.env[key];
    assert.equal((await ach.capabilities()).available, false, key + ' must be required');
    process.env[key] = original;
  }
  f.state.failLedger = true;
  assert.equal((await ach.capabilities()).available, false);
  assert.equal(f.providerPosts.length, 0);
}));

test('production and sandbox are isolated and sandbox does not advertise an unverified hosted payment URL', withFixture(async f => {
  process.env.VERCEL_ENV = 'preview';
  assert.equal(ach.credentialsConfigured(), false);
  process.env.MERCURY_ENV = 'sandbox';
  assert.equal(ach.credentialsConfigured(), true);
  assert.equal((await ach.capabilities()).available, false);
  const result = await ach.createPayment({ order: f.order, customer: f.customer, approval: f.approval });
  assert.equal(result.sandbox, true);
  assert.equal(result.invoiceUrl, null);
  assert.ok(f.requests.filter(req => req.url !== REDIS_URL).every(req => req.url.startsWith('https://api-sandbox.mercury.com/')));
  process.env.VERCEL_ENV = 'production';
  assert.equal(ach.credentialsConfigured(), false);
}));

test('invoice amounts use trusted catalog prices and exact cents after discounts and fulfillment charges', withFixture(async f => {
  const order = discountedOrder(normalizeOrder([
    { key: 'bpc157-10::0', qty: 2 }, { key: 'bac-water-10ml::0', qty: 3 },
  ], 'shipping'), OFFER_VERSION);
  const lines = ach.invoiceLines(order);
  assert.equal(lines.reduce((sum, line) => sum + Math.round(line.unitPrice * 100) * line.quantity, 0), order.totalCents);
  assert.ok(lines.every(line => line.quantity === 1));
  assert.ok(lines.some(line => line.name.includes('email discount')));
  const res = await create(f);
  assert.equal(res.statusCode, 200);
  const sent = f.invoicePosts()[0].body;
  assert.equal(Math.round(f.invoices.get(INVOICE_ID).amount * 100), f.order.totalCents);
  assert.notEqual(res.body.totalCents, f.request.body.totalCents);
  assert.equal(sent.creditCardEnabled, false);
  assert.equal(sent.achDebitEnabled, true);
  assert.equal(sent.sendEmailOption, 'DontSend');
  assert.deepEqual(sent.ccEmails, []);
  assert.equal(sent.useRealAccountNumber, false);
}));

test('creation returns a pending order with a verified Mercury URL and no secret or customer disclosure', withFixture(async f => {
  const res = await create(f);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'pending');
  assert.equal(res.body.orderId, ORDER_ID);
  assert.equal(res.body.invoiceUrl, 'https://app.mercury.com/pay/test-payment-slug');
  assert.equal(typeof res.body.receiptToken, 'string');
  const output = JSON.stringify({ body: res.body, logs: f.logs });
  for (const privateValue of [TOKEN, SIGNING_SECRET, REVIEW_CODE, f.customer.email, f.customer.name]) {
    assert.equal(output.includes(privateValue), false);
  }
  assert.match(res.headers['cache-control'], /no-store/);
  assert.equal(f.providerPosts.length, 2);
}));

test('repeated checkout requests reuse one invoice even with a new client request ID', withFixture(async f => {
  const first = await create(f);
  f.request.body.requestId = crypto.randomUUID();
  const second = await create(f);
  assert.equal(first.statusCode, 200); assert.equal(second.statusCode, 200);
  assert.equal(second.body.invoiceUrl, first.body.invoiceUrl);
  assert.equal(second.body.receiptToken, first.body.receiptToken);
  assert.equal(f.invoicePosts().length, 1);
  assert.equal(f.invoices.size, 1);
}));

test('a lost successful-create response recovers the original invoice rather than issuing a second payable order', withFixture(async f => {
  f.state.loseNextCreateResponse = true;
  const first = await create(f);
  assert.equal(first.statusCode, 503);
  assert.equal(f.invoices.size, 1);
  assert.equal(f.record().invoiceId, undefined);
  const retry = await create(f);
  assert.equal(retry.statusCode, 200);
  assert.equal(retry.body.orderId, ORDER_ID);
  assert.equal(f.invoicePosts().length, 1);
  assert.equal(f.record().invoiceId, INVOICE_ID);
  assert.ok(f.requests.some(req => req.url.endsWith('/ar/invoices/' + INVOICE_ID)));
}));

test('an active order lock rejects a concurrent invoice attempt before another provider mutation', withFixture(async f => {
  f.store.set('nxt:mercury-ach:v1:production:order:' + ORDER_ID + ':lock', 'another-worker');
  await assert.rejects(ach.createPayment({ order: f.order, customer: f.customer, approval: f.approval }),
    err => err.httpStatus === 409 && err.code === 'request_busy');
  assert.equal(f.providerPosts.length, 0);
}));

test('missing consent, missing approval, altered buyer details, and a prior payment route block invoice creation', withFixture(async f => {
  f.request.body.researchConsent.attestation = false;
  assert.equal((await create(f)).statusCode, 400);
  f.request.body.researchConsent.attestation = true;
  f.request.body.researchApprovalCode = '';
  assert.equal((await create(f)).statusCode, 403);
  f.request.body.researchApprovalCode = REVIEW_CODE;
  f.request.body.customer = { ...f.customer, email: 'someone-else@example.test' };
  assert.equal((await create(f)).statusCode, 403);
  f.request.body.customer = f.customer;
  f.store.set('nxt:research:v1:route:' + REVIEW_REFERENCE, 'card');
  assert.equal((await create(f)).statusCode, 403);
  assert.equal(f.providerPosts.length, 0);
}));

test('invoice verification rejects changed amount, owner, destination, currency, material lines, and unsafe slugs', withFixture(async f => {
  await create(f);
  const record = f.record();
  const good = f.invoices.get(INVOICE_ID);
  const mutations = [
    invoice => { invoice.amount += 0.01; },
    invoice => { invoice.amount = String(invoice.amount); },
    invoice => { invoice.customerId = ACCOUNT_ID; },
    invoice => { invoice.destinationAccountId = CUSTOMER_ID; },
    invoice => { invoice.invoiceNumber = 'NXT-ANOTHER-ORDER'; },
    invoice => { invoice.currencyCode = 'CAD'; },
    invoice => { invoice.achDebitEnabled = false; },
    invoice => { invoice.status = 'Linked'; },
    invoice => { invoice.slug = '../redirect'; },
    invoice => { invoice.slug = 'evil?redirect=https://example.test'; },
    invoice => { invoice.slug = 'https://example.test'; },
    invoice => { invoice.lineItems[0].unitPrice += 0.01; },
    invoice => { invoice.lineItems[0].quantity = 2; },
    invoice => { invoice.lineItems[0].name = 'Different item'; },
    invoice => { invoice.lineItems[0].salesTaxRate = 0.07; },
    invoice => { invoice.lineItems.pop(); },
  ];
  for (const mutate of mutations) {
    const invoice = structuredClone(good); mutate(invoice);
    assert.throws(() => ach.assertInvoice(invoice, record), err => err.code === 'invoice_mismatch');
  }
}));

test('only a freshly fetched Mercury invoice determines pending, processing, paid, or cancelled status', withFixture(async f => {
  const created = await create(f);
  for (const [provider, expected] of [['Unpaid', 'pending'], ['Processing', 'processing'], ['Paid', 'paid'], ['Cancelled', 'cancelled']]) {
    f.invoices.get(INVOICE_ID).status = provider;
    const status = await ach.paymentStatus(created.body.receiptToken);
    assert.equal(status.status, expected);
    assert.equal(f.record().providerStatus, provider);
  }
  assert.equal(f.invoicePosts().length, 1);
}));

test('status checks remain available after new ACH invoices are disabled', withFixture(async f => {
  const created = await create(f);
  process.env.MERCURY_ACH_ENABLED = 'false';
  process.env.MERCURY_RESEARCH_APPROVED = 'false';
  process.env.RESEARCH_COMMERCE_ENABLED = 'false';
  assert.equal((await ach.capabilities()).available, false);
  f.invoices.get(INVOICE_ID).status = 'Processing';
  assert.equal((await ach.paymentStatus(created.body.receiptToken)).status, 'processing');
  assert.equal((await create(f)).statusCode, 503);
}));

test('receipt tampering, expiry, and a different environment never grant invoice access', withFixture(async f => {
  const created = await create(f);
  const token = created.body.receiptToken;
  const [payload, signature] = token.split('.');
  const changed = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, 'base64url')), orderId: 'NXT-OTHER-123456' })).toString('base64url');
  for (const value of ['', 'invalid', `${changed}.${signature}`, token.slice(0, -1) + (token.endsWith('A') ? 'B' : 'A')]) {
    assert.throws(() => ach.verifyReceipt(value), err => err.httpStatus === 401);
  }
  const expired = ach.receiptToken({ ...f.record(), createdAt: Date.now() - 91 * 24 * 60 * 60 * 1000 });
  assert.throws(() => ach.verifyReceipt(expired), err => err.httpStatus === 401);
  process.env.VERCEL_ENV = 'preview'; process.env.MERCURY_ENV = 'sandbox';
  assert.throws(() => ach.verifyReceipt(token), err => err.httpStatus === 401);
}));

test('same-origin status GET works with an authorization header even when the browser omits Origin', withFixture(async f => {
  const created = await create(f);
  const req = { method: 'GET', headers: { authorization: 'Bearer ' + created.body.receiptToken, 'sec-fetch-site': 'same-origin' } };
  const res = responseRecorder();
  await statusHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'pending');
  assert.match(res.headers['cache-control'], /no-store/);
}));

test('status rejects missing bearer authentication and tokens supplied only as URL parameters', withFixture(async f => {
  const created = await create(f);
  const res = responseRecorder();
  await statusHandler({ method: 'GET', headers: { origin: SITE }, query: { token: created.body.receiptToken } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(f.requests.filter(req => req.url.endsWith('/ar/invoices/' + INVOICE_ID)).length, 0);
}));

test('foreign origins cannot create invoices or read receipt status', withFixture(async f => {
  f.request.headers.origin = 'https://attacker.example.test';
  assert.equal((await create(f)).statusCode, 403);
  const res = responseRecorder();
  await statusHandler({ method: 'GET', headers: { origin: 'https://attacker.example.test', authorization: 'Bearer invalid' } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(f.requests.length, 0);
}));

test('provider outages do not reuse an earlier paid result as fresh payment confirmation', withFixture(async f => {
  const created = await create(f);
  f.invoices.get(INVOICE_ID).status = 'Paid';
  assert.equal((await ach.paymentStatus(created.body.receiptToken)).status, 'paid');
  f.state.failProvider = true;
  await assert.rejects(ach.paymentStatus(created.body.receiptToken), err => err.httpStatus === 503);
}));

test('a changed live invoice is held for review instead of reported as paid', withFixture(async f => {
  const created = await create(f);
  f.invoices.get(INVOICE_ID).status = 'Paid';
  f.invoices.get(INVOICE_ID).amount += 1;
  const res = responseRecorder();
  await statusHandler({ method: 'GET', headers: { origin: SITE, authorization: 'Bearer ' + created.body.receiptToken } }, res);
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.status, undefined);
  assert.equal(f.record().status, 'pending');
}));

test('paginated customer lookup uses the provider cursor and avoids creating a duplicate customer', withFixture(async f => {
  f.state.customProvider = async (url, options) => {
    if (url.pathname.endsWith('/ar/customers') && options.method === 'GET') {
      if (!url.searchParams.has('start_after')) return f.ok({ customers: [], page: { nextPage: NEXT_PAGE } });
      assert.equal(url.searchParams.get('start_after'), NEXT_PAGE);
      return f.ok({ customers: [{ id: CUSTOMER_ID, name: f.customer.name, email: f.customer.email }], page: {} });
    }
  };
  assert.equal((await create(f)).statusCode, 200);
  assert.equal(f.providerPosts.filter(post => post.path.endsWith('/customers')).length, 0);
  assert.equal(f.invoicePosts().length, 1);
}));

test('repeated pagination cursors fail closed without treating incomplete results as a new customer', withFixture(async f => {
  f.state.customProvider = async url => {
    if (url.pathname.endsWith('/ar/customers')) return f.ok({ customers: [], page: { nextPage: NEXT_PAGE } });
  };
  assert.equal((await create(f)).statusCode, 502);
  assert.equal(f.providerPosts.length, 0);
}));

test('a changed destination account cannot create another invoice for the same approved order', withFixture(async f => {
  await create(f);
  process.env.MERCURY_DESTINATION_ACCOUNT_ID = NEXT_PAGE;
  await assert.rejects(ach.createPayment({ order: f.order, customer: f.customer, approval: f.approval }),
    err => err.httpStatus === 409 && err.code === 'order_mismatch');
  assert.equal(f.invoicePosts().length, 1);
}));

test('public configuration is minimal and wrong methods cannot mutate payment state', withFixture(async f => {
  const config = responseRecorder();
  await configHandler({ method: 'GET', headers: {} }, config);
  assert.deepEqual(Object.keys(config.body).sort(), ['available', 'hosted', 'provider', 'requiresResearchApproval', 'settlementNote'].sort());
  const result = responseRecorder();
  await createHandler({ method: 'GET', headers: { origin: SITE } }, result);
  assert.equal(result.statusCode, 405);
  assert.equal(f.providerPosts.length, 0);
}));
