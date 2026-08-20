const test = require('node:test');
const assert = require('node:assert/strict');

process.env.CRYPTO_QUOTE_SECRET = 'test-only-quote-secret-that-is-long-enough';
process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
process.env.RESEND_API_KEY = 'test-resend-key';

const {
  ASSETS,
  cleanCustomer,
  customerDigest,
  normalizeOrder,
  signQuote,
} = require('../lib/direct-payment');
const verifyHandler = require('../api/verify-direct-payment');
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[String(name).toLowerCase()] = value; },
    end(body) { this.body = body ? JSON.parse(body) : null; return this; },
  };
}

test('verifies, claims, and confirms a six-block canonical Bitcoin payment end to end', async () => {
  const originalFetch = global.fetch;
  const txid = 'd'.repeat(64);
  const blockHash = 'e'.repeat(64);
  const orderId = 'NXT-TEST-API-123';
  const items = [{ key: 'bpc157-10::0', qty: 1 }];
  const order = normalizeOrder(items, 'pickup');
  const customer = cleanCustomer({
    name: 'Checkout Test', email: 'buyer@example.com', phone: '555-555-0100',
  }, 'pickup');
  const amountUnits = '25000';
  const now = Date.now();
  const quoteToken = signQuote({
    v: 1,
    orderId,
    asset: 'BTC',
    address: ASSETS.BTC.address,
    amountUnits,
    amountDisplay: '0.00025000',
    confirmations: 1,
    totalCents: order.totalCents,
    itemDigest: order.itemDigest,
    customerDigest: customerDigest(customer),
    fulfillment: 'pickup',
    createdAt: now,
    expiresAt: now + 60_000,
  });

  const redisCommands = [];
  const blockchainUrls = [];
  const emailRequests = [];
  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target === process.env.UPSTASH_REDIS_REST_URL) {
      const command = JSON.parse(options.body);
      redisCommands.push(command);
      const key = String(command[3] || '');
      const result = key.includes('{claims}')
        ? ['CLAIMED', orderId]
        : (redisCommands.length === 1 ? [1, '', ''] : 1);
      return { ok: true, json: async () => ({ result }) };
    }
    if (target === 'https://api.resend.com/emails') {
      emailRequests.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ id: `email-${emailRequests.length}` }) };
    }
    if (target.includes('mempool.space') || target.includes('blockstream.info')) {
      blockchainUrls.push(target);
      if (target.endsWith(`/tx/${txid}`)) {
        return {
          ok: true,
          json: async () => ({
            txid,
            vin: [{ sequence: 0xffffffff }],
            vout: [{ scriptpubkey_address: ASSETS.BTC.address, value: Number(amountUnits) }],
            status: { confirmed: true, block_height: 100, block_hash: blockHash, block_time: Math.floor(now / 1000) },
          }),
        };
      }
      if (target.endsWith('/blocks/tip/height')) return { ok: true, text: async () => '105' };
      if (target.endsWith('/block-height/100')) return { ok: true, text: async () => blockHash };
    }
    throw new Error(`Unexpected test request: ${target}`);
  };

  try {
    const req = {
      method: 'POST',
      headers: { origin: 'https://www.nxtlvl-research.com' },
      body: { quoteToken, txid, items, fulfillment: 'pickup', customer },
    };
    const res = responseRecorder();
    await verifyHandler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'paid');
    assert.equal(res.body.orderId, orderId);
    assert.equal(res.body.confirmations, 6);
    assert.equal(res.body.confirmationsRequired, 6);
    assert.equal(res.body.durableDuplicateProtection, true);
    assert.equal(blockchainUrls.filter((url) => url.endsWith(`/tx/${txid}`)).length, 2);
    assert.equal(emailRequests.length, 2);
    assert.equal(redisCommands.filter((command) => String(command[3] || '').includes('{claims}')).length, 1);
    assert.equal(redisCommands.filter((command) => String(command[3] || '').includes('{verification}')).length, 2);
  } finally {
    global.fetch = originalFetch;
  }
});

