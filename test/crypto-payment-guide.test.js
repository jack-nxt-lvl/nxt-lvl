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
  assert.match(homepage, /Buy it with card or Apple Pay/);
  assert.match(homepage, /Crypto-only checkout/);
  assert.doesNotMatch(homepage, /Crypto Discount Available/);
  assert.match(navCleanup, /Crypto-only checkout/);
  assert.doesNotMatch(navCleanup, /Crypto Payments Accepted|Crypto Discount Available/);
  assert.match(homepage, /nav-cleanup\.js\?v=20260824-crypto-only-1/);
  assert.match(homepage, /crypto-payment-guide\.css\?v=20260824-easy-pay-1/);
  assert.match(homepage, /direct-wallet-checkout\.js\?v=20260824-keep-site-open-1/);
});

test('instructions list only researched immediate-send purchase routes', () => {
  for (const source of [homepage, guide]) {
    assert.match(source, /Swaps\.app/);
    assert.match(source, /BitPay/);
    assert.match(source, /Paybis/);
    assert.match(source, /direct.to.wallet|wallet-first|external wallet/i);
    assert.match(source, /9\+ providers/);
    assert.match(source, /lower.verification/i);
    assert.match(source, /around \$1,000|purchase around \$1,000/i);
    assert.match(source, /Avoid scams/i);
  }
  assert.doesNotMatch(homepage, /Cash App|MetaMask|Kraken|Coinbase|Strike/);
  assert.match(guide, /Why Swaps\.app stays first/);
  assert.match(checkout, /Swaps opens separately so this NXT LVL payment screen stays open/i);
  assert.doesNotMatch(checkout, /window\.location\.assign\(url\)/);
  assert.match(homepage, /shipping-and-payments\.html/);
});

test('checkout keeps the decision point to two primary paths', () => {
  const choiceIndex = checkout.indexOf('How would you like to pay?');
  const buyIndex = checkout.indexOf('Pay with Card / Apple Pay');
  const directIndex = checkout.indexOf('I already have crypto');
  const amountIndex = checkout.indexOf('<div class="nxt-wallet-label">Exact amount</div>');
  assert.ok(choiceIndex >= 0);
  assert.ok(buyIndex > choiceIndex);
  assert.ok(directIndex > buyIndex);
  assert.ok(amountIndex > directIndex);
  assert.match(checkout, /2 clear choices/);
  assert.match(checkout, /data-pay-path="buy"/);
  assert.match(checkout, /\{ asset: 'USDT', intent: 'buy' \}/);
  assert.match(checkout, /We set up USDT on Ethereum ERC-20 automatically/);
  assert.match(checkout, /Open Swaps — keep checkout open/);
  assert.match(checkout, /<details class="nxt-wallet-apps">/);
  assert.match(checkout, /<details class="nxt-wallet-buy-help">/);
  assert.match(checkout, /Ethereum Mainnet \/ ERC-20 only/);
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
  assert.match(guide, /Why Swaps\.app stays first/);
  assert.match(guide, /final crypto received/i);
  assert.match(guide, /form starts with a fiat spend amount/i);
  assert.match(guide, /Never rely on a verification-free promise/i);
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
    assert.match(source, /identity checks/i);
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
  assert.match(checkout, /Pay with Card \/ Apple Pay/);
  assert.match(checkout, /We set up USDT on Ethereum ERC-20 automatically/);
  assert.doesNotMatch(checkout, />STABLECOIN</);
});

test('homepage keeps advanced crypto detail collapsed behind a simple three-step path', () => {
  assert.match(homepage, /crypto-guide-quick/);
  assert.match(homepage, /Choose Card \/ Apple Pay/);
  assert.match(homepage, /We select USDT and prepare the exact amount/);
  assert.match(homepage, /<details class="crypto-guide-advanced">/);
  assert.match(homepage, /Already have crypto or want detailed instructions/);
});

test('payment copy avoids unsafe guarantees', () => {
  const copy = `${homepage}\n${guide}`;
  assert.doesNotMatch(copy, /guaranteed anonymous|completely anonymous|no kyc|no fees/i);
});
