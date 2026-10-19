const test = require('node:test');
const assert = require('node:assert/strict');

const { compounds, categories } = require('../products-data-original.js');

test('lists both Retatrutide strengths in the peptide category with trusted prices', () => {
  const expected = [
    { id: 'retatrutide-10', name: 'Retatrutide — 10mg', prices: [177.10, 726.11, 1239.70] },
    { id: 'retatrutide-20', name: 'Retatrutide — 20mg', prices: [257.60, 1056.16, 1803.20] }
  ];

  assert.ok(categories.some(({ id }) => id === 'freeze-dried'));

  for (const item of expected) {
    const product = compounds.find(({ id }) => id === item.id);
    assert.ok(product, `${item.id} should exist in the catalog`);
    assert.equal(product.name, item.name);
    assert.equal(product.category, 'freeze-dried');
    assert.deepEqual(product.pricing.map(({ price }) => price), item.prices);
  }
});
