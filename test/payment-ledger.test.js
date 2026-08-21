const test = require('node:test');
const assert = require('node:assert/strict');

const {
  PaymentLedgerError,
  acquirePaymentLock,
  claimPayment,
  flagPaymentForReview,
  ledgerCredentials,
  releasePaymentLock,
  reserveQuoteAmount,
} = require('../lib/payment-ledger');

function withLedgerEnvironment(fn) {
  return async () => {
    const saved = {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      kvUrl: process.env.KV_REST_API_URL,
      kvToken: process.env.KV_REST_API_TOKEN,
      fetch: global.fetch,
    };
    try {
      await fn();
    } finally {
      if (saved.url === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
      else process.env.UPSTASH_REDIS_REST_URL = saved.url;
      if (saved.token === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
      else process.env.UPSTASH_REDIS_REST_TOKEN = saved.token;
      if (saved.kvUrl === undefined) delete process.env.KV_REST_API_URL;
      else process.env.KV_REST_API_URL = saved.kvUrl;
      if (saved.kvToken === undefined) delete process.env.KV_REST_API_TOKEN;
      else process.env.KV_REST_API_TOKEN = saved.kvToken;
      global.fetch = saved.fetch;
    }
  };
}

test('fails closed when the durable payment ledger is not configured', withLedgerEnvironment(async () => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  assert.throws(() => ledgerCredentials(), PaymentLedgerError);
}));

test('atomically locks both the transaction and order before verification', withLedgerEnvironment(async () => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  const commands = [];
  global.fetch = async (_url, options) => {
    commands.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ result: commands.length === 1 ? [1, '', ''] : 1 }) };
  };

  const lease = await acquirePaymentLock('BTC', 'a'.repeat(64), 'NXT-TEST-123');
  assert.match(lease.owner, /^NXT-TEST-123:/);
  assert.equal(commands[0][0], 'EVAL');
  assert.equal(commands[0][2], '2');
  assert.match(commands[0][3], /\{verification\}:tx:btc-mainnet/);
  assert.match(commands[0][4], /\{verification\}:order:NXT-TEST-123/);

  await releasePaymentLock(lease);
  assert.equal(commands[1][0], 'EVAL');
}));

test('permanently binds one transaction to one order with no expiry', withLedgerEnvironment(async () => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  let command;
  global.fetch = async (_url, options) => {
    command = JSON.parse(options.body);
    return { ok: true, json: async () => ({ result: ['CLAIMED', 'NXT-TEST-456'] }) };
  };

  const result = await claimPayment('USDT', `0x${'b'.repeat(64)}`, 'NXT-TEST-456');
  assert.equal(result.status, 'CLAIMED');
  assert.equal(result.durable, true);
  assert.equal(command[0], 'EVAL');
  assert.equal(command[2], '3');
  assert.doesNotMatch(command.join(' '), /\bEX\b|\bPX\b/);
  assert.match(command[3], /\{claims\}:tx:eth-mainnet/);
  assert.match(command[4], /\{claims\}:order:NXT-TEST-456/);
}));

test('durably binds a severe underpayment to one manual-review order', withLedgerEnvironment(async () => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  let command;
  global.fetch = async (_url, options) => {
    command = JSON.parse(options.body);
    return { ok: true, json: async () => ({ result: ['FLAGGED', 'NXT-REVIEW-123'] }) };
  };

  const result = await flagPaymentForReview('BTC', 'c'.repeat(64), 'NXT-REVIEW-123');
  assert.equal(result.status, 'FLAGGED');
  assert.equal(result.durable, true);
  assert.equal(command[0], 'EVAL');
  assert.equal(command[2], '4');
  assert.match(command[5], /\{claims\}:review:tx:btc-mainnet/);
  assert.match(command[6], /\{claims\}:review:order:NXT-REVIEW-123/);
  assert.doesNotMatch(command.join(' '), /\bEX\b|\bPX\b/);
}));

test('reserves an exact quote amount with NX and a bounded expiry', withLedgerEnvironment(async () => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  let command;
  global.fetch = async (_url, options) => {
    command = JSON.parse(options.body);
    return { ok: true, json: async () => ({ result: 'OK' }) };
  };

  const reserved = await reserveQuoteAmount('BTC', '123456', 'NXT-TEST-789', 3_600_000);
  assert.equal(reserved, true);
  assert.deepEqual(command.slice(-3), ['NX', 'PX', '3600000']);
  assert.match(command[1], /\{amounts\}:btc-mainnet:123456/);
}));
