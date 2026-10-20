// Generate public shopping information from the same catalog accepted by checkout.
// No requests, keys, customer data, or payment creation are involved in this build.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { normalizeOrder } = require('../lib/direct-payment');
const rates = require('../fulfillment-rates');
const paths = require('./catalog-paths.json');
const root = path.join(__dirname, '..');
const origin = 'https://www.nxtlvl-research.com';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = cents => '$' + (cents / 100).toFixed(2);
function catalog() {
  const context = { compounds: structuredClone(require('../products-data-original').compounds) };
  for (const file of ['cjc-products.js','pt141-product.js','bac-water-product.js','glutathione-product.js']) vm.runInNewContext(read(file), context);
  const supplemental = read('premium-enhancements.js').match(/compounds\.push\((\{"id": "slu-pp-332-10"[^\n]+)\);/);
  if (!supplemental) throw new Error('SLU-PP-332 catalog source was not found');
  if (!context.compounds.some(p => p.id === 'slu-pp-332-10')) context.compounds.push(JSON.parse(supplemental[1]));
  return context.compounds.map(p => {
    if (!paths[p.id]) throw new Error('Missing public catalog path: ' + p.id);
    const options = Array.from({length:10}, (_, i) => {
      const order = normalizeOrder([{key:p.id + '::' + i,qty:1}], 'shipping');
      const item = order.normalizedItems[0];
      return {quantity:i+1,label:item.label,cents:item.unitCents,shipping:order.shippingCents};
    });
    return {...p,path:paths[p.id],options};
  });
}
function panel(p) {
  return `<!-- catalog-purchase:start -->
<section class="product-purchase" aria-labelledby="purchaseTitle">
<div class="purchase-heading"><div><p class="eyebrow">Pack pricing · USD</p><h2 id="purchaseTitle">Select a pack.</h2></div><a href="/catalog.html">All materials ↗</a></div>
<div class="purchase-layout"><form action="/#menu" method="get" class="product-pack-form">
<input type="hidden" name="product" value="${esc(p.id)}">
<label for="productPack">Pack size for ${esc(p.name)}</label>
<select id="productPack" name="qty" aria-describedby="packHelp">${p.options.map(o => `<option value="${o.quantity}" data-cents="${o.cents}" data-shipping="${o.shipping}">${esc(o.label)} — ${money(o.cents)}</option>`).join('')}</select>
<p class="pack-price" aria-live="polite" aria-atomic="true"><strong id="packTotal">${money(p.options[0].cents)}</strong><span id="packUnit">${money(p.options[0].cents)} per vial</span></p>
<p id="packHelp">Select a pack, then add it to your cart. Prices in USD; fulfillment is shown at checkout.</p>
<button class="purchase-button" type="submit">Continue with this pack <span aria-hidden="true">↗</span></button>
<p class="purchase-note">For qualified laboratories and research organizations only. <a href="/research-eligibility.html">Check eligibility</a>.</p>
</form><div class="purchase-assurance"><h3>Know the details before you order.</h3><ul>
<li><strong>U.S. shipping</strong><span>Standard ${money(rates.OPTIONS.shipping.cents)} · overnight ${money(rates.OPTIONS.overnight.cents)}. Dispatch in 1–2 business days after acceptance and payment; transit is additional. Confirm overnight availability first.</span></li>
<li><strong>South Florida fulfillment</strong><span>Pickup is free by appointment. Local delivery is ${money(rates.OPTIONS['local-delivery'].cents)} after address and availability confirmation. <a href="/south-florida-research.html?material=${encodeURIComponent(p.name)}#local-inquiry">Check delivery or pickup ↗</a></span></li>
<li><strong>Free fulfillment above $${rates.FREE_ABOVE_CENTS / 100}</strong><span>Applies to every available option. Orders at exactly $475 pay the standard option fee.</span></li>
<li><strong>BTC · ETH · USDT</strong><span>Crypto checkout is available. <a href="/how-to-order.html">Read the payment guide</a> and <a href="/ordering-policy.html#refunds">final-sale policy</a> before payment.</span></li>
</ul></div></div></section>
<section class="product-docs" aria-labelledby="docsTitle"><h2 id="docsTitle">Match the documentation to this material.</h2><p>Ask for the report for <strong>${esc(p.name)}</strong> and the lot being offered. Match the label and lot number; review identity, analytical method and handling instructions against your laboratory requirements. A catalog listing does not establish purity, sterility or suitability.</p><div class="product-doc-links"><a href="/coa.html">Available batch reports ↗</a><a href="/how-to-review-a-coa.html">How to read a COA ↗</a><a href="https://wa.me/17542907210?text=${encodeURIComponent('Please confirm current availability and lot documentation for '+p.name+'. This is a laboratory research inquiry.')}" rel="noopener">Ask about this material ↗</a></div></section>
<!-- catalog-purchase:end -->`;
}
function head(title, description, canonical, graph) {
 return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${origin}${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="NXT LVL Research"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}${canonical}"><meta property="og:image" content="${origin}/assets/miami-skyline-night.webp"><meta property="og:image:alt" content="Miami skyline at dusk — NXT LVL Research"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${origin}/assets/miami-skyline-night.webp"><meta name="theme-color" content="#080e10"><link rel="stylesheet" href="/research/research-product-seo.css"><link rel="stylesheet" href="/confidence-redesign.css?v=20261016-review"><link rel="stylesheet" href="/miami-research.css?v=20261017-night-1"><link rel="stylesheet" href="/atelier-layout.css?v=20261017-1"><link rel="stylesheet" href="/catalog-experience.css?v=20261020-1"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph})}</script></head>`;
}
const nav = `<a class="catalog-skip" href="#main-content">Skip to content</a><nav aria-label="Main navigation"><a class="brand" href="/">NXT <span>LVL</span></a><a href="/catalog.html">All materials</a><a href="/south-florida-research.html">Local delivery</a><a href="/how-to-order.html">How to order</a></nav>`;
const footer = `<footer class="catalog-footer"><strong>NXT LVL Research</strong><p>Laboratory research only. Not for human consumption, medical, veterinary or diagnostic use.</p><div><a href="tel:+17542907210">754-290-7210</a><a href="sms:+17542907210">Text us</a><a href="https://wa.me/17542907210">WhatsApp</a></div><div><a href="/ordering-policy.html">Ordering policy</a><a href="/ordering-policy.html#refunds">Returns &amp; refunds</a><a href="/privacy.html">Privacy</a></div></footer>`;
function newProduct(p) {
 const desc = `${p.name}: ${p.amount}, ${p.form.toLowerCase()}. Compare pack pricing, review lot documentation and confirm U.S. or South Florida fulfillment.`;
 const graph = [ {'@type':'WebPage',name:p.name,url:origin+p.path,description:desc,isPartOf:{'@id':origin+'/#website'}}, {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/'},{'@type':'ListItem',position:2,name:'Research catalog',item:origin+'/catalog.html'},{'@type':'ListItem',position:3,name:p.name,item:origin+p.path}]} ];
 return head(p.name+' Research Material | NXT LVL',desc,p.path,graph)+`<body class="miami-site product-detail"><main class="wrap" id="main-content">${nav}<p class="eyebrow">Laboratory research material</p><p class="crumbs"><a href="/">Home</a> / <a href="/catalog.html">Research catalog</a> / ${esc(p.name)}</p><h1>${esc(p.name)}</h1><p class="lead">${esc(p.name)} is listed as ${esc(p.form.toLowerCase())}, with a labeled amount of ${esc(p.amount)}. Review the offered lot and purchaser eligibility before ordering.</p><div class="specs"><div class="spec"><b>Material</b><span>${esc(p.name)}</span></div><div class="spec"><b>Labeled amount</b><span>${esc(p.amount)}</span></div><div class="spec"><b>Format</b><span>${esc(p.form)}</span></div></div>${panel(p)}<section><h2>Handling and material review</h2><p>The labeled amount describes the supplied material, not a dose. Request the applicable supplier storage and handling documentation, and follow your laboratory procedures. No human-use instructions are provided.</p></section>${footer}</main><script src="/product-purchase.js?v=20261020-1" defer></script></body></html>`;
}
function directory(products) {
 const sorted = [...products].sort((a,b)=>a.name.localeCompare(b.name));
 const graph = [{'@type':'CollectionPage',name:'Research material catalog',url:origin+'/catalog.html',isPartOf:{'@id':origin+'/#website'}},{'@type':'ItemList',name:'NXT LVL Research materials',numberOfItems:products.length,itemListElement:sorted.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:origin+p.path}))}];
 return head('Research Catalog & Pack Pricing | NXT LVL Research','Browse research materials by name, labeled amount and format. Compare pack prices, review lot documentation, and arrange U.S. shipping or confirmed South Florida delivery.','/catalog.html',graph)+`<body class="miami-site catalog-directory"><main class="wrap" id="main-content">${nav}<p class="eyebrow">The complete research collection</p><h1>Find your material.<br>Know your options.</h1><p class="lead">Compare ${products.length} laboratory material listings by exact name, labeled amount and format. Open a listing for pack sizes, current catalog pricing and documentation guidance.</p><p>U.S. shipping · Miami / Fort Lauderdale delivery by confirmation · <a href="/research-eligibility.html">Qualified research purchasers only</a></p><div class="directory-search" hidden><label for="directorySearch">Find a material</label><input type="search" id="directorySearch" placeholder="Name or labeled amount, e.g. GHK-Cu 50mg" autocomplete="off"><p id="directoryCount" role="status" aria-live="polite">${products.length} materials</p></div><div class="directory-grid">${sorted.map(p=>`<article class="directory-card" data-search="${esc(p.name+' '+p.amount+' '+p.form)}"><p class="eyebrow">${esc(p.form)}</p><h2><a href="${p.path}">${esc(p.name)}</a></h2><p>${esc(p.amount)}</p><div class="directory-card-bottom"><span>From <strong>${money(p.options[0].cents)}</strong> / vial</span><a href="${p.path}" aria-label="View ${esc(p.name)} pack options">View packs ↗</a></div></article>`).join('')}</div><p id="directoryEmpty" hidden>No matching material. Try the compound name or labeled amount, or <a href="sms:+17542907210">text us for help</a>.</p><section class="product-docs"><h2>Research purchasing, with clear next steps.</h2><p>Review the <a href="/coa.html">available lot reports</a>, select a pack, then continue to the catalog to add it to your cart. <a href="/how-to-order.html">Our ordering guide</a> explains crypto payment. For local fulfillment, <a href="/south-florida-research.html#local-inquiry">confirm your delivery address or pickup appointment</a> before payment.</p></section>${footer}</main><script src="/catalog-directory.js?v=20261020-1" defer></script></body></html>`;
}
function build() {
 const products = catalog();
 const output = new Map();
 for (const p of products) {
  const file = p.path.slice(1);
  if (['cjc1295-dac-10','cjc1295-no-dac-10','pt141-10','bac-water-10ml','glutathione-1500'].includes(p.id) || !fs.existsSync(path.join(root,file))) { output.set(file,newProduct(p)); continue; }
  let html = read(file);
  if (html.includes('<!-- catalog-purchase:start -->')) html = html.replace(/<!-- catalog-purchase:start -->[\s\S]*?<!-- catalog-purchase:end -->/,()=>panel(p));
  else html = html.replace(/(<div class="specs">[\s\S]*?<\/div><\/div>)/, match=>match+panel(p));
  if (!html.includes('<!-- catalog-purchase:start -->')) throw new Error('No product insertion point: '+file);
  if (!html.includes('/catalog-experience.css')) html = html.replace('</head>','<link rel="stylesheet" href="/catalog-experience.css?v=20261020-1"></head>');
  if (!html.includes('/product-purchase.js')) html = html.replace('</body>','<script src="/product-purchase.js?v=20261020-1" defer></script></body>');
  html = html.replace('class="miami-site"','class="miami-site product-detail"');
  html = html.replace(/<a class="catalog-skip"[^>]*>[\s\S]*?<\/a>/g,'');
  html = html.replace('<main class="wrap">','<main class="wrap" id="main-content">');
  html = html.replace(/<nav[^>]*>[\s\S]*?<\/nav>/,()=>nav);
  html = html.replace(/Current stock, pack sizes and pricing are maintained in the live storefront\.|Compare pack pricing below and confirm current availability and lot documentation before payment\./g,'Compare the pack options above and confirm current availability and lot documentation before payment.');
  html = html.replace(/<section class="catalog-detail-actions">[\s\S]*?<\/section>/,'');
  const description = `${p.name} research material: compare pack prices, labeled amount and format. Review lot documentation, U.S. shipping and confirmed South Florida delivery.`;
  html = html.replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*(")/g,(_,a,b)=>a+esc(description)+b);
  output.set(file,html);
 }
 output.set('catalog.html',directory(products));
 let home = read('index.html').replace(/const researchPagePaths = \{[\s\S]*?\};/, 'const researchPagePaths = '+JSON.stringify(paths,null,2)+';');
 output.set('index.html',home);
 return output;
}
if (require.main === module) {
 const output=build();
 let stale=false;
 for (const [file,html] of output) {
  const exists=fs.existsSync(path.join(root,file));
  if (!exists || read(file)!==html) {
   if(process.argv.includes('--check')) { console.error('Regenerate: '+file);stale=true; }
   else fs.writeFileSync(path.join(root,file),html);
  }
 }
 if(stale) process.exitCode=1;
 else console.log('Catalog pages synchronized: '+output.size+' files checked.');
}
module.exports={catalog,build,panel};
