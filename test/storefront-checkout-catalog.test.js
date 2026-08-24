const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { normalizeOrder } = require('../lib/direct-payment');

const root = join(__dirname, '..');
const storefrontSources = [
  'cjc-products.js',
  'pt141-product.js',
  'bac-water-product.js',
  'glutathione-product.js',
  'premium-enhancements.js',
].map((file) => readFileSync(join(root, file), 'utf8')).join('\n');

const supplementalProducts = [
  { id: 'cjc1295-dac-10', prices: [89.99, 179.98, 269.97, 359.96, 449.95] },
  { id: 'cjc1295-no-dac-10', prices: [89.99, 179.98, 269.97, 359.96, 449.95] },
  { id: 'pt141-10', prices: [45, 184.5, 315] },
  { id: 'bac-water-10ml', prices: [10, 41, 70] },
  { id: 'glutathione-1500', prices: [79, 324, 553] },
  { id: 'slu-pp-332-10', prices: [85, 348.5, 595] },
];

test('every browser-added storefront product is accepted at every trusted checkout tier', () => {
  for (const product of supplementalProducts) {
    assert.match(storefrontSources, new RegExp(`id:\\s*['\"]${product.id}['\"]`));
    product.prices.forEach((price, pricingIndex) => {
      const order = normalizeOrder([{ key: `${product.id}::${pricingIndex}`, qty: 1 }], 'pickup');
      assert.equal(order.normalizedItems[0].productId, product.id);
      assert.equal(order.normalizedItems[0].unitCents, Math.round(price * 100));
    });
  }
});

test('the storefront caps a single cart line at the server-supported quantity', () => {
  const homepage = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(homepage, /existing\.qty = Math\.min\(20, existing\.qty \+ qty\)/);
  assert.match(homepage, /line\.qty = Math\.min\(20, line\.qty \+ delta\)/);
});
