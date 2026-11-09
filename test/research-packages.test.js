const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {catalog} = require('../scripts/build-catalog-pages.cjs');
const {buildResearchPackages} = require('../research-packages');
const {buildQuantityPricing} = require('../quantity-pricing');
const {normalizeOrder} = require('../lib/direct-payment');
const read = file => fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const expected = [
 ['pack-bpc157-tb500',24800,23560,1240],
 ['pack-cjc-no-dac-ipamorelin',21800,20710,1090],
 ['pack-tesamorelin-ipamorelin',21800,20710,1090],
 ['pack-sermorelin-ipamorelin',21800,20710,1090],
 ['pack-copper-materials',17800,16910,890],
 ['pack-peptide-materials',18800,17860,940],
 ['pack-ghk-cu-kpv',14800,14060,740],
 ['pack-aod-mots-c',23800,22610,1190],
 ['pack-nad-glutathione',23800,22610,1190],
];

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
 for(const [id,,cents] of expected){
  const order=normalizeOrder([{key:id+'::0',qty:2,price:0.01,name:'spoof',components:[]}],'shipping');
  assert.equal(order.subtotalCents,cents*2);
  assert.equal(order.normalizedItems[0].unitCents,cents);
  assert.equal(order.normalizedItems[0].components.length,2);
  assert.ok(order.normalizedItems[0].components.every(c=>c.quantity===2));
  assert.throws(()=>normalizeOrder([{key:id+'::1',qty:1}],'shipping'),/invalid/);
 }
});

test('package quantities, mixed carts and fulfillment use discounted totals',()=>{
 const below=normalizeOrder([{key:'pack-bpc157-tb500::0',qty:2}],'overnight');
 assert.equal(below.subtotalCents,47120);
 assert.equal(below.shippingCents,3000);
 assert.equal(below.totalCents,50120);
 const above=normalizeOrder([{key:'pack-bpc157-tb500::0',qty:2},{key:'bpc157-10::0',qty:1}],'overnight');
 assert.equal(above.subtotalCents,58020);
 assert.equal(above.shippingCents,0);
 for(const mode of ['shipping','overnight','local-delivery','pickup']){
  const order=normalizeOrder([{key:'pack-sermorelin-ipamorelin::0',qty:3}],mode);
  assert.equal(order.subtotalCents,62130);
  assert.equal(order.totalCents,62130);
 }
});

test('optional 10mL water remains a separately priced line alongside every package',()=>{
 for(const [id,,cents] of expected){
  const order=normalizeOrder([{key:id+'::0',qty:1},{key:'bac-water-10ml::0',qty:1,price:0}],'shipping');
  assert.equal(order.normalizedItems[0].unitCents,cents);
  assert.equal(order.normalizedItems[1].unitCents,1200);
  assert.equal(order.normalizedItems[1].quantity,1);
  assert.equal(order.subtotalCents,cents+1200);
  assert.equal(order.totalCents,cents+1200+(cents+1200>20000?0:1200));
 }
});

test('optional water affects the free-fulfillment threshold at its actual price',()=>{
 const items=[{key:'pack-cjc-no-dac-ipamorelin::0',qty:2},{key:'bac-water-10ml::0',qty:1}];
 const below=normalizeOrder(items,'shipping');
 assert.equal(below.subtotalCents,42620);
 assert.equal(below.shippingCents,0);
 items[1].qty=2;
 const above=normalizeOrder(items,'shipping');
 assert.equal(above.subtotalCents,43820);
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
 assert.equal(context.compounds.length,singleMaterialCount+expected.length);
 assert.equal(context.categories.filter(c=>c.id==='research-packages').length,1);
 for(const [id,,cents] of expected){
  const p=context.compounds.find(p=>p.id===id);
  assert.match(p.badge,/In stock/);
  assert.equal(p.pricing[0].price,cents/100);
  const order=normalizeOrder([{key:id+'::0',qty:1}],'pickup');
  assert.equal(order.totalCents,cents);
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
  assert.equal(Math.round(Number(displayed)*100),normalizeOrder([{key:id+'::0',qty:1}],'pickup').totalCents);
  assert.ok(html.includes('id="'+id+'"'));
 }
 for(const file of ['index.html','catalog.html','research-multipacks.html','sitemap.xml'])assert.ok(read(file).includes('research-package-deals.html'),file);
 assert.match(html,/after discounts/);
 assert.match(html,/does not stack/);
 assert.doesNotMatch(html,/aggregateRating|reviewCount|"availability"|guaranteed results|weight.loss|recovery stack|anti.aging/i);
});
