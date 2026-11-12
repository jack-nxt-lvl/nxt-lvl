const test=require('node:test');
const assert=require('node:assert/strict');
const {normalizeOrder}=require('../lib/direct-payment');
const rates=require('../fulfillment-rates');
const {catalog}=require('../scripts/build-catalog-pages.cjs');
const {buildQuantityPricing}=require('../quantity-pricing');
const {buildResearchPackages}=require('../research-packages');
test('standard shipping is free strictly over $200 after discounts; premium fulfillment is unchanged',()=>{
 for(const cents of [19999,20000,20001,47499,47500,47501]){
  assert.equal(rates.feeCents('shipping',cents),cents>20000?0:1200);
  assert.equal(rates.feeCents('overnight',cents),cents>47500?0:3000);
  assert.equal(rates.feeCents('local-delivery',cents),cents>47500?0:2500);
 }
 // Shipping is calculated on the discounted total, including optional supplies.
 const singles=normalizeOrder([{key:'bpc157-10::0',qty:1},{key:'kpv-10::0',qty:1},{key:'bac-water-10ml::0',qty:1}],'shipping');
 const pack=normalizeOrder([{key:'pack-peptide-materials::0',qty:1,price:208},{key:'bac-water-10ml::0',qty:1}],'shipping');
 assert.equal(singles.subtotalCents,20000);assert.equal(singles.shippingCents,1200);
 assert.equal(pack.subtotalCents,19060);assert.equal(pack.shippingCents,1200);
});
test('all 310 material pack choices agree between browser pricing, generated pages and trusted checkout',()=>{
 for(const p of catalog()){
  const options=buildQuantityPricing(p);
  assert.equal(options.length,10,p.id);
  for(let i=0;i<10;i++){
   const order=normalizeOrder([{key:p.id+'::'+i,qty:1,price:0.01}],'shipping');
   assert.equal(order.subtotalCents,Math.round(options[i].price*100));
   assert.equal(order.subtotalCents,p.options[i].cents);
   assert.equal(options[i].discountPercent,[0,2,5,5,8,8,8,8,8,12][i]);
  }
 }
});
test('research packages preserve exact component amounts and never stack quantity discounts',()=>{
 const packs=buildResearchPackages(catalog());
 const copper=packs.find(p=>p.id==='pack-copper-materials');
 assert.deepEqual(copper.components.map(c=>c.amount),['50mg per vial','100mg per vial']);
 for(const p of packs){
  assert.equal(buildQuantityPricing(p).length,1);
  assert.equal(p.packageCents,Math.round(p.singlesCents*.95));
  assert.throws(()=>normalizeOrder([{key:p.id+'::1',qty:1}],'shipping'),/invalid/);
 }
});
test('previous signed quotes reconcile against previous prices and fulfillment fees',()=>{
 for (const [index, previousCents, currentCents] of [[0,1900,1200],[4,8740,5520],[9,16720,10560]]) {
  const items=[{key:'bac-water-10ml::'+index,qty:1}];
  const previous=normalizeOrder(items,'pickup','2026-11-02-pricing');
  const current=normalizeOrder(items,'shipping');
  assert.equal(previous.totalCents,previousCents);
  assert.equal(current.subtotalCents,currentCents);
  assert.notEqual(previous.itemDigest,current.itemDigest);
 }
 const old=normalizeOrder([{key:'bpc157-10::0',qty:2}],'shipping','2026-10-16-rates');
 assert.equal(old.subtotalCents,20930);assert.equal(old.totalCents,22130);
 const oldPack=normalizeOrder([{key:'pack-bpc157-tb500::0',qty:1}],'shipping','2026-10-16-rates');
 assert.equal(oldPack.totalCents,23378);
 assert.equal(oldPack.normalizedItems[0].components[0].amount,'10mg per vial');
 const current=normalizeOrder([{key:'bpc157-10::0',qty:2}],'shipping');
 assert.equal(current.totalCents,21800);assert.notEqual(old.itemDigest,current.itemDigest);
});

test('revised single, bulk and bundle prices preserve existing signed quotes', () => {
  for (const [key, before, after] of [
    ['ghk-cu-50::0', 6900, 4900],
    ['ghk-cu-100::0', 10900, 6900],
    ['nad-500::0', 14900, 8900],
    ['glutathione-1500::0', 8900, 5900],
    ['ghk-cu-100::9', 95920, 60720],
    ['pack-nad-glutathione::0', 22610, 14060],
  ]) {
    const items = [{key, qty: 1}];
    assert.equal(normalizeOrder(items, 'shipping').subtotalCents, after);
    for (const version of ['2026-11-09-water', '2026-11-02-pricing', 'legacy-v1']) {
      assert.equal(normalizeOrder(items, 'pickup', version).totalCents, before);
    }
  }
});
