const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const homepage = readFileSync(join(root, 'index.html'), 'utf8');
const guide = readFileSync(join(root, 'shipping-and-payments.html'), 'utf8');
const checkout = readFileSync(join(root, 'direct-wallet-checkout.js'), 'utf8');
const orderHelp = readFileSync(join(root, 'how-to-order.html'), 'utf8');

test('the homepage leads into the catalog and links to payment help', () => {
  const catalog = homepage.indexOf('id="menu"');
  const grid = homepage.indexOf('id="compoundGrid"', catalog);
  const faq = homepage.indexOf('id="buyerFaqTitle"');
  assert.ok(catalog > 0 && grid > catalog && faq > grid);
  assert.match(homepage.slice(catalog, faq), /class="compound-card"/);
  assert.match(homepage.slice(faq), /href="\/how-to-order\.html">payment guide</);
  assert.doesNotMatch(homepage, /crypto-guide-shell|crypto-payment-guide\.css|Buy it directly with Paybis/i);
  assert.match(orderHelp, /href="\/shipping-and-payments\.html#obtain"/);
  assert.match(guide, /id="obtain"/);
});

test('instructions describe the Paybis purchase and existing-wallet routes', () => {
  assert.match(guide, /Paybis/);
  assert.match(guide, /direct(?:ly)? (?:from|with) (?:your )?(?:existing )?wallet|wallet-to-wallet/i);
  assert.match(guide, /exact (?:crypto )?(?:receive )?amount|exact crypto amount/i);
  assert.match(guide, /provider fees/i);
  assert.match(guide, /Avoid scams/i);
  assert.match(guide, /Paybis is independent from NXT LVL/i);
  assert.doesNotMatch(guide, /\b(?:Swaps|Transak)\b/);
  assert.doesNotMatch(homepage, /Cash App|MetaMask|Kraken|Coinbase|Strike/);
  assert.match(guide, /Why the exact receive amount matters/);
  assert.match(checkout, /purchase enough to cover your order plus provider and network fees/i);

  assert.match(checkout, /make sure “You receive” is at least/i);
  assert.doesNotMatch(checkout, /window\.location\.assign\(url\)/);
  assert.doesNotMatch(checkout, /create-transak-session|nxt-transak/i);
  assert.match(homepage, /shipping-and-payments\.html/);
});

test('checkout presents the amount and network before optional funding help', () => {
  const amountIndex = checkout.indexOf('1. Send this exact amount');
  const networkIndex = checkout.indexOf('Network:');
  const addressIndex = checkout.indexOf('2. Send to this address');
  const fundingIndex = checkout.indexOf('Need ${e(quote.asset)}? Buy with Paybis');
  assert.ok(amountIndex >= 0 && networkIndex > amountIndex);
  assert.ok(addressIndex > networkIndex && fundingIndex > addressIndex);
  assert.match(checkout, /Ethereum \(ERC-20\) only/);
  assert.match(checkout, /Payment sent but not detected/);
  assert.match(checkout, /Never share your recovery phrase or private key/);
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
  assert.match(guide, /Best for most first-time customers/i);
  assert.match(guide, /USDT on Ethereum \(ERC-20\)/i);
  assert.match(guide, /Ethereum Mainnet \/ ERC-20\s+only/i);
  assert.match(guide, /Bitcoin Mainnet only/i);
  assert.match(guide, /Ethereum Mainnet only/i);
  assert.match(guide, /fees/i);
  assert.match(guide, /identity (?:checks|verification)/i);
});

test('guide includes safety and finality instructions for beginners', () => {
  assert.match(guide, /recovery phrase or private key/i);
  assert.match(guide, /wrong-network|wrong.network/i);
  assert.match(guide, /irreversible/i);
  assert.match(guide, /send only once|send once/i);
  assert.match(guide, /Awaiting/);
  assert.match(guide, /Detected/);
  assert.match(guide, /Confirming/);
  assert.match(guide, /Confirmed/);
});

test('checkout defaults to USDT without changing BTC or ETH availability', () => {
  const form = readFileSync(join(root, 'customer-checkout-upgrade.js'), 'utf8');
  assert.match(checkout, /preferredAsset = 'USDT'/);
  for (const asset of ['BTC','ETH','USDT']) assert.ok(form.includes('value="'+asset+'"'));
});

test('payment copy avoids unsafe guarantees', () => {
  const copy = `${homepage}\n${guide}`;
  assert.doesNotMatch(copy, /guaranteed anonymous|completely anonymous|no kyc|no fees/i);
});

