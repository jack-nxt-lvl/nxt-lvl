const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const swapsFunding = require('../lib/swaps-funding');
const {
  CHECKOUT_ORIGIN,
  buildCheckoutUrl,
} = swapsFunding;

test('builds a Swaps receive-amount buy link with only supported parameters', () => {
  const url = new URL(buildCheckoutUrl({ asset: 'btc', amount: '0.00109879' }));
  assert.equal(CHECKOUT_ORIGIN, 'https://www.swaps.app/');
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'www.swaps.app');
  assert.deepEqual([...url.searchParams.keys()], ['side', 'to', 'amount', 'input']);
  assert.equal(url.searchParams.get('side'), 'buy');
  assert.equal(url.searchParams.get('to'), 'BTC');
  assert.equal(url.searchParams.get('amount'), '0.00109879');
  assert.equal(url.searchParams.get('input'), 'receive');
});

test('never puts the receiving wallet, customer data, or unsupported payment flags in the public URL', () => {
  const address = 'bc1qqlvxgtn7rt4mchdwxmpldefauzfag28925jnrz';
  const url = buildCheckoutUrl({
    asset: 'USDT',
    amount: '1000.123456',
    address,
    customerEmail: 'buyer@example.com',
    applePay: true,
  });
  assert.doesNotMatch(url, new RegExp(address, 'i'));
  assert.doesNotMatch(url, /buyer%40example\.com|applePay|walletAddress|address=/i);
});

test('rejects unsupported assets and malformed amounts', () => {
  assert.throws(() => buildCheckoutUrl({ asset: 'SOL', amount: '1' }), /unsupported/i);
  assert.throws(() => buildCheckoutUrl({ asset: 'BTC', amount: '-1' }), /invalid/i);
  assert.throws(() => buildCheckoutUrl({ asset: 'ETH', amount: '1e3' }), /invalid/i);
  assert.throws(() => buildCheckoutUrl({ asset: 'USDT', amount: '1&address=evil' }), /invalid/i);
});

test('does not expose or configure a popup window flow', () => {
  assert.equal(swapsFunding.popupFeatures, undefined);
});

test('keeps beginner guidance and recovery controls in the direct checkout', () => {
  const source = readFileSync(join(__dirname, '..', 'direct-wallet-checkout.js'), 'utf8');
  assert.match(source, /How would you like to pay\?/);
  assert.match(source, /No crypto experience needed/);
  assert.match(source, /Choose the easiest way for you/);
  assert.match(source, /Pay with Card \/ Apple Pay/);
  assert.match(source, /Open Swaps — keep checkout open/);
  assert.match(source, /data-intent="\$\{buyingFirst \? 'buy' : 'wallet'\}"/);
  assert.match(source, /It copies automatically/);
  assert.match(source, /nxt-wallet-headcoin/);
  assert.match(source, /Secure checkout/);
  assert.match(source, /data-copy-for-swaps/);
  assert.match(source, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(source, /window\.location\.assign\(url\)/);
  assert.match(source, /SWAPS_RETURN_KEY/);
  assert.match(source, /resumeAfterSwapsReturn/);
  assert.match(source, /window\.addEventListener\('pageshow', restoreCheckout\)/);
  assert.match(source, /window\.addEventListener\('pagehide', stopTimers\)/);
  assert.match(source, /copyForSwapsWithoutBlocking/);
  assert.match(source, /link\.href = url;[\s\S]{0,320}copyForSwapsWithoutBlocking\(quote\.address\)/);
  assert.match(source, /closeActive\(\);[\s\S]{0,180}renderPayment\(saved\.quote/);
  assert.match(source, /this NXT LVL checkout and automatic payment detection stay open/);
  assert.doesNotMatch(source, /window\.open\(/);
  assert.doesNotMatch(source, /data-swaps-fallback|nxtSwapsBuy/);
  assert.doesNotMatch(source, /pageshow[^\n]+once:\s*true/);
  assert.match(source, /Keep this checkout open.we detect the incoming payment automatically/i);
  assert.match(source, /transaction ID from Swaps/i);
});
