const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const mobile = fs.readFileSync(path.join(root, 'mobile-app-upgrade.js'), 'utf8');

test('loads the mobile app layer last with iPhone safe-area support', () => {
  assert.match(index, /viewport-fit=cover/);
  assert.match(index, /name="theme-color" content="#07060b"/);
  assert.ok(index.indexOf('mobile-app-upgrade.js') > index.indexOf('customer-checkout-upgrade.js'));
  assert.ok(index.indexOf('mobile-app-upgrade.js') > index.indexOf('ai-cart-bridge.js'));
});

test('keeps mobile navigation and critical overlays collision-free', () => {
  assert.match(mobile, /className = 'nxt-mobile-tabbar'/);
  assert.match(mobile, /\.ai-chat-toggle\{display:none!important\}/);
  assert.match(mobile, /body\.nxt-mobile-layer-open \.nxt-mobile-tabbar/);
  assert.match(mobile, /\.nxt-checkout-overlay,[\s\S]*width:100dvw!important;height:100dvh!important/);
  assert.match(mobile, /\.nxt-checkout-card input\{min-height:52px!important/);
});

test('keeps the AI chat attached to the visible iPhone viewport while typing', () => {
  assert.match(mobile, /--nxt-mobile-viewport-height:100dvh/);
  assert.match(mobile, /body\.nxt-ai-keyboard-open \.ai-chat-panel\.open/);
  assert.match(mobile, /window\.visualViewport\?\.addEventListener\('resize'/);
  assert.match(mobile, /viewport\?\.offsetTop/);
  assert.match(index, /enterkeyhint="send"/);
  assert.match(index, /mobile-app-upgrade\.js\?v=20260822-2/);
});
