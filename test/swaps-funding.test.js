const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const paybisFunding = require('../lib/paybis-funding');
const {
  CHECKOUT_ORIGINS,
  buildCheckoutUrl,
} = paybisFunding;

test('builds a direct Paybis purchase link without putting order data in the URL', () => {
  const url = new URL(buildCheckoutUrl({ asset: 'usdt' }));
  assert.equal(CHECKOUT_ORIGINS.USDT, 'https://paybis.com/buy-tether/');
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'paybis.com');
  assert.equal(url.pathname, '/buy-tether/');
  assert.deepEqual([...url.searchParams.keys()], []);
  assert.equal(buildCheckoutUrl({ asset: 'ETH' }), 'https://paybis.com/buy-ethereum/');
  assert.equal(buildCheckoutUrl({ asset: 'BTC' }), 'https://paybis.com/');
});

test('never puts the receiving wallet, customer data, or unsupported payment flags in the public URL', () => {
  const address = 'bc1qqlvxgtn7rt4mchdwxmpldefauzfag28925jnrz';
  const url = buildCheckoutUrl({
    asset: 'USDT',
    invoiceUsd: '1000.12',
    address,
    customerEmail: 'buyer@example.com',
    applePay: true,
  });
  assert.doesNotMatch(url, new RegExp(address, 'i'));
  assert.doesNotMatch(url, /buyer%40example\.com|applePay|walletAddress|address=/i);
});

test('rejects unsupported assets', () => {
  assert.throws(() => buildCheckoutUrl({ asset: 'SOL' }), /unsupported/i);
});

test('does not expose or configure a popup window flow', () => {
  assert.equal(paybisFunding.popupFeatures, undefined);
});

test('keeps direct wallet payment first and optional provider guidance separate', () => {
  const source = readFileSync(join(__dirname, '..', 'direct-wallet-checkout.js'), 'utf8');
  assert.match(source, /Pay now with/);
  assert.match(source, /Ethereum \(ERC-20\) only/);
  assert.match(source, /Copy amount/);
  assert.match(source, /Copy address/);
  assert.match(source, /I sent payment — check status/);
  assert.match(source, /Opening Paybis does not pay this order/);
  assert.match(source, /provider and network fees/);
  assert.match(source, /make sure “You receive” is at least/);
  assert.match(source, /Do not send after the timer expires/);
  assert.match(source, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(source, /window\.open\(|window\.location\.assign/);
});

test('loads optional Paybis help on the homepage without making it a direct-payment prerequisite', () => {
  const homepage = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
  const checkoutUpgrade = readFileSync(join(__dirname, '..', 'customer-checkout-upgrade.js'), 'utf8');
  const fundingVersion = 'lib/paybis-funding.js?v=20260825-paybis-match-1';
  const checkoutVersion = 'direct-wallet-checkout.js?v=20261109-email-offer';

  assert.match(homepage, /data-nxt-paybis-funding="1"/);
  assert.match(homepage, /data-nxt-direct-wallet="1"/);
  assert.match(homepage, /customer-checkout-upgrade\.js\?v=20261112-delivery/);
  assert.ok(homepage.indexOf(fundingVersion) < homepage.indexOf(checkoutVersion));
  assert.ok(checkoutUpgrade.includes(checkoutVersion));
  assert.doesNotMatch(checkoutUpgrade, /ready:\(\)=>Boolean\(window\.NxtPaybisFunding\)/);
  assert.match(checkoutUpgrade, /script\[src\*="direct-wallet-checkout\.js"\]/);

});

