const test = require('node:test');
const assert = require('node:assert/strict');

process.env.CRYPTO_QUOTE_SECRET = 'test-only-quote-secret-that-is-long-enough';

const {
  ASSETS,
  amountForQuote,
  cleanCustomer,
  cleanTxid,
  customerDigest,
  normalizeOrder,
  signQuote,
  verifyQuote,
} = require('../lib/direct-payment');
const {
  TRANSFER_TOPIC,
  inspectBitcoinTransaction,
  inspectEthereumTransaction,
} = require('../lib/chain-verification');

test('uses the validated production receiving addresses', () => {
  assert.equal(ASSETS.BTC.address, 'bc1qqlvxgtn7rt4mchdwxmpldefauzfag28925jnrz');
  assert.equal(ASSETS.ETH.address, '0xcAB4A4f03D32dA598EfdAba944753415f4915281');
  assert.equal(ASSETS.USDT.address, ASSETS.ETH.address);
  assert.equal(ASSETS.USDT.contract, '0xdAC17F958D2ee523a2206206994597C13D831ec7');
});

test('recalculates cart prices from the trusted catalog', () => {
  const order = normalizeOrder([{ key: 'bpc157-10::0', qty: 2, price: 0.01 }], 'shipping');
  assert.equal(order.subtotalCents, 13000);
  assert.equal(order.shippingCents, 1000);
  assert.equal(order.totalCents, 14000);
  assert.equal(order.normalizedItems[0].unitCents, 6500);
});

test('signs temporary quotes and rejects tampering', () => {
  const payload = {
    v: 1, orderId: 'NXT-TEST', asset: 'BTC', address: ASSETS.BTC.address,
    amountUnits: '1000', amountDisplay: '0.00001000', confirmations: 1,
    totalCents: 100, itemDigest: 'digest', customerDigest: 'customer-digest', fulfillment: 'pickup',
    createdAt: Date.now(), expiresAt: Date.now() + 60_000,
  };
  const token = signQuote(payload);
  assert.deepEqual(verifyQuote(token), payload);
  assert.throws(() => verifyQuote(`${token.slice(0, -1)}x`), /authenticate|invalid/i);
});

test('binds a quote to normalized customer details and normalizes hashes by chain', () => {
  const customer = cleanCustomer({
    name: 'Test Buyer', email: 'buyer@example.com', phone: '555-555-0100',
  }, 'pickup');
  assert.match(customerDigest(customer), /^[a-f0-9]{64}$/);
  assert.equal(cleanTxid(`0x${'A'.repeat(64)}`, 'BTC'), 'a'.repeat(64));
  assert.equal(cleanTxid('B'.repeat(64), 'ETH'), `0x${'b'.repeat(64)}`);
  assert.equal(cleanTxid('C'.repeat(64), 'USDT'), `0x${'c'.repeat(64)}`);
});

test('adds a sub-cent USDT order fingerprint', () => {
  const result = amountForQuote('USDT', 1250, 1);
  const units = BigInt(result.amountUnits);
  assert.ok(units > 12_500_000n);
  assert.ok(units < 12_510_000n);
  assert.match(result.amountDisplay, /^12\.50\d{4}$/);
});

test('verifies an exact Bitcoin output and confirmation', () => {
  const now = Date.now();
  const quote = { asset: 'BTC', amountUnits: '25000', confirmations: 1, createdAt: now };
  const tx = {
    vout: [{ scriptpubkey_address: ASSETS.BTC.address, value: 25000 }],
    status: { confirmed: true, block_height: 100, block_time: Math.floor(now / 1000) },
  };
  const result = inspectBitcoinTransaction(tx, 100, quote);
  assert.equal(result.ok, true);
  assert.equal(result.status, 'paid');
  assert.equal(result.confirmations, 1);
});

test('rejects Bitcoin underpayments and overpayments for safe order matching', () => {
  const quote = { asset: 'BTC', amountUnits: '25000', confirmations: 1, createdAt: Date.now() };
  const under = inspectBitcoinTransaction({ vout: [{ scriptpubkey_address: ASSETS.BTC.address, value: 24999 }], status: { confirmed: false } }, 0, quote);
  const over = inspectBitcoinTransaction({ vout: [{ scriptpubkey_address: ASSETS.BTC.address, value: 25001 }], status: { confirmed: false } }, 0, quote);
  assert.equal(under.status, 'underpaid');
  assert.equal(over.status, 'overpaid');
});

test('verifies an exact native ETH transfer', () => {
  const now = Date.now();
  const quote = { asset: 'ETH', amountUnits: '123000000000000000', confirmations: 12, createdAt: now };
  const tx = { to: ASSETS.ETH.address, value: '0x1b4fbd92b5f8000' };
  const receipt = { status: '0x1', blockNumber: '0x64', logs: [] };
  const block = { timestamp: `0x${Math.floor(now / 1000).toString(16)}` };
  const result = inspectEthereumTransaction(tx, receipt, block, '0x6f', quote);
  assert.equal(result.ok, true);
  assert.equal(result.confirmations, 12);
});

test('verifies an exact ERC-20 USDT Transfer log to the receiving wallet', () => {
  const now = Date.now();
  const amount = 125_000_123n;
  const receiverTopic = `0x${ASSETS.USDT.address.toLowerCase().slice(2).padStart(64, '0')}`;
  const quote = { asset: 'USDT', amountUnits: amount.toString(), confirmations: 12, createdAt: now };
  const tx = { to: ASSETS.USDT.contract };
  const receipt = {
    status: '0x1', blockNumber: '0xc8',
    logs: [{ address: ASSETS.USDT.contract, topics: [TRANSFER_TOPIC, `0x${'1'.padStart(64, '0')}`, receiverTopic], data: `0x${amount.toString(16)}` }],
  };
  const block = { timestamp: `0x${Math.floor(now / 1000).toString(16)}` };
  const result = inspectEthereumTransaction(tx, receipt, block, '0xd3', quote);
  assert.equal(result.ok, true);
  assert.equal(result.status, 'paid');
});
