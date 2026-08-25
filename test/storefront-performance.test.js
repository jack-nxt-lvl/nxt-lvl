const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const catalogOverrides = fs.readFileSync(path.join(root, 'products-data.js'), 'utf8');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

test('homepage uses stable catalog URLs instead of cache-busting every visit', () => {
  assert.doesNotMatch(homepage, /document\.write\([^\n]*Date\.now/);
  assert.doesNotMatch(catalogOverrides, /document\.write|Date\.now\(\)/);
  assert.match(homepage, /products-data-original\.js\?v=20260824-performance-1/);
  assert.match(homepage, /cjc-products\.js\?v=20260824-performance-1/);
  assert.match(homepage, /products-data\.js\?v=20260824-performance-1/);
});

test('catalog dependencies load in the required order and every local asset exists', () => {
  const orderedScripts = [
    'products-data-original.js?v=20260824-performance-1',
    'cjc-products.js?v=20260824-performance-1',
    'products-data.js?v=20260824-performance-1',
    'premium-enhancements.js?v=20260824-performance-1',
  ];
  let previous = -1;
  for (const source of orderedScripts) {
    const index = homepage.indexOf(source);
    assert.ok(index > previous, `${source} should load after its dependency`);
    previous = index;
  }

  const localAssets = [
    ...homepage.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["'](\/[^"']+)["']/g),
  ].map((match) => match[1].split('?')[0]);
  for (const asset of localAssets) {
    assert.ok(fs.existsSync(path.join(root, asset)), `missing homepage asset: ${asset}`);
  }
});

test('static storefront files are cacheable and the homepage never clears browser cache', () => {
  const allHeaders = vercel.headers.flatMap((rule) => rule.headers || []);
  assert.equal(allHeaders.some((header) => header.key.toLowerCase() === 'clear-site-data'), false);

  const rootRule = vercel.headers.find((rule) => rule.source === '/');
  const jsRule = vercel.headers.find((rule) => rule.source === '/(.*).js');
  const cssRule = vercel.headers.find((rule) => rule.source === '/(.*).css');
  const cacheValue = (rule) => rule.headers.find((header) => header.key === 'Cache-Control').value;

  assert.match(cacheValue(rootRule), /s-maxage=300/);
  assert.doesNotMatch(cacheValue(rootRule), /no-store|no-cache/);
  assert.match(cacheValue(jsRule), /max-age=86400/);
  assert.match(cacheValue(cssRule), /max-age=86400/);
});

test('expensive molecular animation is skipped on mobile and delayed on desktop', () => {
  assert.match(homepage, /if \(mobileCanvas \|\| reduceMotion\) \{\s*canvas\.remove\(\);\s*return;/);
  assert.match(homepage, /requestIdleCallback\(scheduleDraw, \{ timeout: 1500 \}\)/);
});
