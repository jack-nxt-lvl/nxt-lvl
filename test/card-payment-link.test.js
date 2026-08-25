const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

process.env.CRYPTO_QUOTE_SECRET = 'test-only-quote-secret-that-is-long-enough';
process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_1234567890abcdefghijklmnop';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_1234567890abcdefghijklmnop';

const { cleanCustomer, normalizeOrder } = require('../lib/direct-payment');
const { normalizePhone } = require('../lib/sms');
const {
  buildStripeCheckoutForm,
  cardLinkCapabilities,
} = require('../lib/hosted-card-link');
const createCardLinkHandler = require('../api/create-card-payment-link');
const stripeWebhookHandler = require('../api/stripe-card-webhook');

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[String(name).toLowerCase()] = value; return this; },
    end(body) {
      if (!body) this.body = null;
      else {
        try { this.body = JSON.parse(body); } catch (_) { this.body = String(body); }
      }
      return this;
    },
  };
}

function sampleOrder() {
  const order = normalizeOrder([{ key: 'bpc157-10::0', qty: 2 }], 'shipping');
  const customer = cleanCustomer({
    name: 'Hosted Checkout Test',
    email: 'buyer@example.com',
    phone: '(555) 555-0100',
    address: '100 Test Street',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
  }, order.mode);
  return { order, customer };
}

test('normalizes US and international mobile numbers for transactional texts', () => {
  assert.equal(normalizePhone('(754) 290-7210'), '+17542907210');
  assert.equal(normalizePhone('+44 7700 900123'), '+447700900123');
  assert.throws(() => normalizePhone('1234'), /valid mobile number/i);
});

test('builds an order-specific card-only hosted checkout from trusted catalog totals', () => {
  const { order, customer } = sampleOrder();
  const form = buildStripeCheckoutForm({ order, customer, orderId: 'NXT-CARD-TEST-123' });
  assert.equal(form.get('ui_mode'), 'hosted');
  assert.equal(form.get('payment_method_types[0]'), 'card');
  assert.equal(form.get('customer_email'), customer.email);
  assert.equal(form.get('line_items[0][price_data][unit_amount]'), '6500');
  assert.equal(form.get('line_items[0][quantity]'), '2');
  assert.equal(form.get('line_items[1][price_data][unit_amount]'), '1000');
  assert.match(form.get('success_url'), /card_payment=success/);
  assert.equal(form.get('metadata[source]'), 'nxt_hosted_card_link');
  assert.equal(order.totalCents, 14000);
});

test('shows email delivery only when the hosted provider, webhook, ledger, and sender are configured', () => {
  const capabilities = cardLinkCapabilities();
  assert.deepEqual(capabilities, { available: true, email: true, sms: false, both: false, hosted: true });

  const previous = process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  assert.equal(cardLinkCapabilities().available, false);
  process.env.STRIPE_WEBHOOK_SECRET = previous;
});

test('keeps card details off-site and exposes only delivery choices in the customer UI', () => {
  const source = require('fs').readFileSync(require('path').join(__dirname, '..', 'customer-checkout-upgrade.js'), 'utf8');
  assert.match(source, /Pay with crypto now/);
  assert.match(source, /Send me a card link/);
  assert.match(source, /data-channel="both"/);
  assert.match(source, /email, text, or both/i);
  assert.match(source, /card information is never entered or processed on NXT LVL/i);
  assert.match(source, /one transactional payment-link text/i);
  assert.match(source, /\/lib\/swaps-funding\.js\?v=20260824-ach-only-4/);
  assert.match(source, /\/direct-wallet-checkout\.js\?v=20260824-ach-only-7/);
  assert.ok(source.indexOf("src:'/lib/swaps-funding.js") < source.indexOf("src:'/direct-wallet-checkout.js"));
  assert.doesNotMatch(source, /cardNumber|cvc|expiryMonth|payment-element/i);
});

test('sends the same private hosted link by both email and text when the customer chooses both', async () => {
  const originalFetch = global.fetch;
  const previous = {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM_NUMBER,
  };
  process.env.TWILIO_ACCOUNT_SID = `AC${'1'.repeat(32)}`;
  process.env.TWILIO_AUTH_TOKEN = 'test-token';
  process.env.TWILIO_FROM_NUMBER = '+17542907210';
  const emailRequests = [];
  const smsRequests = [];

  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target === process.env.UPSTASH_REDIS_REST_URL) {
      const command = JSON.parse(options.body);
      if (command[0] === 'EVAL' && String(command[1]).includes("redis.call('INCR'")) {
        return { ok: true, json: async () => ({ result: 1 }) };
      }
      return { ok: true, json: async () => ({ result: 'OK' }) };
    }
    if (target === 'https://api.stripe.com/v1/checkout/sessions') {
      return { ok: true, json: async () => ({ id: 'cs_test_both', url: 'https://checkout.stripe.com/c/pay/cs_test_both', expires_at: 123456 }) };
    }
    if (target === 'https://api.resend.com/emails') {
      emailRequests.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ id: `email-${emailRequests.length}` }) };
    }
    if (/^https:\/\/api\.twilio\.com\//.test(target)) {
      smsRequests.push(String(options.body));
      return { ok: true, json: async () => ({ sid: 'SM_test_both', to: '+15555550100' }) };
    }
    throw new Error(`Unexpected request: ${target}`);
  };

  try {
    const req = {
      method: 'POST',
      headers: { origin: 'https://www.nxtlvl-research.com', 'x-forwarded-for': '203.0.113.26' },
      body: {
        requestId: '123e4567-e89b-12d3-a456-426614174002',
        items: [{ key: 'bpc157-10::0', qty: 1 }],
        fulfillment: 'shipping',
        customer: sampleOrder().customer,
        channel: 'both',
        smsConsent: true,
      },
    };
    const res = responseRecorder();
    await createCardLinkHandler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.sent, true);
    assert.equal(res.body.channel, 'both');
    assert.match(res.body.destination, /buyer@example\.com and .*0100/);
    assert.equal(Object.hasOwn(res.body, 'url'), false);
    assert.equal(emailRequests.length, 2);
    assert.match(emailRequests[0].html, /checkout\.stripe\.com/);
    assert.equal(smsRequests.length, 1);
    assert.match(smsRequests[0], /checkout\.stripe\.com%2Fc%2Fpay%2Fcs_test_both/);
  } finally {
    global.fetch = originalFetch;
    if (previous.sid === undefined) delete process.env.TWILIO_ACCOUNT_SID; else process.env.TWILIO_ACCOUNT_SID = previous.sid;
    if (previous.token === undefined) delete process.env.TWILIO_AUTH_TOKEN; else process.env.TWILIO_AUTH_TOKEN = previous.token;
    if (previous.from === undefined) delete process.env.TWILIO_FROM_NUMBER; else process.env.TWILIO_FROM_NUMBER = previous.from;
  }
});

