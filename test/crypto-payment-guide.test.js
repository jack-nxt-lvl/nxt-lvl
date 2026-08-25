const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const homepage = readFileSync(join(root, 'index.html'), 'utf8');
const guide = readFileSync(join(root, 'shipping-and-payments.html'), 'utf8');
const checkout = readFileSync(join(root, 'direct-wallet-checkout.js'), 'utf8');
const navCleanup = readFileSync(join(root, 'nav-cleanup.js'), 'utf8');

test('homepage has a prominent first-time crypto payment guide', () => {
  assert.match(homepage, /id="crypto-guide"/);
  assert.match(homepage, /Never used crypto before\?/);
  assert.match(homepage, /Why checkout uses crypto|Why direct crypto checkout/i);
  assert.match(homepage, /I already have crypto/);
  assert.match(homepage, /Buy it directly with Paybis/);
  assert.match(homepage, /Crypto-only checkout/);
  assert.doesNotMatch(homepage, /Crypto Discount Available/);
  assert.match(navCleanup, /Crypto-only checkout/);
  assert.doesNotMatch(navCleanup, /Crypto Payments Accepted|Crypto Discount Available/);
  assert.match(homepage, /nav-cleanup\.js\?v=20260824-crypto-only-1/);
  assert.match(homepage, /crypto-payment-guide\.css\?v=20260824-easy-pay-1/);
  assert.match(homepage, /direct-wallet-checkout\.js\?v=20260825-paybis-match-1/);
});

test('instructions describe the Paybis purchase and existing-wallet routes', () => {
  for (const source of [homepage, guide]) {
    assert.match(source, /Paybis/);
    assert.match(source, /direct(?:ly)? (?:from|with) (?:your )?(?:existing )?wallet|wallet-to-wallet/i);
    assert.match(source, /exact (?:crypto )?(?:receive )?amount|exact crypto amount/i);
    assert.match(source, /provider fees/i);
    assert.match(source, /Avoid scams/i);
    assert.match(source, /Paybis is independent from NXT LVL/i);
    assert.doesNotMatch(source, /\b(?:Swaps|Transak)\b/);
  }
  assert.doesNotMatch(homepage, /Cash App|MetaMask|Kraken|Coinbase|Strike/);
  assert.match(guide, /Why the exact receive amount matters/);
  assert.match(checkout, /purchase enough to cover your order plus provider and network fees/i);
  assert.match(checkout, /PayPal/);
  assert.match(checkout, /ACH/);
  assert.match(checkout, /How we match your payment/i);
  assert.match(checkout, /small fractional ending identifies your order/i);
  assert.match(checkout, /small accepted buffer/i);
  assert.match(checkout, /make sure “You receive” is at least/i);
  assert.doesNotMatch(checkout, /window\.location\.assign\(url\)/);
  assert.doesNotMatch(checkout, /create-transak-session|nxt-transak/i);
  assert.match(homepage, /shipping-and-payments\.html/);
});

test('checkout keeps the decision point to two primary paths', () => {
  const choiceIndex = checkout.indexOf('How would you like to pay?');
  const buyIndex = checkout.indexOf('Buy USDT directly with Paybis');
  const directIndex = checkout.indexOf('I already have crypto');
  const amountIndex = checkout.indexOf('<div class="nxt-wallet-label">Exact amount</div>');
  assert.ok(choiceIndex >= 0);
  assert.ok(buyIndex > choiceIndex);
  assert.ok(directIndex > buyIndex);
  assert.ok(amountIndex > directIndex);
  assert.match(checkout, /2 clear choices/);
  assert.match(checkout, /data-pay-path="buy"/);
  assert.match(checkout, /\{ asset: 'USDT', intent: 'buy' \}/);
  assert.match(checkout, /Buy USDT directly with Paybis/);
  assert.match(checkout, /Ethereum Mainnet (?:\/|·) ERC-20 only/);
  assert.match(checkout, /Buy USDT on Paybis/);
  assert.match(checkout, /Paybis is independent from NXT LVL/i);
  assert.doesNotMatch(checkout, /Pay with Card \/ Apple Pay|Buy enough with Card \/ Apple Pay/);
  assert.doesNotMatch(checkout, /data-funding-usd|fundingAmountForInvoice|fee reserve/i);
  assert.match(checkout, /openPaybisFunding/);
  assert.match(checkout, /<details class="nxt-wallet-apps">/);
  assert.match(checkout, /<details class="nxt-wallet-buy-help">/);
  assert.match(checkout, /Ethereum Mainnet (?:\/|·) ERC-20 only/);
  assert.match(checkout, /Payment sent but not detected\? Verify manually/);
});

