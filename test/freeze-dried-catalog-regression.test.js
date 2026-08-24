const test = require('node:test');
const assert = require('node:assert/strict');

const { compounds } = require('../products-data-original.js');
const { normalizeOrder } = require('../lib/direct-payment.js');

const restoredProducts = [
  { id: 'hcg-5000', name: 'HCG — 5000 IU', prices: [60, 246, 420] },
  { id: 'hcg-10000', name: 'HCG — 10,000 IU', prices: [70, 287, 490] },
  { id: 'semaglutide', name: 'Semaglutide — 10mg', prices: [75, 307.5, 525] },
  { id: 'tirzepatide', name: 'Tirzepatide — 10mg', prices: [90, 369, 630] },
  { id: 'selank', name: 'Selank — 11mg', prices: [60, 246, 420] },
  { id: 'semax', name: 'Semax — 10mg', prices: [60, 246, 420] },
  { id: 'dsip', name: 'DSIP — 10mg', prices: [60, 246, 420] },
  { id: 'aod-9604', name: 'AOD-9604 — 10mg', prices: [73, 299.30, 511] },
  { id: 'igf1-lr3', name: 'IGF-1 LR3 — 1mg', prices: [65, 270] }
];

test('keeps every restored freeze-dried product in the storefront catalog', () => {
  for (const expected of restoredProducts) {
    const product = compounds.find(({ id }) => id === expected.id);
    assert.ok(product, `${expected.id} should exist in the catalog`);
    assert.equal(product.name, expected.name);
    assert.equal(product.category, 'freeze-dried');
    assert.deepEqual(product.pricing.map(({ price }) => price), expected.prices);
  }
});

test('accepts every restored product through trusted server-side checkout pricing', () => {
  for (const expected of restoredProducts) {
    const order = normalizeOrder([{ key: `${expected.id}::0`, qty: 1 }], 'pickup');
    assert.equal(order.subtotalCents, Math.round(expected.prices[0] * 100));
    assert.equal(order.normalizedItems[0].productId, expected.id);
  }
});
