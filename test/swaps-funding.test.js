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

test('keeps beginner guidance and recovery controls in the direct checkout', () => {
  const source = readFileSync(join(__dirname, '..', 'direct-wallet-checkout.js'), 'utf8');
  assert.match(source, /How would you like to pay\?/);
  assert.match(source, /No crypto experience needed/);
  assert.match(source, /Choose the easiest way for you/);
  assert.match(source, /Buy USDT directly with Paybis/);
  assert.match(source, /Don.t have crypto\? Buy USDT through Paybis/);
  assert.match(source, /Buy USDT on Paybis/);
  assert.match(source, /PayPal/);
  assert.match(source, /ACH/);
  assert.match(source, /Debit card/);
  assert.match(source, /Credit card/);
  assert.match(source, /Apple Pay/);
  assert.match(source, /purchase enough to cover your order plus all provider and network fees/i);
  assert.match(source, /How we match your payment/i);
  assert.match(source, /small fractional ending identifies your order/i);
  assert.match(source, /small accepted buffer/i);
  assert.match(source, /Paybis is independent from NXT LVL/);
  assert.match(source, /Any Paybis account or wallet you create belongs to you/);
  assert.match(source, /Ethereum ERC-20 only/);
  assert.match(source, /data-intent="\$\{buyingFirst \? 'buy' : 'wallet'\}"/);
  assert.match(source, /nxt-wallet-headcoin/);
  assert.match(source, /Secure checkout/);
  assert.match(source, /data-copy-for-paybis/);
  assert.match(source, /target="_blank" rel="noopener noreferrer"/);
  assert.match(source, /openPaybisFunding/);
  assert.doesNotMatch(source, /window\.location\.assign\(url\)/);
  assert.match(source, /window\.addEventListener\('pageshow', restoreCheckout\)/);
  assert.match(source, /window\.addEventListener\('pagehide', stopTimers\)/);
  assert.doesNotMatch(source, /\b(?:Swaps|Transak)\b/);
  assert.doesNotMatch(source, /enter \$|for this \$|data-funding-usd|fundingAmountForInvoice|fee reserve/i);
  assert.doesNotMatch(source, /Pay with Card \/ Apple Pay|Buy enough with Card \/ Apple Pay/);
  assert.match(source, /make sure “You receive” is at least/);
  assert.match(source, /paste the transaction ID/i);
  assert.doesNotMatch(source, /window\.open\(/);
  assert.doesNotMatch(source, /nxtSwapsBuy/);
  assert.doesNotMatch(source, /pageshow[^\n]+once:\s*true/);
});

test('loads the Paybis link helper before the revised USDT checkout on every checkout path', () => {
  const homepage = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
  const checkoutUpgrade = readFileSync(join(__dirname, '..', 'customer-checkout-upgrade.js'), 'utf8');
  const fundingVersion = 'lib/paybis-funding.js?v=20260825-paybis-match-1';
  const checkoutVersion = 'direct-wallet-checkout.js?v=20260825-paybis-match-1';

  assert.match(homepage, /data-nxt-paybis-funding="1"/);
  assert.match(homepage, /data-nxt-direct-wallet="1"/);
  assert.match(homepage, /customer-checkout-upgrade\.js\?v=20260825-paybis-match-1/);
  assert.ok(homepage.indexOf(fundingVersion) < homepage.indexOf(checkoutVersion));
  assert.ok(checkoutUpgrade.indexOf(fundingVersion) < checkoutUpgrade.indexOf(checkoutVersion));
  assert.match(checkoutUpgrade, /ready:\(\)=>Boolean\(window\.NxtPaybisFunding\)/);
  assert.match(checkoutUpgrade, /script\[src\*="lib\/paybis-funding\.js"\]/);
  assert.match(checkoutUpgrade, /script\[src\*="direct-wallet-checkout\.js"\]/);
  assert.match(readFileSync(join(__dirname, '..', 'direct-wallet-checkout.js'), 'utf8'), /data-asset="USDT"\] \.nxt-wallet-usdt-buy\{order:-1\}/);
});