test('guide links to official apps for customers with existing crypto', () => {
  assert.match(guide, /id="existing-wallets"/);
  for (const provider of ['Coinbase', 'Cash App', 'Robinhood', 'Crypto.com', 'Kraken', 'Trust Wallet', 'MetaMask', 'Exodus', 'BitPay Wallet']) {
    assert.match(guide, new RegExp(provider.replace('.', '\\.')));
  }
  assert.match(guide, /Bitcoin Mainnet, not Lightning/);
  assert.match(guide, /ETH or USDT ERC-20 · not native BTC/);
  assert.match(guide, /already available to send/i);
});

test('guide separates speed from fees without promising guaranteed delivery', () => {
  assert.match(guide, /Why the exact receive amount matters/);
  assert.match(guide, /exact crypto amount/i);
  assert.match(guide, /provider and network fees can reduce the crypto received/i);
  assert.match(guide, /purchase enough to cover those fees/i);
  assert.match(guide, /small fractional ending identifies the order/i);
  assert.match(guide, /small accepted buffer/i);
  assert.match(guide, /Paybis can require identity or fraud checks/i);
  assert.match(guide, /No legitimate provider can guarantee approval or instant delivery/i);
  assert.match(guide, /official provider documentation/i);
});

test('guide makes a precise recommendation without hiding network requirements', () => {
  for (const source of [homepage, guide]) {
    assert.match(source, /Best for most first-time customers/i);
    assert.match(source, /USDT on Ethereum \(ERC-20\)/i);
    assert.match(source, /Ethereum Mainnet \/ ERC-20\s+only/i);
    assert.match(source, /Bitcoin Mainnet only/i);
    assert.match(source, /Ethereum Mainnet only/i);
    assert.match(source, /fees/i);
    assert.match(source, /identity (?:checks|verification)/i);
  }
});

test('guide includes safety and finality instructions for beginners', () => {
  for (const source of [homepage, guide]) {
    assert.match(source, /recovery phrase or private key/i);
    assert.match(source, /wrong-network|wrong.network/i);
    assert.match(source, /irreversible/i);
    assert.match(source, /send only once|send once/i);
    assert.match(source, /Awaiting/);
    assert.match(source, /Detected/);
    assert.match(source, /Confirming/);
    assert.match(source, /Confirmed/);
  }
});

test('checkout marks ERC-20 USDT as its beginner pick', () => {
  assert.match(checkout, /Buy USDT directly with Paybis/);
  assert.match(checkout, /Ethereum Mainnet (?:\/|·) ERC-20 only/);
  assert.doesNotMatch(checkout, />STABLECOIN</);
});

test('homepage keeps advanced crypto detail collapsed behind a simple three-step path', () => {
  assert.match(homepage, /crypto-guide-quick/);
  assert.match(homepage, /Choose Buy with Paybis/);
  assert.match(homepage, /purchase enough USDT to cover the order and fees/i);
  assert.match(homepage, /<details class="crypto-guide-advanced">/);
  assert.match(homepage, /Already have crypto or want detailed instructions/);
});

test('payment copy avoids unsafe guarantees', () => {
  const copy = `${homepage}\n${guide}`;
  assert.doesNotMatch(copy, /guaranteed anonymous|completely anonymous|no kyc|no fees/i);
});
