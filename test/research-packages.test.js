const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {catalog} = require('../scripts/build-catalog-pages.cjs');
const {buildResearchPackages} = require('../research-packages');
const {buildQuantityPricing,applyQuantityPricing} = require('../quantity-pricing');
const {normalizeOrder} = require('../lib/direct-payment');
const read = file => fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const expected = [
 ['pack-bpc157-tb500',24800,23560,1240,11780],
 ['pack-cjc-no-dac-ipamorelin',21800,20710,1090,11210],
 ['pack-tesamorelin-ipamorelin',21800,20710,1090,11210],
 ['pack-sermorelin-ipamorelin',21800,20710,1090,10735],
 ['pack-mt2-ghk-cu-100',13800,13110,690,8336],
 ['pack-peptide-materials',18800,17860,940,9405],
 ['pack-ghk-cu-kpv',12800,12160,640,7671],
 ['pack-aod-mots-c',23800,22610,1190,11305],
 ['pack-nad-glutathione',14800,14060,740,9144],
 ['pack-semax-selank',16800,15960,840,7980],
 ['pack-mots-c-nad',21800,20710,1090,10070],
 ['pack-cjc-dac-comparison',23800,22610,1190,11685],
 ['pack-kpv-glutathione',13800,13110,690,8384],
];

const comparisonComponents = {
 'pack-semax-selank':['semax','selank'],
 'pack-mots-c-nad':['mots-c','nad-500'],
 'pack-cjc-dac-comparison':['cjc1295-dac-10','cjc1295-no-dac-10'],
 'pack-kpv-glutathione':['kpv-10','glutathione-1500'],
};

test('package prices are derived from their exact single-vial contents',()=>{
 const packages=buildResearchPackages(catalog());
 assert.equal(packages.length,expected.length);
 for(const [id,singles,total,savings] of expected){
  const p=packages.find(item=>item.id===id);
  assert.equal(p.singlesCents,singles);
  assert.equal(p.packageCents,total);
  assert.equal(p.savingsCents,savings);
  assert.equal(p.components.length,2);
  assert.ok(p.components.every(c=>c.quantity===1 && /per (?:10mL )?vial/.test(c.amount)));
  assert.equal(p.pricing.length,1);
  assert.equal(p.pricing[0].price,total/100);
  assert.deepEqual(buildQuantityPricing(p,p.category),p.pricing,'quantity tiers must not discount a package again');
 }
});

test('trusted checkout ignores spoofed prices and retains package fulfillment contents',()=>{
 for(const [id,,cents,,saleCents] of expected){
  const order=normalizeOrder([{key:id+'::0',qty:2,price:0.01,name:'spoof',components:[]}],'shipping');
  if(id==='pack-mt2-ghk-cu-100' || comparisonComponents[id]) assert.throws(()=>normalizeOrder([{key:id+'::0',qty:2}],'shipping','2026-11-20-new-years-sale'),/invalid/);
  else assert.equal(normalizeOrder([{key:id+'::0',qty:2}],'shipping','2026-11-20-new-years-sale').subtotalCents,Math.round(cents*.75)*2);
  assert.equal(order.subtotalCents,saleCents*2);
  assert.equal(order.normalizedItems[0].unitCents,saleCents);
  assert.equal(order.normalizedItems[0].components.length,2);
  assert.ok(order.normalizedItems[0].components.every(c=>c.quantity===2));
  assert.throws(()=>normalizeOrder([{key:id+'::1',qty:1}],'shipping'),/invalid/);
 }
});

test('package quantities, mixed carts and fulfillment use discounted totals',()=>{
 const below=normalizeOrder([{key:'pack-bpc157-tb500::0',qty:4}],'overnight');
 assert.equal(below.subtotalCents,47120);
 assert.equal(below.shippingCents,3000);
 assert.equal(below.totalCents,50120);
 const above=normalizeOrder([{key:'pack-bpc157-tb500::0',qty:4},{key:'bpc157-10::0',qty:1}],'overnight');
 assert.equal(above.subtotalCents,52620);
 assert.equal(above.shippingCents,0);
 for(const mode of ['shipping','overnight','local-delivery']){
  const order=normalizeOrder([{key:'pack-sermorelin-ipamorelin::0',qty:5}],mode);
  assert.equal(order.subtotalCents,53675);
  assert.equal(order.totalCents,53675);
 }
});

test('optional 10mL water remains a separately priced line alongside every package',()=>{
 for(const [id,,cents,,saleCents] of expected){
  const order=normalizeOrder([{key:id+'::0',qty:1},{key:'bac-water-10ml::0',qty:1,price:0}],'shipping');
  assert.equal(order.normalizedItems[0].unitCents,saleCents);
  assert.equal(order.normalizedItems[1].unitCents,900);
  assert.equal(order.normalizedItems[1].quantity,1);
  const subtotal = saleCents+900;
  assert.equal(order.subtotalCents,subtotal);
  assert.equal(order.totalCents,subtotal+(subtotal>20000?0:1200));
 }
});

test('optional water affects the free-fulfillment threshold at its actual price',()=>{
 const items=[{key:'pack-mt2-ghk-cu-100::0',qty:2},{key:'bac-water-10ml::0',qty:1}];
 const below=normalizeOrder(items,'shipping');
 assert.equal(below.subtotalCents,17572);
 assert.equal(below.shippingCents,1200);
 items[1].qty=4;
 const above=normalizeOrder(items,'shipping');
 assert.equal(above.subtotalCents,20272);
 assert.equal(above.shippingCents,0);
});

