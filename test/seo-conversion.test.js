const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {catalog,build} = require('../scripts/build-catalog-pages.cjs');
const {normalizeOrder} = require('../lib/direct-payment');
const cart = require('../cart-storage');
const research = require('../scripts/research-content.cjs');
const root = path.join(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const graph = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];

test('each product has one truthful offer matching the trusted single-vial checkout price',()=>{
 for(const p of catalog()){
  const html=read(p.path.slice(1));
  const nodes=graph(html), product=nodes.find(n=>n['@type']==='Product');
  assert.equal(nodes.filter(n=>n['@type']==='Product').length,1,p.id);
  assert.equal(product.sku,p.id);
  assert.equal(Math.round(Number(product.offers.price)*100),normalizeOrder([{key:p.id+'::0',qty:1}],'shipping').subtotalCents,p.id);
  assert.equal(product.offers.priceCurrency,'USD');
  const reference = product.offers.priceSpecification;
  assert.equal(reference.priceType,'https://schema.org/StrikethroughPrice');
  assert.equal(Math.round(Number(reference.price)*100),normalizeOrder([{key:p.id+'::0',qty:1}],'shipping','2026-11-12-delivery').subtotalCents);
  assert.equal(product.offers.url,'https://www.nxtlvl-research.com'+p.path);
  assert.ok(html.includes(product.offers.price),p.id);
  assert.ok(fs.existsSync(path.join(root,new URL(product.image[0]).pathname.slice(1))),p.id);
  assert.equal(product.aggregateRating,undefined);
  assert.ok(nodes.some(n=>n['@type']==='BreadcrumbList'));
 }
});

test('category lists describe exactly the products linked on each generated collection',()=>{
 const expected={'research-peptides.html':26,'freeze-dried-research-powders.html':30,'research-supplies.html':1};
 for(const [file,count] of Object.entries(expected)){
  const html=read(file), list=graph(html).find(n=>n['@type']==='ItemList');
  assert.equal(list.numberOfItems,count,file);
  assert.equal((html.match(/class="directory-card"/g)||[]).length,count,file);
  for(const item of list.itemListElement)assert.ok(html.includes('href="'+new URL(item.url).pathname+'"'),item.name);
 }
});

test('the nationwide New Year’s peptide sale is linked and readable in initial HTML',()=>{
 const html=read('research-peptides.html');
 assert.match(html,/<title>New Year’s Peptide Sale 2027 – 25% Off/);
 assert.match(html,/<h1>New Year’s Peptide Sale<\/h1>/);
 const home=read('index.html');
 assert.match(html,/early start on your lab’s New Year’s research goals/);
 assert.match(home,/<h1 id="homeTitle">Start your 2027<br><span>research early\.<\/span><\/h1>/);
 for(const page of [home,html,read('shipping-and-payments.html')]){
  assert.match(page,/all 50 states/);
  assert.doesNotMatch(page,/Washington,? D\.?C\.?|and D\.C\./i);
 }
 assert.match(read('index.html'),/href="\/research-peptides.html">Shop the New Year’s peptide sale/);
});