test('creates and emails a hosted link without returning the private checkout URL to the browser', async () => {
  const originalFetch = global.fetch;
  const redisCommands = [];
  const stripeRequests = [];
  const emailRequests = [];
  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target === process.env.UPSTASH_REDIS_REST_URL) {
      const command = JSON.parse(options.body);
      redisCommands.push(command);
      if (command[0] === 'EVAL' && String(command[1]).includes("redis.call('INCR'")) {
        return { ok: true, json: async () => ({ result: 1 }) };
      }
      return { ok: true, json: async () => ({ result: 'OK' }) };
    }
    if (target === 'https://api.stripe.com/v1/checkout/sessions') {
      stripeRequests.push(options);
      return { ok: true, json: async () => ({ id: 'cs_test_nxt', url: 'https://checkout.stripe.com/c/pay/cs_test_nxt', expires_at: 123456 }) };
    }
    if (target === 'https://api.resend.com/emails') {
      emailRequests.push({ headers: options.headers, body: JSON.parse(options.body) });
      return { ok: true, json: async () => ({ id: `email-${emailRequests.length}` }) };
    }
    throw new Error(`Unexpected request: ${target}`);
  };

  try {
    const req = {
      method: 'POST',
      headers: { origin: 'https://www.nxtlvl-research.com', 'x-forwarded-for': '203.0.113.25' },
      body: {
        requestId: '123e4567-e89b-12d3-a456-426614174000',
        items: [{ key: 'bpc157-10::0', qty: 2 }],
        fulfillment: 'shipping',
        customer: sampleOrder().customer,
        channel: 'email',
        smsConsent: false,
      },
    };
    const res = responseRecorder();
    await createCardLinkHandler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.sent, true);
    assert.equal(res.body.channel, 'email');
    assert.equal(Object.hasOwn(res.body, 'url'), false);
    assert.equal(stripeRequests.length, 1);
    assert.match(String(stripeRequests[0].headers['Idempotency-Key']), /123e4567/);
    assert.match(String(stripeRequests[0].body), /payment_method_types%5B0%5D=card/);
    assert.equal(emailRequests.length, 2);
    assert.match(emailRequests[0].body.html, /checkout\.stripe\.com/);
    assert.doesNotMatch(emailRequests[1].body.html, /checkout\.stripe\.com/);
    assert.ok(redisCommands.some((command) => command[0] === 'SET' && command.includes('NX')));
  } finally {
    global.fetch = originalFetch;
  }
});

test('requires explicit consent before sending a payment link by text', async () => {
  const previous = {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM_NUMBER,
  };
  process.env.TWILIO_ACCOUNT_SID = `AC${'1'.repeat(32)}`;
  process.env.TWILIO_AUTH_TOKEN = 'test-token';
  process.env.TWILIO_FROM_NUMBER = '+17542907210';
  try {
    const req = {
      method: 'POST',
      headers: { origin: 'https://www.nxtlvl-research.com' },
      body: {
        requestId: '123e4567-e89b-12d3-a456-426614174001',
        items: [{ key: 'bpc157-10::0', qty: 1 }],
        fulfillment: 'pickup',
        customer: { name: 'Test', email: 'buyer@example.com', phone: '7542907210' },
        channel: 'sms',
        smsConsent: false,
      },
    };
    const res = responseRecorder();
    await createCardLinkHandler(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /consent/i);
  } finally {
    if (previous.sid === undefined) delete process.env.TWILIO_ACCOUNT_SID; else process.env.TWILIO_ACCOUNT_SID = previous.sid;
    if (previous.token === undefined) delete process.env.TWILIO_AUTH_TOKEN; else process.env.TWILIO_AUTH_TOKEN = previous.token;
    if (previous.from === undefined) delete process.env.TWILIO_FROM_NUMBER; else process.env.TWILIO_FROM_NUMBER = previous.from;
  }
});

test('verifies the signed raw Stripe webhook and ignores forged payloads', () => {
  const payload = Buffer.from(JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed' }));
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${payload}`).digest('hex');
  assert.equal(stripeWebhookHandler.verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, process.env.STRIPE_WEBHOOK_SECRET, timestamp), true);
  assert.equal(stripeWebhookHandler.verifyStripeSignature(payload, `t=${timestamp},v1=${'0'.repeat(64)}`, process.env.STRIPE_WEBHOOK_SECRET, timestamp), false);
  assert.equal(stripeWebhookHandler.verifyStripeSignature(payload, `t=${timestamp - 600},v1=${signature}`, process.env.STRIPE_WEBHOOK_SECRET, timestamp), false);
});