test('package calculations follow changed source prices and reject missing components',()=>{
 const materials=catalog();
 const before=buildResearchPackages(materials)[0];
 materials.find(p=>p.id==='bpc157-10').pricing.find(p=>/^1 Vial\b/.test(p.label)).price+=10;
 const after=buildResearchPackages(materials)[0];
 assert.equal(after.singlesCents,before.singlesCents+1000);
 assert.equal(after.packageCents,before.packageCents+950);
 assert.throws(()=>buildResearchPackages(materials.filter(p=>p.id!=='bpc157-10')),/Missing package component/);
});

test('browser registration preserves materials, is idempotent and matches trusted prices',()=>{
 const materials=catalog();
 const singleMaterialCount=materials.length;
 const context={compounds:materials,categories:[{id:'all'}],window:{},document:{}};
 vm.runInNewContext(read('research-packages.js'),context);
 vm.runInNewContext(read('research-packages.js'),context);
 applyQuantityPricing(context.compounds);
 applyQuantityPricing(context.compounds);
 assert.equal(context.compounds.length,singleMaterialCount+expected.length);
 assert.equal(context.categories.filter(c=>c.id==='research-packages').length,1);
 for(const [id,,,,saleCents] of expected){
  const p=context.compounds.find(p=>p.id===id);
  assert.match(p.badge,/In stock/);
  assert.equal(p.pricing[0].price,saleCents/100);
  const order=normalizeOrder([{key:id+'::0',qty:1}],'shipping');
  assert.equal(order.subtotalCents,saleCents);
  assert.deepEqual(order.normalizedItems[0].components.map(c=>[c.productId,c.amount]),Array.from(p.components,c=>[c.productId,c.amount]));
 }
 const home=read('index.html');
 assert.ok(home.indexOf('src="quantity-pricing.js')<home.indexOf('src="research-packages.js'));
 assert.ok(home.indexOf('src="research-packages.js')<home.indexOf('src="catalog-search-quantity.js'));
 assert.ok(home.indexOf('src="research-packages.js')<home.indexOf('src="customer-checkout-upgrade.js'));
});

test('public deals match server totals and are discoverable without false stock or outcome claims',()=>{
 const html=read('research-package-deals.html');
 assert.equal((html.match(/In stock · Save 5% · 2 separate vials/g)||[]).length,expected.length);
 const choices=[...html.matchAll(/href="\/\?product=([^#]+)#menu" aria-label="Choose [^"]+ for \$(\d+\.\d{2})"/g)];
 assert.equal(choices.length,expected.length);
 for(const [,id,displayed] of choices){
  assert.equal(Math.round(Number(displayed)*100),normalizeOrder([{key:id+'::0',qty:1}],'shipping').subtotalCents);
  assert.ok(html.includes('id="'+id+'"'));
 }
 for(const file of ['index.html','catalog.html','research-multipacks.html','sitemap.xml'])assert.ok(read(file).includes('research-package-deals.html'),file);
 assert.match(html,/after discounts/);
 assert.match(html,/does not stack/);
 assert.doesNotMatch(html,/aggregateRating|reviewCount|"availability"|guaranteed results|weight.loss|recovery stack|anti.aging/i);
});

test('changing the bundle and Tirzepatide price preserves already-issued quotes',()=>{
 const line=(key,version)=>normalizeOrder([{key:key+'::0',qty:1}],'shipping',version).normalizedItems[0];
 const oldMarket='2026-11-20-market-pricing';
 assert.equal(line('tirzepatide',oldMarket).unitCents,6800);
 assert.equal(line('tirzepatide').unitCents,9000);
 const oldBundle=line('pack-copper-materials',oldMarket);
 assert.equal(oldBundle.unitCents,8408);
 assert.deepEqual(oldBundle.components.map(c=>c.productId),['ghk-cu-50','ghk-cu-100']);
 assert.throws(()=>line('pack-copper-materials'),/invalid/);
 assert.throws(()=>line('pack-mt2-ghk-cu-100',oldMarket),/invalid/);
 const newBundle=line('pack-mt2-ghk-cu-100');
 assert.deepEqual(newBundle.components.map(c=>[c.productId,c.quantity]),[['mela2-10',1],['ghk-cu-100',1]]);
 assert.equal(newBundle.unitCents,Math.round((line('mela2-10').unitCents+line('ghk-cu-100').unitCents)*.95));
});

test('each new comparison package shows its rationale and fulfills its named components',()=>{
 const deals = read('research-package-deals.html');
 const products = buildResearchPackages(catalog());
 for (const [id,components] of Object.entries(comparisonComponents)) {
  const p = products.find(p=>p.id===id);
  const card = deals.split('id="'+id+'">')[1].split('</article>')[0];
  assert.ok(p.comparison && card.includes(p.comparison));
  assert.ok(p.description.includes(p.comparison));
  const lines = [{key:id+'::0',qty:1}];
  const order = normalizeOrder(lines,'shipping');
  assert.deepEqual(order.normalizedItems[0].components.map(c=>c.productId),components);
  for (const version of ['2026-11-20-mt2-bundle','2026-11-20-market-pricing','2026-11-12-delivery']) {
   assert.throws(()=>normalizeOrder(lines,'shipping',version),/invalid/);
  }
 }
 const existing = [{key:'pack-mt2-ghk-cu-100::0',qty:1},{key:'tirzepatide::0',qty:1}];
 assert.deepEqual(normalizeOrder(existing,'shipping'),normalizeOrder(existing,'shipping','2026-11-20-mt2-bundle'));
});
