const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { compounds } = require('../products-data-original');
const { buildQuantityPricing } = require('../quantity-pricing');
const { normalizeOrder } = require('../lib/direct-payment');
const images = require('../product-images');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('KPV uses the selected price and all existing quantity discounts in browser and checkout', () => {
  const matches = compounds.filter(p => p.id === 'kpv-10');
  assert.equal(matches.length, 1);
  const product = matches[0];
  assert.equal(product.amount, '10mg per vial');
  assert.equal(product.pricing[0].price, 69.95);
  const expected = [6995, 13710, 20355, 26861, 33226, 39452, 45537, 51483, 57289, 62955];
  const pricing = buildQuantityPricing(product);
  assert.equal(pricing.length, expected.length);
  expected.forEach((cents, i) => {
    assert.equal(Math.round(pricing[i].price * 100), cents);
    const order = normalizeOrder([{ key: 'kpv-10::' + i, qty: 1, price: 0.01 }], 'shipping');
    assert.equal(order.subtotalCents, cents);
    assert.equal(order.shippingCents, cents > 47500 ? 0 : 1200);
    assert.equal(order.normalizedItems[0].name, 'KPV — 10mg');
  });
  assert.throws(() => normalizeOrder([{ key: 'kpv-10::10', qty: 1 }], 'shipping'), /invalid product/);
});

test('KPV shows owner-confirmed stock while retaining honest image and batch information', () => {
  const product = compounds.find(p => p.id === 'kpv-10');
  const html = read('research/kpv-10mg.html');
  assert.equal(product.badge, 'In stock');
  assert.match(html, /In stock · Ready to ship/);
  assert.match(html, /Dispatch in 1–2 business days after acceptance and payment/);
  assert.match(html, /Review lot documentation before ordering/);
  assert.match(read('catalog.html'), /<p class="eyebrow">In stock<\/p>/);
  assert.doesNotMatch(html, /product photo pending/);
  assert.match(html, /Illustrative packaging preview/);
  assert.match(html, /https:\/\/www.nxtlvl-research.com\/assets\/products\/kpv-10-960-v1.webp/);
  assert.match(html, /name="product" value="kpv-10"/);
  assert.doesNotMatch(html, /99\.[0-9]+%|aggregateRating|weight.loss program/i);
  assert.match(images.image(product), /<img/);
  for (const size of [480,960]) {
    const file = images.url(product.id,size).slice(1);
    assert.ok(fs.existsSync(path.join(__dirname,'..',file)),file);
    assert.ok(fs.statSync(path.join(__dirname,'..',file)).size < 150000,file);
  }
  assert.match(images.image(product), /KPV — 10mg/);
  for (const file of ['index.html', 'catalog.html', 'sitemap.xml']) {
    assert.ok(read(file).includes('/research/kpv-10mg.html'), file);
  }
});
