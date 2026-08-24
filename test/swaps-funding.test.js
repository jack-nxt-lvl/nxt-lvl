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

test('builds a buffered Swaps backup link with only supported public parameters', () => {
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

test('grosses up the fallback card spend for percentage and fixed provider fees', () => {
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
  assert.match(source, /Buy exact amount with Card \/ Apple Pay/);
  assert.match(source, /data-intent="\$\{buyingFirst \? 'buy' : 'wallet'\}"/);
  assert.match(source, /provider fees are added to the card total/i);
  assert.match(source, /nxt-wallet-headcoin/);
  assert.match(source, /Secure checkout/);
  assert.match(source, /data-copy-for-swaps/);
  assert.match(source, /target="_blank" rel="noopener noreferrer"/);
  assert.match(source, /data-swaps-fallback href="\$\{escapeHtml\(swapsUrl\)\}" target="_blank"/);
  assert.doesNotMatch(source, /window\.location\.assign\(url\)/);
  assert.match(source, /window\.addEventListener\('pageshow', restoreCheckout\)/);
  assert.match(source, /window\.addEventListener\('pagehide', stopTimers\)/);
  assert.match(source, /fetch\('\/api\/create-transak-session'/);
  assert.match(source, /targetCryptoAmount/);
  assert.match(source, /feesIncludedInCardTotal/);
  assert.match(source, /showTransakFunding\(data\.widgetUrl, quote\)/);
  assert.match(source, /iframe class="nxt-transak-frame"/);
  assert.match(source, /incoming payment is detected automatically behind the secure card window/i);
  assert.doesNotMatch(source, /window\.open\(/);
  assert.doesNotMatch(source, /nxtSwapsBuy/);
  assert.doesNotMatch(source, /pageshow[^\n]+once:\s*true/);
  assert.match(source, /fees are included in the card total/i);
  assert.match(source, /transaction ID from Transak/i);
});
