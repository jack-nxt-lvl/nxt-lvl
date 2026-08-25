const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const swapsFunding = require('../lib/swaps-funding');
const {
  CHECKOUT_ORIGIN,
  buildCheckoutUrl,
  fundingAmountForInvoice,
} = swapsFunding;

test('builds a fee-buffered Swaps purchase link with only supported public parameters', () => {
  const url = new URL(buildCheckoutUrl({ asset: 'usdt', invoiceUsd: '20.00' }));
  assert.equal(CHECKOUT_ORIGIN, 'https://www.swaps.app/buy');
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'www.swaps.app');
  assert.equal(url.pathname, '/buy');
  assert.deepEqual([...url.searchParams.keys()], ['side', 'to', 'amount']);
  assert.equal(url.searchParams.get('side'), 'buy');
  assert.equal(url.searchParams.get('to'), 'USDT');
  assert.equal(url.searchParams.get('amount'), '25.00');
});

test('grosses up the card spend for percentage and fixed provider fees', () => {
  assert.equal(fundingAmountForInvoice('20.00'), '25.00');
  assert.equal(fundingAmountForInvoice('100.00'), '110.11');
  assert.equal(fundingAmountForInvoice('1000.00'), '1067.56');
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

test('rejects unsupported assets and malformed amounts', () => {
  assert.throws(() => buildCheckoutUrl({ asset: 'SOL', invoiceUsd: '1' }), /unsupported/i);
  assert.throws(() => buildCheckoutUrl({ asset: 'BTC', invoiceUsd: '-1' }), /invalid/i);
  assert.throws(() => buildCheckoutUrl({ asset: 'ETH', invoiceUsd: '1e3' }), /invalid/i);
  assert.throws(() => buildCheckoutUrl({ asset: 'USDT', invoiceUsd: '1&address=evil' }), /invalid/i);
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
  assert.match(source, /Buy enough with Card \/ Apple Pay/);
  assert.match(source, /Don't have crypto\? Buy USDT here\./);
  assert.match(source, /Buy USDT here with Card \/ Apple Pay/);
  assert.match(source, /Fee reserve included/);
  assert.match(source, /Ethereum ERC-20 only/);
  assert.match(source, /data-intent="\$\{buyingFirst \? 'buy' : 'wallet'\}"/);
  assert.match(source, /card-spend target above the invoice/i);
  assert.match(source, /nxt-wallet-headcoin/);
  assert.match(source, /Secure checkout/);
  assert.match(source, /data-copy-for-swaps/);
  assert.match(source, /target="_blank" rel="noopener noreferrer"/);
  assert.match(source, /data-funding-usd="\$\{escapeHtml\(swapsFundingUsd\)\}"/);
  assert.match(source, /openBufferedSwapsFunding/);
  assert.match(source, /fundingAmountForInvoice\(quote\.totalUsd\)/);
  assert.doesNotMatch(source, /window\.location\.assign\(url\)/);
  assert.match(source, /window\.addEventListener\('pageshow', restoreCheckout\)/);
  assert.match(source, /window\.addEventListener\('pagehide', stopTimers\)/);
  assert.doesNotMatch(source, /create-transak-session|nxt-transak|Transak/i);
  assert.match(source, /make sure “You receive” is at least/);
  assert.match(source, /paste the transaction ID/i);
  assert.doesNotMatch(source, /window\.open\(/);
  assert.doesNotMatch(source, /nxtSwapsBuy/);
  assert.doesNotMatch(source, /pageshow[^\n]+once:\s*true/);
  assert.match(source, /fee reserve included/i);
});

test('loads the fee buffer before the revised USDT checkout on every checkout path', () => {
  const homepage = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
  const checkoutUpgrade = readFileSync(join(__dirname, '..', 'customer-checkout-upgrade.js'), 'utf8');
  const fundingVersion = 'lib/swaps-funding.js?v=20260824-fee-buffer-3';
  const checkoutVersion = 'direct-wallet-checkout.js?v=20260824-usdt-buy-cta-6';

  assert.match(homepage, /data-nxt-swaps-funding="1"/);
  assert.match(homepage, /data-nxt-direct-wallet="1"/);
  assert.match(homepage, /customer-checkout-upgrade\.js\?v=20260824-usdt-deps-4/);
  assert.ok(homepage.indexOf(fundingVersion) < homepage.indexOf(checkoutVersion));
  assert.ok(checkoutUpgrade.indexOf(fundingVersion) < checkoutUpgrade.indexOf(checkoutVersion));
  assert.match(checkoutUpgrade, /ready:\(\)=>Boolean\(window\.NxtSwapsFunding\)/);
  assert.match(checkoutUpgrade, /script\[src\*="lib\/swaps-funding\.js"\]/);
  assert.match(checkoutUpgrade, /script\[src\*="direct-wallet-checkout\.js"\]/);
  assert.match(readFileSync(join(__dirname, '..', 'direct-wallet-checkout.js'), 'utf8'), /data-asset="USDT"\] \.nxt-wallet-usdt-buy\{order:-1\}/);
});