test('requires finalized canonical agreement from two Ethereum RPCs before confirming USDT', async () => {
  const originalFetch = global.fetch;
  const txid = `0x${'f'.repeat(64)}`;
  const blockHash = `0x${'a'.repeat(64)}`;
  const orderId = 'NXT-TEST-USDT-456';
  const items = [{ key: 'bpc157-10::0', qty: 1 }];
  const order = normalizeOrder(items, 'pickup');
  const customer = cleanCustomer({
    name: 'Checkout Test', email: 'buyer@example.com', phone: '555-555-0100',
  }, 'pickup');
  const amountUnits = '65001234';
  const now = Date.now();
  const quoteToken = signQuote({
    v: 1,
    orderId,
    asset: 'USDT',
    address: ASSETS.USDT.address,
    amountUnits,
    amountDisplay: '65.001234',
    confirmations: 12,
    totalCents: order.totalCents,
    itemDigest: order.itemDigest,
    customerDigest: customerDigest(customer),
    fulfillment: 'pickup',
    createdAt: now,
    expiresAt: now + 60_000,
  });
  const recipientTopic = `0x${ASSETS.USDT.address.toLowerCase().slice(2).padStart(64, '0')}`;
  const rpcCalls = [];
  let redisCount = 0;
  let emailCount = 0;

  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target === process.env.UPSTASH_REDIS_REST_URL) {
      const command = JSON.parse(options.body);
      redisCount += 1;
      const key = String(command[3] || '');
      const result = key.includes('{claims}')
        ? ['CLAIMED', orderId]
        : (redisCount === 1 ? [1, '', ''] : 1);
      return { ok: true, json: async () => ({ result }) };
    }
    if (target === 'https://api.resend.com/emails') {
      emailCount += 1;
      return { ok: true, json: async () => ({ id: `email-${emailCount}` }) };
    }
    if (target.includes('publicnode.com') || target.includes('drpc.org')) {
      const request = JSON.parse(options.body);
      rpcCalls.push({ target, method: request.method, params: request.params });
      let result;
      if (request.method === 'eth_chainId') result = '0x1';
      if (request.method === 'eth_getTransactionByHash') {
        result = { hash: txid, to: ASSETS.USDT.contract, value: '0x0', blockHash, blockNumber: '0x64' };
      }
      if (request.method === 'eth_getTransactionReceipt') {
        result = {
          transactionHash: txid,
          status: '0x1',
          blockNumber: '0x64',
          blockHash,
          logs: [{
            address: ASSETS.USDT.contract,
            blockHash,
            removed: false,
            topics: [TRANSFER_TOPIC, `0x${'1'.padStart(64, '0')}`, recipientTopic],
            data: `0x${BigInt(amountUnits).toString(16)}`,
          }],
        };
      }
      if (request.method === 'eth_getBlockByNumber' && request.params[0] === 'latest') {
        result = { number: '0xa3', hash: `0x${'b'.repeat(64)}` };
      }
      if (request.method === 'eth_getBlockByNumber' && request.params[0] === 'finalized') {
        result = { number: '0x64', hash: blockHash };
      }
      if (request.method === 'eth_getBlockByNumber' && request.params[0] === '0x64') {
        result = { number: '0x64', hash: blockHash, timestamp: `0x${Math.floor(now / 1000).toString(16)}` };
      }
      return { ok: true, json: async () => ({ jsonrpc: '2.0', id: request.id, result }) };
    }
    throw new Error(`Unexpected test request: ${target}`);
  };

  try {
    const req = {
      method: 'POST',
      headers: { origin: 'https://www.nxtlvl-research.com' },
      body: { quoteToken, txid, items, fulfillment: 'pickup', customer },
    };
    const res = responseRecorder();
    await verifyHandler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'paid');
    assert.equal(res.body.confirmations, 64);
    assert.equal(res.body.confirmationsRequired, 64);
    assert.equal(emailCount, 2);
    assert.equal(rpcCalls.filter((call) => call.method === 'eth_getBlockByNumber' && call.params[0] === 'finalized').length, 2);
    assert.equal(new Set(rpcCalls.map((call) => call.target)).size, 2);
  } finally {
    global.fetch = originalFetch;
  }
});
