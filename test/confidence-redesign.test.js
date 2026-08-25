const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function htmlFiles(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name === '.git') return [];
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

test('every public HTML page loads the confidence redesign exactly once', () => {
  const pages = htmlFiles();
  assert.ok(pages.length >= 36);
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    const references = html.match(/confidence-redesign\.css\?v=20260825-confidence-1/g) || [];
    assert.equal(references.length, 1, path.relative(root, page));
    assert.ok(fs.existsSync(path.join(root, 'confidence-redesign.css')));
  }
});

test('the visual layer includes the green confidence palette and responsive layout', () => {
  const css = fs.readFileSync(path.join(root, 'confidence-redesign.css'), 'utf8');
  assert.match(css, /--nxt-green:\s*#55f58a/);
  assert.match(css, /--nxt-green-bright:\s*#a7ff5f/);
  assert.match(css, /@media \(max-width: 768px\)/);
  assert.match(css, /\.cart-drawer/);
  assert.match(css, /\.nxt-checkout-card/);
  assert.match(css, /\.nxt-pay-path\.card/);
});

test('homepage catalog and Paybis scripts remain connected after the visual change', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /products-data-original\.js\?v=20260824-performance-1/);
  assert.match(html, /data-nxt-paybis-funding="1"/);
  assert.match(html, /lib\/paybis-funding\.js\?v=20260824-paybis-only-1/);
  assert.match(html, /direct-wallet-checkout\.js\?v=20260824-paybis-only-1/);
  assert.match(html, /customer-checkout-upgrade\.js\?v=20260824-paybis-only-1/);
});
