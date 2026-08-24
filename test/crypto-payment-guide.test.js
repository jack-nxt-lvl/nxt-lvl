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
  assert.match(homepage, /direct-wallet-checkout\.js\?v=20260824-crypto-options-2/);
});

test('instructions offer several legitimate ways to obtain crypto', () => {
  for (const source of [homepage, guide]) {
    assert.match(source, /Cash App/);
    assert.match(source, /Coinbase/);
    assert.match(source, /MetaMask/);
    assert.match(source, /Kraken/);
    assert.match(source, /on-chain Bitcoin Mainnet/i);
    assert.match(source, /not Lightning/i);
    assert.match(source, /small amount of ETH/i);
    assert.match(source, /72-hour or longer hold/i);
    assert.match(source, /Avoid scams/i);
  }
  assert.match(checkout, /See 4 more ways to obtain crypto/);
  assert.match(checkout, /shipping-and-payments\.html#obtain/);
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
  assert.match(checkout, /BEGINNER PICK/);
  assert.match(checkout, /USDT on Ethereum ERC-20 is usually the easiest amount to understand/);
  assert.doesNotMatch(checkout, />STABLECOIN</);
});

test('payment copy avoids unsafe guarantees', () => {
  const copy = `${homepage}\n${guide}`;
  assert.doesNotMatch(copy, /guaranteed anonymous|completely anonymous|no kyc|no fees/i);
});
