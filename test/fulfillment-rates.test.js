const test = require('node:test');
const assert = require('node:assert/strict');
const rates = require('../fulfillment-rates');
const { normalizeOrder, cleanCustomer } = require('../lib/direct-payment');
const { buildStripeCheckoutForm } = require('../lib/hosted-card-link');

test('all four fulfillment methods use the owner rates and the strict free threshold', () => {
  for (const [mode, expected] of Object.entries({shipping:1200,overnight:3000,pickup:0,'local-delivery':2500})) {
    assert.equal(rates.feeCents(mode, 47499), expected);
    assert.equal(rates.feeCents(mode, 47500), expected);
    assert.equal(rates.feeCents(mode, 47501), 0);
  }
});

test('trusted merchandise prices determine the free threshold, not client prices or totals', () => {
  const items = [{key:'bpc157-10::0',qty:7,price:1000},{key:'bac-water-10ml::0',qty:2,price:1000}];
  for (const mode of ['shipping','overnight','local-delivery']) {
    const exact = normalizeOrder(items,mode);
    assert.equal(exact.subtotalCents,47500);
    assert.equal(exact.shippingCents,rates.OPTIONS[mode].cents);
    const above = normalizeOrder([items[0],{...items[1],qty:3}],mode);
    assert.equal(above.subtotalCents,48500);
    assert.equal(above.shippingCents,0);
    assert.equal(above.totalCents,48500);
  }
});

test('unsupported methods and incomplete delivery addresses cannot create orders', () => {
  assert.throws(()=>normalizeOrder([{key:'bpc157-10::0',qty:1}],'free'),/fulfillment/);
  assert.throws(()=>rates.feeCents('__proto__',10000),/fulfillment/);
  const buyer={name:'Test Research Buyer',email:'buyer@lab.example',phone:'5555550100'};
  for (const mode of ['shipping','overnight','local-delivery']) assert.throws(()=>cleanCustomer(buyer,mode),/address/);
});

test('hosted invoices identify the selected method and omit waived fees', () => {
  const customer={name:'Test Research Buyer',email:'buyer@lab.example'};
  for (const mode of ['shipping','overnight','local-delivery']) {
    const order=normalizeOrder([{key:'bpc157-10::0',qty:1}],mode);
    const form=buildStripeCheckoutForm({order,customer,orderId:'NXT-RATE-TEST'});
    assert.equal(form.get('line_items[1][price_data][unit_amount]'),String(rates.OPTIONS[mode].cents));
    assert.equal(form.get('line_items[1][price_data][product_data][name]'),rates.label(mode));
    assert.equal(form.get('metadata[fulfillment]'),mode);
    const free=normalizeOrder([{key:'bpc157-10::0',qty:8}],mode);
    const freeForm=buildStripeCheckoutForm({order:free,customer,orderId:'NXT-FREE-TEST'});
    assert.equal(freeForm.has('line_items[1][price_data][unit_amount]'),false);
  }
});

test('legacy signed-quote reconciliation retains its old fee while new requests use current rates', () => {
  const items=[{key:'bpc157-10::0',qty:2}];
  assert.equal(normalizeOrder(items,'shipping','legacy-v1').totalCents,14000);
  assert.equal(normalizeOrder(items,'shipping').totalCents,14200);
  assert.throws(()=>normalizeOrder(items,'overnight','legacy-v1'),/legacy/);
  assert.throws(()=>normalizeOrder(items,'shipping','invented-version'),/version/);
});
