const test = require('node:test');
const assert = require('node:assert/strict');

const { compounds } = require('../products-data-original.js');
const { normalizeOrder } = require('../lib/direct-payment.js');

const restoredProducts = [
  { id: 'hcg-5000', name: 'HCG — 5000 IU', prices: [96.60, 396.06, 676.20] },
  { id: 'hcg-10000', name: 'HCG — 10,000 IU', prices: [112.70, 462.07, 788.90] },
  { id: 'semaglutide', name: 'Semaglutide — 10mg', prices: [120.75, 495.08, 845.25] },
  { id: 'tirzepatide', name: 'Tirzepatide — 10mg', prices: [144.90, 594.09, 1014.30] },
  { id: 'selank', name: 'Selank — 11mg', prices: [80.49, 329.98, 563.39] },
  { id: 'semax', name: 'Semax — 11mg', prices: [123.17, 504.98, 862.16] },
  { id: 'dsip', name: 'DSIP — 10mg', prices: [78.89, 323.45, 552.23] },
  { id: 'aod-9604', name: 'AOD-9604 — 10mg', prices: [117.53, 481.87, 822.71] },
  { id: 'igf1-lr3', name: 'IGF-1 LR3 — 1mg', prices: [104.65, 434.70] }
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

test('lists Semax, Selank, and DSIP as the requested freeze-dried powder vials', () => {
  const requestedVials = new Map([
    ['semax', '11mg per vial'],
    ['selank', '11mg per vial'],
    ['dsip', '10mg per vial']
  ]);

  for (const [id, amount] of requestedVials) {
    const product = compounds.find((candidate) => candidate.id === id);
    assert.equal(product.category, 'freeze-dried');
    assert.equal(product.form, 'Lyophilized Powder');
    assert.equal(product.amount, amount);
  }
});
