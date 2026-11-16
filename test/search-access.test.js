const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {catalog, build} = require('../scripts/build-catalog-pages.cjs');
const {enhance} = require('../scripts/visitor-entry-markup.cjs');
const root = path.join(__dirname, '..');

test('every indexed HTML page includes page content and an age/research overlay at its canonical URL', () => {
  const output = build();
  const sitemap = output.get('sitemap.xml');
  const locations = [...sitemap.matchAll(/<loc>https:\/\/www\.nxtlvl-research\.com([^<]*)<\/loc>/g)].map(m=>m[1]);
  assert.ok(locations.length > 40);
  for (const location of locations) {
    const file = location === '/' ? 'index.html' : location.slice(1);
    const html = output.get(file) || fs.readFileSync(path.join(root,file),'utf8');
    assert.match(html, /<h1\b/, file);
    assert.equal((html.match(/id="nxt-entry"/g)||[]).length, 1, file);
    assert.match(html, /name="age" type="radio" value="no"/, file);
    assert.match(html, /name="research" type="checkbox" value="yes" required/, file);
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/, file);
    assert.equal(enhance(html), html, 'Overlay must be idempotent: '+file);
  }
  assert.doesNotMatch(sitemap, /\/entry/);
});

test('product search descriptions and schema use the current single-vial price', () => {
  const output = build();
  for (const p of catalog()) {
    const html = output.get(p.path.slice(1));
    const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
    assert.ok(description.includes('$'+(p.options[0].cents/100).toFixed(2)), p.id);
    assert.match(description, /Laboratory research only/);
    assert.equal((html.match(/class="catalog-skip"/g)||[]).length, 1, p.id);
    assert.match(html, /href="\/south-florida-research.html">Research peptides in Florida<\/a>/, p.id);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1])['@graph']||[]);
    const product = blocks.find(item=>item['@type']==='Product');
    assert.equal(Number(product.offers.price)*100, p.options[0].cents, p.id);
  }
});
