const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { normalizeOrder } = require('../lib/direct-payment');
const { buildQuantityPricing } = require('../quantity-pricing');

const root = join(__dirname, '..');
const storefrontSources = [
  'cjc-products.js',
  'pt141-product.js',
  'bac-water-product.js',
  'glutathione-product.js',
  'premium-enhancements.js',
].map((file) => readFileSync(join(root, file), 'utf8')).join('\n');

const supplementalProducts = [
  { id: 'cjc1295-dac-10', basePrice: 89.99 },
  { id: 'cjc1295-no-dac-10', basePrice: 89.99 },
  { id: 'pt141-10', basePrice: 45 },
  { id: 'bac-water-10ml', basePrice: 10 },
  { id: 'glutathione-1500', basePrice: 79 },
  { id: 'slu-pp-332-10', basePrice: 85 },
];

test('every browser-added freeze-dried product has 1 through 10 trusted checkout options', () => {
  for (const product of supplementalProducts) {
    assert.match(storefrontSources, new RegExp(`id:\\s*['\"]${product.id}['\"]`));
    const pricing = buildQuantityPricing({
      category: 'freeze-dried',
      pricing: [{ label: '1 Vial', price: product.basePrice }],
    });

    assert.equal(pricing.length, 10);
    pricing.forEach((option, pricingIndex) => {
      const order = normalizeOrder([{ key: `${product.id}::${pricingIndex}`, qty: 1 }], 'pickup');
      assert.equal(order.normalizedItems[0].productId, product.id);
      assert.equal(order.normalizedItems[0].unitCents, Math.round(option.price * 100));
    });
  }
});

test('uses modest quantity discounts for freeze-dried products and injectables', () => {
  const oneBpc = normalizeOrder([{ key: 'bpc157-10::0', qty: 1 }], 'pickup');
  const tenBpc = normalizeOrder([{ key: 'bpc157-10::9', qty: 1 }], 'pickup');
  assert.equal(oneBpc.subtotalCents, 6500);
  assert.equal(tenBpc.subtotalCents, 58500);

  const oneTestE = normalizeOrder([{ key: 'test-e::0', qty: 1 }], 'pickup');
  const fiveTestE = normalizeOrder([{ key: 'test-e::4', qty: 1 }], 'pickup');
  assert.equal(oneTestE.subtotalCents, 8500);
  assert.equal(fiveTestE.subtotalCents, 40375);
});

test('loads the visible product search and quantity upgrade after catalog supplements', () => {
  const homepage = readFileSync(join(root, 'index.html'), 'utf8');
  const supplementIndex = homepage.indexOf('glutathione-product.js');
  const pricingIndex = homepage.indexOf('quantity-pricing.js');
  const searchIndex = homepage.indexOf('catalog-search-quantity.js');

  assert.ok(supplementIndex >= 0 && pricingIndex > supplementIndex);
  assert.ok(searchIndex > pricingIndex);
});

test('the storefront caps a single cart line at the server-supported quantity', () => {
  const homepage = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(homepage, /existing\.qty = Math\.min\(20, existing\.qty \+ qty\)/);
  assert.match(homepage, /line\.qty = Math\.min\(20, line\.qty \+ delta\)/);
});