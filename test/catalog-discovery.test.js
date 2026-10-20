const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {catalog,build} = require('../scripts/build-catalog-pages.cjs');
const {normalizeOrder} = require('../lib/direct-payment');
const read = file => fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('all published material pages and directory match the checkout catalog',()=>{
 const products=catalog();
 assert.equal(products.length,30);
 for(const p of products){
  const html=read(p.path.slice(1));
  assert.match(html,new RegExp('name="product" value="'+p.id+'"'));
  assert.match(html,/<form action="\/#menu" method="get"/);
  for(const option of p.options){
   const order=normalizeOrder([{key:p.id+'::'+(option.quantity-1),qty:1}],'shipping');
   assert.equal(option.cents,order.subtotalCents,p.id);
   assert.ok(html.includes(`value="${option.quantity}" data-cents="${order.subtotalCents}"`),p.id);
  }
  assert.ok(read('catalog.html').includes(`href="${p.path}"`),p.id);
  assert.ok(read('sitemap.xml').includes('https://www.nxtlvl-research.com'+p.path),p.id);
 }
 for(const [file,html] of build())assert.equal(read(file),html,'Generated file drifted: '+file);
});

test('the directory and its schema cover the same real material pages',()=>{
 const html=read('catalog.html');
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 const list=schema['@graph'].find(x=>x['@type']==='ItemList');
 assert.equal(list.numberOfItems,30);
 assert.equal(list.itemListElement.length,30);
 assert.equal((html.match(/class="directory-card"/g)||[]).length,30);
 for(const item of list.itemListElement)assert.ok(html.includes('href="'+new URL(item.url).pathname+'"'));
 assert.doesNotMatch(html,/aggregateRating|reviewCount|"availability"/);
});

test('product links distinguish a material from blends and typed search tolerates punctuation',()=>{
 const {matchesCatalogProduct}=require('../catalog-search-quantity');
 const products=catalog();
 const bpc=products.find(p=>p.id==='bpc157-10');
 const blend=products.find(p=>p.id==='tb500-bpc157');
 assert.equal(matchesCatalogProduct(bpc,'BPC-157 — 10mg','bpc157-10'),true);
 assert.equal(matchesCatalogProduct(blend,'BPC-157 — 10mg','bpc157-10'),false);
 for(const query of ['BPC157','bpc 157','BPC-157','bpc157 10mg'])assert.equal(matchesCatalogProduct(bpc,query,null),true,query);
 assert.equal(matchesCatalogProduct(bpc,'unlisted material',null),false);
 assert.equal(matchesCatalogProduct(bpc,'',null),true);
});

test('material pages have one price panel and no human-use offer or fabricated proof',()=>{
 for(const p of catalog()){
  const html=read(p.path.slice(1));
  assert.equal((html.match(/id="purchaseTitle"/g)||[]).length,1,p.id);
  assert.equal((html.match(/id="productPack"/g)||[]).length,1,p.id);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,p.id);
  assert.match(html,/qualified laboratories and research organizations only/i);
  assert.doesNotMatch(html,/guaranteed results|clinically proven|99\.[0-9]+%|aggregateRating|weight.loss program/i);
 }
});

test('the batch-report cache exception follows generic HTML caching',()=>{
 const config=JSON.parse(read('vercel.json'));
 const generic=config.headers.findIndex(x=>x.source==='/(.*).html');
 const report=config.headers.findIndex(x=>x.source==='/coa.html');
 assert.ok(report>generic);
 assert.match(config.headers[report].headers[0].value,/no-store/);
 assert.match(read('404.html'),/name="robots" content="noindex,follow"/);
 assert.doesNotMatch(read('sitemap.xml'),/404\.html/);
});

test('multipack choices retain the precise material, quantity and trusted checkout total',()=>{
 const html=read('research-multipacks.html');
 const choices=[...html.matchAll(/href="\/\?product=([^&]+)&amp;qty=(\d+)#menu" aria-label="Choose [^"]+ for \$(\d+\.\d{2})"/g)];
 assert.equal(choices.length,24);
 assert.equal(new Set(choices.map(m=>m[1])).size,8);
 for(const [,id,quantity,displayed] of choices){
  assert.ok([3,5,10].includes(Number(quantity)));
  const actual=normalizeOrder([{key:id+'::'+(Number(quantity)-1),qty:1}],'shipping');
  assert.equal(Math.round(Number(displayed)*100),actual.subtotalCents,id+' '+quantity);
 }
 assert.match(read('catalog.html'),/href="\/research-multipacks.html"/);
 assert.match(read('index.html'),/href="\/research-multipacks.html"/);
 assert.match(read('sitemap.xml'),/https:\/\/www.nxtlvl-research.com\/research-multipacks.html/);
 assert.doesNotMatch(html,/aggregateRating|reviewCount|"availability"|buy now|weight.loss|recovery stack|anti.aging/i);
});
