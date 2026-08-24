const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeProductSearch } = require('../premium-enhancements.js');

test('product search ignores decorative punctuation and spacing', () => {
  const card = normalizeProductSearch('HCG — 10,000 IU');

  assert.match(card, /hcg 10 000 iu/);
  assert.ok(card.includes(normalizeProductSearch('HCG 10,000')));
  assert.ok(card.includes(normalizeProductSearch('HCG — 10 000')));
  assert.ok(normalizeProductSearch('IGF-1 LR3 — 1mg').includes(normalizeProductSearch('IGF 1 LR3')));
});
