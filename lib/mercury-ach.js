const crypto = require('node:crypto');
const { redisCommand, ledgerConfigured } = require('./payment-ledger');
const { customerDigest } = require('./direct-payment');
const rates = require('../fulfillment-rates');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_ID = /^NXT-[A-Z0-9-]{6,80}$/;
const STATUS = { Unpaid: 'pending', Processing: 'processing', Paid: 'paid', Cancelled: 'cancelled' };
const RECEIPT_LIFETIME = 90 * 24 * 60 * 60 * 1000;
const RELEASE_LOCK = "if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) end return 0";
const RATE_LIMIT = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";

class AchError extends Error {
  constructor(message, httpStatus = 503, code = 'ach_unavailable') {
    super(message); this.httpStatus = httpStatus; this.code = code;
  }
}

function environment() {
  const mode = process.env.MERCURY_ENV;
  if (process.env.VERCEL_ENV === 'production') return mode === 'production' ? mode : null;
  return mode === 'sandbox' ? mode : null;
}

function credentialsConfigured() {
  return Boolean(environment() && ledgerConfigured()
    && String(process.env.MERCURY_API_TOKEN || '').length >= 20
    && !/[\r\n]/.test(process.env.MERCURY_API_TOKEN || '')
    && UUID.test(process.env.MERCURY_DESTINATION_ACCOUNT_ID || '')
    && String(process.env.MERCURY_ACH_SIGNING_SECRET || '').length >= 32);
}

function creationConfigured() {
  return credentialsConfigured() && process.env.MERCURY_ACH_ENABLED === 'true'
    && process.env.MERCURY_RESEARCH_APPROVED === 'true'
    && process.env.RESEARCH_COMMERCE_ENABLED === 'true';
}

async function capabilities() {
  // Only the production hosted payment URL is documented. Sandbox remains API-only
  // until its payer experience has been verified with an actual sandbox account.
  let available = environment() === 'production' && creationConfigured();
  if (available) {
    try { available = await redisCommand(['PING']) === 'PONG'; }
    catch (_) { available = false; }
  }
  return { available, provider: 'mercury', hosted: true, requiresResearchApproval: true,
    settlementNote: 'ACH payments typically post in 1–5 business days.' };
}

function prefix() { return `nxt:mercury-ach:v1:${environment()}:`; }
function orderKey(orderId) {
  if (!ORDER_ID.test(orderId)) throw new AchError('Invalid ACH order reference.', 400, 'invalid_order');
  return prefix() + 'order:' + orderId;
}
function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function moneyCents(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return NaN;
  const cents = Math.round(value * 100);
  return Number.isSafeInteger(cents) && Math.abs(value * 100 - cents) < 0.00001 ? cents : NaN;
}

