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
  bitcoinSignalsRbf,
  findBitcoinCandidate,
  findUsdtLogCandidate,
  inspectBitcoinTransaction,
  inspectEthereumTransaction,
} = require('../lib/chain-verification');

test('uses the validated production receiving addresses', () => {
  assert.equal(ASSETS.BTC.address, 'bc1qqlvxgtn7rt4mchdwxmpldefauzfag28925jnrz');
  assert.equal(ASSETS.ETH.address, '0xcAB4A4f03D32dA598EfdAba944753415f4915281');
  assert.equal(ASSETS.USDT.address, ASSETS.ETH.address);
  assert.equal(ASSETS.USDT.contract, '0xdAC17F958D2ee523a2206206994597C13D831ec7');
  assert.equal(ASSETS.BTC.confirmations, 6);
  assert.equal(ASSETS.ETH.confirmations, 64);
  assert.equal(ASSETS.USDT.confirmations, 64);
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
  const [body, signature] = token.split('.');
  const replacement = signature[0] === 'a' ? 'b' : 'a';
  assert.throws(() => verifyQuote(`${body}.${replacement}${signature.slice(1)}`), /authenticate|invalid/i);
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

test('requires the server Bitcoin policy even when an old quote requests one confirmation', () => {
  const now = Date.now();
  const quote = { asset: 'BTC', amountUnits: '25000', confirmations: 1, createdAt: now };
  const blockHash = 'a'.repeat(64);
  const tx = {
    vin: [{ sequence: 0xffffffff }],
    vout: [{ scriptpubkey_address: ASSETS.BTC.address, value: 25000 }],
    status: { confirmed: true, block_height: 100, block_hash: blockHash, block_time: Math.floor(now / 1000) },
  };
  const result = inspectBitcoinTransaction(tx, 105, quote, blockHash);
  assert.equal(result.ok, true);
  assert.equal(result.status, 'paid');
  assert.equal(result.confirmations, 6);
  assert.equal(result.requiredConfirmations, 6);
});

test('never accepts a zero-confirmation RBF Bitcoin transaction', () => {
  const quote = { asset: 'BTC', amountUnits: '25000', confirmations: 1, createdAt: Date.now() };
  const tx = {
    vin: [{ sequence: 0xfffffffd }],
    vout: [{ scriptpubkey_address: ASSETS.BTC.address, value: 25000 }],
    status: { confirmed: false },
  };
  const result = inspectBitcoinTransaction(tx, 0, quote);
  assert.equal(bitcoinSignalsRbf(tx), true);
  assert.equal(result.ok, false);
  assert.equal(result.status, 'confirming');
  assert.equal(result.replaceable, true);
});

test('rejects a Bitcoin transaction whose block is no longer canonical', () => {
  const tx = {
    vin: [{ sequence: 0xffffffff }],
    vout: [{ scriptpubkey_address: ASSETS.BTC.address, value: 25000 }],
    status: { confirmed: true, block_height: 100, block_hash: 'a'.repeat(64) },
  };
  const result = inspectBitcoinTransaction(tx, 110, { asset: 'BTC', amountUnits: '25000', createdAt: Date.now() }, 'b'.repeat(64));
  assert.equal(result.ok, false);
  assert.equal(result.status, 'reorged');
});

test('automatically finds the exact Bitcoin payment and ignores other amounts', () => {
  const quote = { amountUnits: '25000' };
  const wrong = { txid: '1'.repeat(64), vout: [{ scriptpubkey_address: ASSETS.BTC.address, value: 24999 }] };
  const exact = { txid: '2'.repeat(64), vout: [{ scriptpubkey_address: ASSETS.BTC.address, value: 25000 }] };
  assert.equal(findBitcoinCandidate([wrong, exact], quote), exact);
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
  const blockHash = `0x${'a'.repeat(64)}`;
  const tx = { to: ASSETS.ETH.address, value: '0x1b4fbd92b5f8000', blockHash };
  const receipt = { status: '0x1', blockNumber: '0x64', blockHash, logs: [] };
  const block = { hash: blockHash, timestamp: `0x${Math.floor(now / 1000).toString(16)}` };
  const result = inspectEthereumTransaction(tx, receipt, block, '0xa3', quote, '0x64');
  assert.equal(result.ok, true);
  assert.equal(result.confirmations, 64);
  assert.equal(result.finalized, true);
});

test('does not accept an Ethereum transaction before its block is finalized', () => {
  const blockHash = `0x${'b'.repeat(64)}`;
  const quote = { asset: 'ETH', amountUnits: '1', confirmations: 1, createdAt: Date.now() };
  const tx = { to: ASSETS.ETH.address, value: '0x1', blockHash };
  const receipt = { status: '0x1', blockNumber: '0x64', blockHash, logs: [] };
  const block = { hash: blockHash, timestamp: `0x${Math.floor(Date.now() / 1000).toString(16)}` };
  const result = inspectEthereumTransaction(tx, receipt, block, '0xc8', quote, '0x63');
  assert.equal(result.ok, false);
  assert.equal(result.status, 'confirming');
  assert.equal(result.finalized, false);
  assert.equal(result.requiredConfirmations, 64);
});

test('verifies an exact ERC-20 USDT Transfer log to the receiving wallet', () => {
  const now = Date.now();
  const amount = 125_000_123n;
  const blockHash = `0x${'c'.repeat(64)}`;
  const receiverTopic = `0x${ASSETS.USDT.address.toLowerCase().slice(2).padStart(64, '0')}`;
  const quote = { asset: 'USDT', amountUnits: amount.toString(), confirmations: 12, createdAt: now };
  const tx = { to: ASSETS.USDT.contract, blockHash };
  const receipt = {
    status: '0x1', blockNumber: '0xc8', blockHash,
    logs: [{ address: ASSETS.USDT.contract, blockHash, topics: [TRANSFER_TOPIC, `0x${'1'.padStart(64, '0')}`, receiverTopic], data: `0x${amount.toString(16)}` }],
  };
  const block = { hash: blockHash, timestamp: `0x${Math.floor(now / 1000).toString(16)}` };
  const result = inspectEthereumTransaction(tx, receipt, block, '0x107', quote, '0xc8');
  assert.equal(result.ok, true);
  assert.equal(result.status, 'paid');
});

test('automatically finds the exact official ERC-20 USDT transfer log', () => {
  const amount = 65_003_479n;
  const receiverTopic = `0x${ASSETS.USDT.address.toLowerCase().slice(2).padStart(64, '0')}`;
  const wrong = {
    address: ASSETS.USDT.contract,
    transactionHash: `0x${'3'.repeat(64)}`,
    topics: [TRANSFER_TOPIC, `0x${'1'.padStart(64, '0')}`, receiverTopic],
    data: `0x${(amount - 1n).toString(16)}`,
  };
  const exact = {
    address: ASSETS.USDT.contract,
    transactionHash: `0x${'4'.repeat(64)}`,
    topics: [TRANSFER_TOPIC, `0x${'2'.padStart(64, '0')}`, receiverTopic],
    data: `0x${amount.toString(16)}`,
  };
  assert.equal(findUsdtLogCandidate([wrong, exact], { amountUnits: amount.toString() }), exact);
});
