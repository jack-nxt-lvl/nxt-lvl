const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const handler = require('../api/stripe-card-webhook');
const { stripeConfigured, stripeMode } = require('../lib/hosted-card-link');

process.env.VERCEL_ENV = 'preview';
process.env.STRIPE_SECRET_KEY = 'rk_test_fixture_not_a_real_credential';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fixture_not_a_real_credential';
process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
process.env.UPSTASH_REDIS_REST_TOKEN = 'fixture';
process.env.RESEND_API_KEY = 'fixture';

function event(type = 'checkout.session.completed', changes = {}) {
  return {
    id: 'evt_first', type, livemode: false,
    data: { object: {
      id: 'cs_test_order', mode: 'payment', livemode: false,
      payment_status: 'paid', currency: 'usd', amount_total: 14200,
      client_reference_id: 'NXT-TEST-123',
      customer_details: { name: 'Research Buyer', email: 'buyer@example.com' },
      metadata: { source: 'nxt_hosted_card_link', fulfillment: 'shipping' },
      ...changes,
    } },
  };
}

async function deliver(value) {
  const body = Buffer.from(JSON.stringify(value));
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${body}`).digest('hex');
  const response = { code: 200, status(code) { this.code = code; return this; }, end(body) { this.body = body; return this; } };
  await handler({ method: 'POST', body, headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` } }, response);
  return response;
}

async function withServices(run) {
  const original = global.fetch;
  const state = { values: new Map(), emails: [], failEmail: false, failRedis: false, beforeEmail: null };
  global.fetch = async (url, options) => {
    if (url === process.env.UPSTASH_REDIS_REST_URL) {
      if (state.failRedis) throw new Error('Fixture outage');
      const [command, key, value, ...rest] = JSON.parse(options.body);
      let result;
      if (command === 'GET') result = state.values.get(key) || null;
      else if (command === 'SET') {
        if (rest.includes('NX') && state.values.has(key)) result = null;
        else { state.values.set(key, value); result = 'OK'; }
      } else if (command === 'EVAL') {
        const [leaseKey, owner] = rest;
        if (state.values.get(leaseKey) !== owner) result = 0;
        else if (key.includes("redis.call('DEL'")) { state.values.delete(leaseKey); result = 1; }
        else { state.values.set(leaseKey, 'DONE'); result = 1; }
      } else throw new Error(`Unexpected ledger operation ${command}`);
      return { ok: true, json: async () => ({ result }) };
    }
    assert.equal(url, 'https://api.resend.com/emails');
    const email = JSON.parse(options.body);
    if (state.beforeEmail) await state.beforeEmail(email);
    if (state.failEmail && email.to[0] === 'buyer@example.com') return { ok: false, json: async () => ({ message: 'Fixture email failure' }) };
    state.emails.push({ ...email, idempotencyKey: options.headers['Idempotency-Key'] });
    return { ok: true, json: async () => ({ id: `email-${state.emails.length}` }) };
  };
  try { await run(state); } finally { global.fetch = original; }
}

test('restricted keys work and preview/live credentials cannot cross environments', () => {
  const before = { key: process.env.STRIPE_SECRET_KEY, env: process.env.VERCEL_ENV };
  try {
    for (const prefix of ['rk', 'sk']) {
      for (const environment of ['preview', 'development', 'production']) {
        process.env.VERCEL_ENV = environment;
        for (const mode of ['test', 'live']) {
          process.env.STRIPE_SECRET_KEY = `${prefix}_${mode}_fixture_not_a_real_credential`;
          assert.equal(stripeConfigured(), mode === (environment === 'production' ? 'live' : 'test'));
        }
      }
    }
    process.env.STRIPE_SECRET_KEY = 'pk_test_fixture_not_a_real_credential';
    assert.equal(stripeMode(), null);
  } finally { process.env.STRIPE_SECRET_KEY = before.key; process.env.VERCEL_ENV = before.env; }
});

