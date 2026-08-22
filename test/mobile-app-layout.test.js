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
