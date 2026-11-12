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
  assert.equal(submit({}, {}, 'GET').statusCode, 405);
  assert.equal(submit({ age: 'yes', research: 'yes' }, { 'sec-fetch-site': 'cross-site' }).statusCode, 403);
});

test('entry grants a session cookie for the redirect rule and restores the requested URL', () => {
  const returnTo = '/research/example.html?via=qr#overview';
  const response = submit({ age: 'yes', research: 'yes', returnTo });
  const route = config.redirects.find(rule => rule.destination === '/entry/:page');
  const { key, value } = route.missing[0];
  assert.equal(response.statusCode, 303);
  assert.equal(response.headers.Location, returnTo);
  assert.equal(response.headers['Set-Cookie'], key + '=' + value + '; Path=/; HttpOnly; Secure; SameSite=Lax');
  assert.match(response.headers['Cache-Control'], /no-store/);
});

test('entry only returns visitors to local pages, including native form submissions', () => {
  for (const returnTo of ['//example.com', '/\\example.com', 'https://example.com/', '/a/..//example.com']) {
    assert.equal(submit({ age: 'yes', research: 'yes', returnTo }).headers.Location, '/');
  }
  assert.equal(submit({ age: 'yes', research: 'yes' }, {
    host: 'www.nxtlvl-research.com', referer: 'https://www.nxtlvl-research.com/entry/handbook.pdf?from=home',
  }).headers.Location, '/handbook.pdf?from=home');
});
