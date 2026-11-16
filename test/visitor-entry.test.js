const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/visitor-entry');
const config = require('../vercel.json');

function submit(body, headers = {}, method = 'POST') {
  const res = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    end() { return this; },
    send() { return this; },
    json(body) { this.body = body; return this; },
  };
  handler({ method, body, headers }, res);
  return res;
}

test('entry requires affirmative age and research attestations in the same submission', () => {
  for (const body of [{}, { age: 'yes' }, { research: 'yes' }, { age: 'no', research: 'yes' }]) {
    const response = submit(body);
    assert.equal(response.statusCode, 403);
    assert.equal(response.headers['Set-Cookie'], undefined);
  }
  assert.equal(submit({}, {}, 'DELETE').statusCode, 405);
  assert.equal(submit({ age: 'yes', research: 'yes' }, { 'sec-fetch-site': 'cross-site' }).statusCode, 403);
});

test('entry grants a secure session cookie and restores the requested URL for native forms and PDFs', () => {
  const returnTo = '/research/example.html?via=qr#overview';
  const response = submit({ age: 'yes', research: 'yes', returnTo });
  const route = config.redirects.find(rule => rule.destination === '/entry/:page');
  const { key, value } = route.missing[0];
  assert.equal(response.statusCode, 303);
  assert.equal(response.headers.Location, returnTo);
  assert.equal(response.headers['Set-Cookie'], key + '=' + value + '; Path=/; HttpOnly; Secure; SameSite=Lax');
  assert.match(response.headers['Cache-Control'], /no-store/);
});

test('same-page consent checks are private and require the exact accepted cookie', () => {
  for (const cookie of ['', '__Host-nxt-entry=v0', 'other__Host-nxt-entry=v1', '__Host-nxt-entry=v11']) {
    const response = submit({}, {cookie}, 'GET');
    assert.deepEqual(response.body, {accepted:false});
    assert.match(response.headers['Cache-Control'], /no-store/);
    assert.equal(response.headers['Set-Cookie'], undefined);
  }
  assert.deepEqual(submit({}, {cookie:'other=1; __Host-nxt-entry=v1'}, 'GET').body, {accepted:true});
  const confirmed = submit({age:'yes',research:'yes'}, {accept:'application/json'});
  assert.equal(confirmed.statusCode, 200);
  assert.deepEqual(confirmed.body, {accepted:true});
  assert.equal(confirmed.headers.Location, undefined);
  assert.match(confirmed.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Lax/);
});

test('HTML pages stay at their own URLs while document downloads retain the entry redirect', () => {
  const entryRedirects = config.redirects.filter(rule=>rule.destination.startsWith('/entry'));
  assert.equal(entryRedirects.length, 1);
  const pattern = new RegExp('^/' + entryRedirects[0].source.slice('/:page('.length, -1) + '$');
  for (const url of ['/', '/catalog.html', '/research/bpc-157.html', '/south-florida-research.html', '/entry/handbook.pdf']) assert.equal(pattern.test(url), false, url);
  assert.equal(pattern.test('/handbook.pdf'), true);
});

test('entry only returns visitors to local pages, including native form submissions', () => {
  for (const returnTo of ['//example.com', '/\\example.com', 'https://example.com/', '/a/..//example.com']) {
    assert.equal(submit({ age: 'yes', research: 'yes', returnTo }).headers.Location, '/');
  }
  assert.equal(submit({ age: 'yes', research: 'yes' }, {
    host: 'www.nxtlvl-research.com', referer: 'https://www.nxtlvl-research.com/entry/handbook.pdf?from=home',
  }).headers.Location, '/handbook.pdf?from=home');
});