async function limitRequests(req, scope, maximum) {
  const ip = String((req.headers || {})['x-vercel-forwarded-for'] || (req.headers || {})['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const identity = crypto.createHmac('sha256', process.env.MERCURY_ACH_SIGNING_SECRET || '').update(ip).digest('hex');
  const count = Number(await redisCommand(['EVAL', RATE_LIMIT, '1', prefix() + 'rate:' + scope + ':' + identity, '3600']));
  if (!Number.isFinite(count) || count > maximum) throw new AchError('Too many bank-payment requests. Please try again later.', 429, 'rate_limited');
}

async function mercury(path, { method = 'GET', body, deadline = Date.now() + 12_000 } = {}) {
  if (!credentialsConfigured()) throw new AchError('Bank payments are not configured. Please contact support.');
  const remaining = deadline - Date.now();
  if (remaining < 500) throw new AchError('The bank-payment request could not be confirmed. Retry this same order or contact support.', 503, 'request_timeout');
  const base = environment() === 'production' ? 'https://api.mercury.com/api/v1' : 'https://api-sandbox.mercury.com/api/v1';
  let response;
  try {
    response = await fetch(base + path, {
      method, redirect: 'error',
      headers: { Authorization: `Bearer ${process.env.MERCURY_API_TOKEN}`, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(Math.min(12_000, remaining)),
    });
  } catch (_) {
    throw new AchError('The bank-payment request could not be confirmed. Retry this same order or contact support.', 503, 'provider_connection');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || typeof data !== 'object') {
    throw new AchError('Mercury could not confirm this invoice. Please contact support before starting another payment.', 502, 'provider_response');
  }
  return data;
}

async function findResource(resource, match, deadline) {
  let cursor;
  const seen = new Set();
  for (let page = 0; page < 5; page++) {
    const query = new URLSearchParams({ limit: '1000', order: 'asc' });
    if (cursor) query.set('start_after', cursor);
    const data = await mercury(`/ar/${resource}?${query}`, { deadline });
    if (!Array.isArray(data[resource]) || !data.page || typeof data.page !== 'object') {
      throw new AchError('Mercury returned an incomplete lookup. Please retry this same order.', 502, 'incomplete_lookup');
    }
    const found = data[resource].find(match);
    if (found) return found;
    const next = data.page.nextPage;
    if (next === undefined || next === null) return null;
    if (!UUID.test(next) || seen.has(next)) throw new AchError('Mercury returned an incomplete lookup. Please contact support.', 502, 'incomplete_lookup');
    seen.add(next); cursor = next;
  }
  // Never interpret a partial lookup as permission to create another invoice.
  throw new AchError('The bank-payment lookup needs an operator review. Please contact support.', 503, 'lookup_limit');
}

function invoiceLines(order) {
  let gross = 0;
  const discount = Number(order.discountCents || 0);
  const lines = order.normalizedItems.map(item => {
    const prior = Math.round(gross * discount / order.subtotalCents);
    gross += item.lineCents;
    const allocation = Math.round(gross * discount / order.subtotalCents) - prior;
    return { name: `${item.quantity} × ${item.name} — ${item.label}${discount ? ' (email discount)' : ''}`.slice(0, 299),
      quantity: 1, unitPrice: (item.lineCents - allocation) / 100 };
  });
  if (order.shippingCents) lines.push({ name: rates.label(order.mode), quantity: 1, unitPrice: order.shippingCents / 100 });
  if (lines.some(line => !Number.isSafeInteger(moneyCents(line.unitPrice)) || line.unitPrice < 0)
    || lines.reduce((sum, line) => sum + moneyCents(line.unitPrice), 0) !== order.totalCents) {
    throw new AchError('The invoice total could not be verified.', 400, 'invalid_total');
  }
  return lines;
}

function buildInvoice(record) {
  const date = new Date(record.createdAt).toISOString().slice(0, 10);
  return { achDebitEnabled: true, ccEmails: [], creditCardEnabled: false, currencyCode: 'USD',
    customerId: record.customerId, destinationAccountId: record.destinationAccountId,
    dueDate: date, invoiceDate: date, invoiceNumber: record.orderId, lineItems: record.lineItems,
    sendEmailOption: 'DontSend', useRealAccountNumber: false,
    payerMemo: 'Laboratory research materials only. Payment does not authorize fulfillment. Review ordering terms at https://www.nxtlvl-research.com/ordering-policy.html.' };
}

function assertInvoice(invoice, record) {
  const sameLines = Array.isArray(invoice.lineItems) && invoice.lineItems.length === record.lineItems.length
    && invoice.lineItems.every((line, index) => line.name === record.lineItems[index].name && line.quantity === 1
      && moneyCents(line.unitPrice) === moneyCents(record.lineItems[index].unitPrice)
      && (line.salesTaxRate === undefined || line.salesTaxRate === null || line.salesTaxRate === 0));
  if (!UUID.test(invoice.id) || (record.invoiceId && invoice.id !== record.invoiceId)
    || invoice.invoiceNumber !== record.orderId || invoice.customerId !== record.customerId
    || invoice.destinationAccountId !== record.destinationAccountId || invoice.currencyCode !== 'USD'
    || moneyCents(invoice.amount) !== record.totalCents || invoice.achDebitEnabled !== true
    || !Object.hasOwn(STATUS, invoice.status) || typeof invoice.slug !== 'string'
    || !/^[A-Za-z0-9_-]{1,240}$/.test(invoice.slug) || !sameLines) {
    throw new AchError('The Mercury invoice differs from the reviewed order. Contact support before paying.', 409, 'invoice_mismatch');
  }
  return { ...record, invoiceId: invoice.id, slug: invoice.slug, status: STATUS[invoice.status],
    providerStatus: invoice.status, checkedAt: Date.now() };
}

async function saveRecord(record) {
  await redisCommand(['SET', orderKey(record.orderId), JSON.stringify(record)]);
}

function receiptToken(record) {
  const payload = Buffer.from(JSON.stringify({ v: 1, orderId: record.orderId, environment: record.environment,
    expiresAt: record.createdAt + RECEIPT_LIFETIME })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.MERCURY_ACH_SIGNING_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyReceipt(token) {
  const invalid = () => new AchError('This bank-payment receipt is invalid or expired. Contact support for its status.', 401, 'invalid_receipt');
  if (typeof token !== 'string' || token.length > 1024 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token)) throw invalid();
  const [payload, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', process.env.MERCURY_ACH_SIGNING_SECRET).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw invalid();
  let data;
  try { data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch (_) { throw invalid(); }
  if (data.v !== 1 || !ORDER_ID.test(data.orderId) || data.environment !== environment()
    || !Number.isFinite(data.expiresAt) || data.expiresAt <= Date.now()) throw invalid();
  return data;
}

function publicRecord(record) {
  return { orderId: record.orderId, totalCents: record.totalCents, status: record.status,
    invoiceUrl: record.environment === 'production' ? `https://app.mercury.com/pay/${record.slug}` : null,
    receiptToken: receiptToken(record), sandbox: record.environment === 'sandbox' };
}

async function refreshRecord(record, deadline) {
  const invoice = await mercury(`/ar/invoices/${record.invoiceId}`, { deadline });
  const current = assertInvoice(invoice, record);
  await saveRecord(current);
  return current;
}

async function createPayment({ order, customer, approval }) {
  if (!creationConfigured()) throw new AchError('Bank payments are not available yet. Please contact support.');
  const orderId = approval.orderId;
  const key = orderKey(orderId);
  const owner = crypto.randomUUID();
  const lock = key + ':lock';
  if (await redisCommand(['SET', lock, owner, 'NX', 'EX', '180']) !== 'OK') {
    throw new AchError('This bank-payment invoice is already being prepared. Retry this same order in a moment.', 409, 'request_busy');
  }
  try {
    const deadline = Date.now() + 45_000;
    const digest = hash(JSON.stringify({ itemDigest: order.itemDigest, customer: customerDigest(customer),
      totalCents: order.totalCents, mode: order.mode, approval: approval.reference }));
    const saved = await redisCommand(['GET', key]);
    let record = saved ? JSON.parse(saved) : null;
    if (record && (record.digest !== digest || record.environment !== environment()
      || record.destinationAccountId !== process.env.MERCURY_DESTINATION_ACCOUNT_ID)) {
      throw new AchError('This reviewed order already has a different bank-payment request. Contact support.', 409, 'order_mismatch');
    }
    if (record && record.invoiceId) return publicRecord(await refreshRecord(record, deadline));
    if (!record) {
      record = { orderId, digest, environment: environment(), createdAt: Date.now(),
        destinationAccountId: process.env.MERCURY_DESTINATION_ACCOUNT_ID,
        totalCents: order.totalCents, lineItems: invoiceLines(order), status: 'pending', approvalReference: approval.reference };
      // Persist intent before any external mutation. This survives response loss.
      await saveRecord(record);
    }
    if (!record.customerId) {
      let mercuryCustomer = await findResource('customers', entry => !entry.deletedAt
        && String(entry.email || '').toLowerCase() === customer.email.toLowerCase(), deadline);
      if (!mercuryCustomer) mercuryCustomer = await mercury('/ar/customers', {
        method: 'POST', body: { name: customer.name, email: customer.email }, deadline });
      if (!UUID.test(mercuryCustomer.id) || String(mercuryCustomer.email || '').toLowerCase() !== customer.email.toLowerCase()) {
        throw new AchError('Mercury did not confirm the invoice customer.', 502, 'invalid_customer');
      }
      record.customerId = mercuryCustomer.id;
      await saveRecord(record);
    }
    // invoiceNumber is unique in Mercury. Always reuse the approved order number,
    // including when a previous create succeeded but its response was lost.
    const prior = await findResource('invoices', entry => entry.invoiceNumber === orderId, deadline);
    let invoice;
    if (prior) {
      if (!UUID.test(prior.id)) throw new AchError('Mercury returned an invalid invoice reference.', 502, 'invalid_invoice');
      invoice = await mercury(`/ar/invoices/${prior.id}`, { deadline });
    } else {
      invoice = await mercury('/ar/invoices', { method: 'POST', body: buildInvoice(record), deadline });
    }
    record = assertInvoice(invoice, record);
    await saveRecord(record);
    return publicRecord(record);
  } finally {
    await redisCommand(['EVAL', RELEASE_LOCK, '1', lock, owner]).catch(() => {});
  }
}

async function paymentStatus(token) {
  // Stopping new invoices must not prevent checking existing payments.
  if (!credentialsConfigured()) throw new AchError('Bank-payment status is temporarily unavailable. Please contact support.');
  const receipt = verifyReceipt(token);
  const saved = await redisCommand(['GET', orderKey(receipt.orderId)]);
  if (!saved) throw new AchError('This bank-payment order could not be found. Please contact support.', 404, 'order_not_found');
  const record = JSON.parse(saved);
  if (!record.invoiceId || record.environment !== receipt.environment || record.orderId !== receipt.orderId) {
    throw new AchError('This bank-payment invoice has not been confirmed. Please contact support.', 409, 'invoice_pending');
  }
  return publicRecord(await refreshRecord(record));
}

module.exports = { AchError, environment, credentialsConfigured, creationConfigured, capabilities, limitRequests,
  invoiceLines, buildInvoice, assertInvoice, receiptToken, verifyReceipt, createPayment, paymentStatus, findResource };