test('sitemap contains only existing canonical indexable pages and real product images',()=>{
 const xml=read('sitemap.xml');
 const urls=[...xml.matchAll(/<url><loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(new Set(urls).size,urls.length);
 assert.ok(urls.length>=50);
 for(const url of urls){
  const pathname=new URL(url).pathname;
  const html=read(pathname==='/'?'index.html':pathname.slice(1));
  assert.ok(html.includes('rel="canonical" href="'+url+'"'),url);
  assert.doesNotMatch(html,/<meta name="robots" content="[^"]*noindex/);
 }
 assert.doesNotMatch(xml,/lastmod|\?cart=|\/api\/|404\.html|oral-research-compounds/);
 for(const [file,html] of build())assert.equal(read(file),html,'Build is not repeatable: '+file);
});

test('product-page add preserves existing cart and uses only product identity and quantities',()=>{
 let value=JSON.stringify([{productId:'sermorelin',pricingIndex:0,qty:1}]);
 const storage={getItem(){return value;},setItem(key,next){assert.equal(key,'nxtCartV1');value=next;}};
 const items=cart.add(storage,'ghk-cu-50',4);
 assert.deepEqual(items,[{productId:'sermorelin',pricingIndex:0,qty:1},{productId:'ghk-cu-50',pricingIndex:4,qty:1}]);
 const order=normalizeOrder(items.map(i=>({key:i.productId+'::'+i.pricingIndex,qty:i.qty})),'shipping');
 assert.equal(order.subtotalCents,22805);
 assert.equal(order.shippingCents,0);
 assert.doesNotMatch(value,/price|total|customer|email/);
 cart.add(storage,'ghk-cu-50',4);
 assert.equal(JSON.parse(value)[1].qty,2);
 assert.equal(JSON.parse(value)[0].qty,1);
});

test('cart storage rejects malformed selections and propagates storage denial for native fallback',()=>{
 let value='not-json';
 const storage={getItem(){return value;},setItem(k,v){value=v;}};
 assert.deepEqual(cart.add(storage,'bac-water-10ml',0),[{productId:'bac-water-10ml',pricingIndex:0,qty:1}]);
 assert.throws(()=>cart.add(storage,'bpc157-10',10),/Invalid/);
 assert.throws(()=>cart.add({getItem(){throw new Error('blocked');}},'bpc157-10',0),/blocked/);
 assert.deepEqual(cart.normalize([{productId:'bpc157-10',pricingIndex:0,qty:19},{productId:'bpc157-10',pricingIndex:0,qty:8},{productId:'bpc157-10',pricingIndex:-1,qty:1}]),[{productId:'bpc157-10',pricingIndex:0,qty:20}]);
});

test('every catalog material renders its own reference content and working literature citations',()=>{
 const products=catalog();
 assert.deepEqual(Object.keys(research.records).sort(),products.map(p=>p.id).sort());
 assert.equal(new Set(Object.values(research.records).map(r=>r.overview)).size,products.length);
 for(const p of products){
  const html=read(p.path.slice(1)), r=research.get(p.id);
  assert.equal((html.match(/id="research-overview"/g)||[]).length,1,p.id);
  assert.equal((html.match(/id="docsTitle"/g)||[]).length,1,p.id);
  assert.equal((html.match(/aria-label="On this product page"/g)||[]).length,1,p.id);
  const page=graph(html).find(n=>n['@type']==='WebPage');
  assert.deepEqual(page.citation,r.sources.map(key=>research.sources[key][0]));
  for(const url of page.citation)assert.ok(html.includes('href="'+url.replace(/&/g,'&amp;')+'"'),p.id+': '+url);
  for(const id of r.related)assert.ok(html.includes('href="'+products.find(p=>p.id===id).path+'"'),id);
  assert.doesNotMatch(html,/continuing to direct crypto checkout|class="section catalog-detail-actions"/);
 }
});

test('published sample reports are linked only to the matching labeled presentations',()=>{
 const linked=catalog().filter(p=>/verify\.btlabtesting\.com\/view-pdf/.test(read(p.path.slice(1)))).map(p=>p.id).sort();
 assert.deepEqual(linked,['retatrutide-20','tb500-10']);
 for(const p of catalog()){
  const html=read(p.path.slice(1));
  for(const r of Object.values(research.reports)){
   const expected=(research.get(p.id).reports||[]).some(key=>research.reports[key]===r);
   assert.equal(html.includes('href="'+r.url.replace(/&/g,'&amp;')+'"'),expected,p.id+' '+r.id);
  }
 }
 assert.match(read('research/retatrutide-10mg.html'),/20mg samples/);
 assert.match(read('research/glow-70mg.html'),/does not publish a component-by-component formula/);
 assert.match(read('research/tb-500-bpc-157.html'),/does not specify the mass of each component/);
 assert.match(read('.vercelignore'),/!scripts\/research-content\.cjs/);
});

test('homepage exposes its featured catalog links and prices before JavaScript runs', () => {
 const html = read('index.html');
 const featured = html.match(/<!-- featured-products:start -->([\s\S]*?)<!-- featured-products:end -->/)[1];
 const cards = [...featured.matchAll(/<article class="compound-card">([\s\S]*?)<\/article>/g)];
 const products = catalog().slice(0,6);
 assert.equal(cards.length, products.length);
 for (const [index, product] of products.entries()) {
  assert.ok(cards[index][1].includes('href="' + product.path + '"'), product.id);
  assert.ok(cards[index][1].includes('$' + (product.options[0].cents / 100).toFixed(2)), product.id);
 }
});

test('visible product breadcrumbs link to the collection named in structured data', () => {
 for (const p of catalog()) {
  const html = read(p.path.slice(1));
  const trail = html.match(/<p class="crumbs">([\s\S]*?)<\/p>/)[1];
  const parent = graph(html).find(n => n['@type'] === 'BreadcrumbList').itemListElement[1];
  assert.ok(trail.includes('href="' + new URL(parent.item).pathname + '">' + parent.name + '</a>'), p.id);
 }
});

test('the legacy water listing redirects to the catalog offer and stays out of the sitemap', () => {
 const source = '/reconstitution-water.html';
 const destination = '/research/bacteriostatic-water-10ml.html';
 const rule = JSON.parse(read('vercel.json')).redirects.find(r => r.source === source);
 assert.equal(rule.destination, destination);
 assert.equal(rule.permanent, true);
 assert.ok(!read('sitemap.xml').includes(source));
 assert.ok(read('sitemap.xml').includes(destination));
});

test('Best Deals links the largest percentage markdowns to their own checkout-backed prices', () => {
 const {currentProducts} = require('../lib/direct-payment');
 const {compareDeals} = require('../quantity-pricing');
 const home = read('index.html');
 const shelf = home.split('<!-- best-deals:start -->')[1].split('<!-- best-deals:end -->')[0];
 const cards = [...shelf.matchAll(/<a class="best-deal" href="([^"]+)">([\s\S]*?)<\/a>/g)];
 const expected = currentProducts().sort((a,b) => {
   const relativePrice = p => p.pricing[0].price / p.pricing[0].regularPrice;
   return relativePrice(a) - relativePrice(b) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
 });
 assert.deepEqual(currentProducts().sort(compareDeals).map(p=>p.id), expected.map(p=>p.id));
 assert.equal(cards.length, 3);
 const paths = require('../scripts/catalog-paths.json');
 cards.forEach(([,url,body],index) => {
   const p=expected[index], option=p.pricing[0];
   assert.equal(url,paths[p.id] ? paths[p.id]+'#purchaseTitle' : p.path);
   const order=normalizeOrder([{key:p.id+'::0',qty:1}],'shipping');
   assert.ok(body.includes('<b>$'+(order.subtotalCents/100).toFixed(2)+'</b>'));
   assert.ok(body.includes('Save $'+(option.regularPrice-option.price).toFixed(2)));
 });
 assert.match(read('catalog-search-quantity.js'),/value="deals">Biggest discount/);
 for(const file of ['index.html','catalog.html','research-peptides.html']){
   const html=read(file);
   assert.match(html,/href="[^"]*#best-deals">Best Deals/);
   assert.match(html,/href="\/about.html#manufacturing">Manufactured in the USA/);
   assert.match(html,/href="\/coa.html#reports-title">Select samples tested by BTLabs in Florida, USA/);
 }
 assert.match(read('about.html'),/id="manufacturing"/);
 assert.match(read('coa.html'),/id="reports-title"/);
});
