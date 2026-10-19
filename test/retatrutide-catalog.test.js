const test = require('node:test');
const assert = require('node:assert/strict');

const { compounds, categories } = require('../products-data-original.js');

test('lists both Retatrutide strengths in the peptide category with trusted prices', () => {
  const expected = [
    { id: 'retatrutide-10', name: 'Retatrutide — 10mg', prices: [154.00, 631.40, 1078.00] },
    { id: 'retatrutide-20', name: 'Retatrutide — 20mg', prices: [224.00, 918.40, 1568.00] }
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