test('unpaid completion sends nothing; delayed success confirms payment once', async () => {
  await withServices(async state => {
    assert.equal((await deliver(event('checkout.session.completed', { payment_status: 'unpaid' }))).code, 200);
    assert.equal(state.emails.length, 0);
    assert.equal((await deliver(event('checkout.session.async_payment_succeeded'))).code, 200);
    assert.equal(state.emails.length, 2);
    assert.match(state.emails[0].subject, /CONFIRMED/);
    assert.match(state.emails[0].html, /142.00/);
    assert.match(state.emails[0].html, /not fulfillment approval/);
  });
});

test('different event IDs for one session do not repeat confirmation emails', async () => {
  await withServices(async state => {
    await deliver(event());
    const duplicate = event('checkout.session.async_payment_succeeded');
    duplicate.id = 'evt_second';
    assert.equal((await deliver(duplicate)).body, 'Already processed');
    assert.equal(state.emails.length, 2);
  });
});

test('partial notification failure retries the missing recipient only', async () => {
  await withServices(async state => {
    state.failEmail = true;
    assert.equal((await deliver(event())).code, 500);
    assert.equal(state.emails.length, 1);
    state.failEmail = false;
    assert.equal((await deliver(event())).code, 200);
    assert.equal(state.emails.length, 2);
    assert.equal(state.emails.filter(email => email.to[0] === 'buyer@example.com').length, 1);
    assert.equal(state.emails[0].idempotencyKey, 'nxt-card-paid-merchant-cs_test_order');
  });
});

test('in-progress duplicate returns a retryable status instead of dropping work', async () => {
  await withServices(async state => {
    state.values.set('nxt:card-link:v2:stripe-session:cs_test_order:paid', 'another-worker');
    assert.equal((await deliver(event())).code, 503);
    assert.equal(state.emails.length, 0);
  });
});

test('expired worker cannot overwrite or release the next worker lease', async () => {
  await withServices(async state => {
    const key = 'nxt:card-link:v2:stripe-session:cs_test_order:paid';
    state.beforeEmail = async () => { state.values.set(key, 'new-owner'); };
    assert.equal((await deliver(event())).code, 500);
    assert.equal(state.values.get(key), 'new-owner');
  });
});

test('ledger outage returns an error for Stripe to retry and sends no emails', async () => {
  await withServices(async state => {
    state.failRedis = true;
    assert.equal((await deliver(event())).code, 500);
    assert.equal(state.emails.length, 0);
  });
});

test('delayed failure notifies both parties once and never claims payment received', async () => {
  await withServices(async state => {
    const failed = event('checkout.session.async_payment_failed', { payment_status: 'unpaid' });
    assert.equal((await deliver(failed)).code, 200);
    assert.equal((await deliver({ ...failed, id: 'evt_duplicate_failure' })).code, 200);
    assert.equal(state.emails.length, 2);
    assert.match(state.emails[0].html, /Do not dispatch/);
    assert.match(state.emails[1].subject, /could not be completed/);
  });
});

test('a late failure cannot downgrade a confirmed payment', async () => {
  await withServices(async state => {
    await deliver(event());
    assert.equal((await deliver(event('checkout.session.async_payment_failed', { payment_status: 'unpaid' }))).body, 'Already paid');
    assert.equal(state.emails.length, 2);
  });
});

test('wrong mode, malformed totals and unrelated sessions cannot generate receipts', async () => {
  await withServices(async state => {
    assert.equal((await deliver({ ...event(), livemode: true })).code, 400);
    for (const changes of [{ livemode: true }, { amount_total: -100 }, { currency: 'eur' }, { id: '../bad' }, { mode: 'subscription' }]) {
      assert.equal((await deliver(event('checkout.session.completed', changes))).code, 400);
    }
    assert.equal((await deliver(event('checkout.session.completed', { metadata: {} }))).code, 200);
    assert.equal((await deliver(null)).code, 400);
    assert.equal(state.emails.length, 0);
  });
});
