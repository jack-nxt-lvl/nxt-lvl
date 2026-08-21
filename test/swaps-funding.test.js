const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const {
  CHECKOUT_ORIGIN,
  buildCheckoutUrl,
  popupFeatures,
} = require('../lib/swaps-funding');

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

test('requests a compact resizable window against the right side of the screen', () => {
  const features = popupFeatures(
    { availWidth: 1440, availHeight: 900, availLeft: 0, availTop: 0 },
    { outerWidth: 1200, outerHeight: 800, screenX: 0, screenY: 0 },
  );
  assert.match(features, /popup=yes/);
  assert.match(features, /resizable=yes/);
  assert.match(features, /width=540/);
  assert.match(features, /height=872/);
  assert.match(features, /left=890/);
  assert.match(features, /top=14/);
});

test('keeps beginner guidance and recovery controls in the direct checkout', () => {
  const source = readFileSync(join(__dirname, '..', 'direct-wallet-checkout.js'), 'utf8');
  assert.match(source, /Paying by card or Apple Pay\?/);
  assert.match(source, /Choose BTC, ETH, or USDT below/);
  assert.match(source, /No crypto yet\? Buy it here/);
  assert.match(source, /Buy .* with Card \/ Apple Pay/);
  assert.match(source, /It copies automatically/);
  assert.match(source, /nxt-wallet-headcoin/);
  assert.match(source, /Secure checkout/);
  assert.match(source, /data-copy-for-swaps/);
  assert.match(source, /Keep this checkout open for confirmation/);
  assert.match(source, /data-swaps-fallback/);
  assert.match(source, /nxt-swaps-drawer/);
  assert.match(source, /data-swaps-launch/);
  assert.match(source, /right-side Swaps panel/);
  assert.match(source, /window\.open\(url, 'nxtSwapsBuy'/);
  assert.doesNotMatch(source, /window\.open\([^,]+,\s*['_"]_blank/);
  assert.match(source, /detect the incoming payment automatically/i);
  assert.match(source, /transaction ID from Swaps/i);
});
