const test = require('node:test');
const assert = require('node:assert/strict');

const { compounds } = require('../products-data-original.js');
const { normalizeOrder } = require('../lib/direct-payment.js');

const restoredProducts = [
  { id: 'hcg-5000', name: 'HCG — 5000 IU', prices: [84.00, 344.40, 588.00] },
  { id: 'hcg-10000', name: 'HCG — 10,000 IU', prices: [98.00, 401.80, 686.00] },
  { id: 'semaglutide', name: 'Semaglutide — 10mg', prices: [105.00, 430.50, 735.00] },
  { id: 'tirzepatide', name: 'Tirzepatide — 10mg', prices: [126.00, 516.60, 882.00] },
  { id: 'selank', name: 'Selank — 11mg', prices: [69.99, 286.94, 489.90] },
  { id: 'semax', name: 'Semax — 11mg', prices: [107.10, 439.11, 749.70] },
  { id: 'dsip', name: 'DSIP — 10mg', prices: [68.60, 281.26, 480.20] },
  { id: 'aod-9604', name: 'AOD-9604 — 10mg', prices: [102.20, 419.02, 715.40] },
  { id: 'igf1-lr3', name: 'IGF-1 LR3 — 1mg', prices: [91.00, 378.00] }
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
