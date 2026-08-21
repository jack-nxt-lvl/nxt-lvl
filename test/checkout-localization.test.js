const test = require('node:test');
const assert = require('node:assert/strict');

const {
  currencyForCountry,
  fundingGuidance,
  localizeOrderTotal,
  requestCountry,
} = require('../lib/checkout-localization');
const findHandler = require('../api/find-direct-payment');

test('uses trusted Vercel country metadata before the browser locale', () => {
  const req = { headers: { 'x-vercel-ip-country': 'GB' } };
  assert.equal(requestCountry(req, 'fr-FR'), 'GB');
  assert.equal(currencyForCountry('GB'), 'GBP');
  assert.equal(currencyForCountry('FR'), 'EUR');
});

test('shows an approximate localized total without changing the USD order', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    assert.equal(String(url), 'https://api.frankfurter.dev/v2/rate/USD/GBP');
    return {
      ok: true,
      json: async () => ({ date: '2026-08-20', base: 'USD', quote: 'GBP', rate: 0.75 }),
    };
  };
  try {
    const result = await localizeOrderTotal(
      { headers: { 'x-vercel-ip-country': 'GB' } },
      6500,
      'en-GB',
    );
    assert.equal(result.currency, 'GBP');
    assert.equal(result.formattedTotal, '£48.75');
    assert.equal(result.usdFormattedTotal, '$65.00');
    assert.equal(result.approximate, true);
    assert.match(result.funding.title, /Apple Pay/i);
    assert.match(result.funding.detail, /accepts crypto only/i);
  } finally {
    global.fetch = originalFetch;
  }
});

test('keeps USD local display dependency-free and caps long polling', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error('USD localization must not fetch FX data.'); };
  try {
    const result = await localizeOrderTotal(
      { headers: { 'x-vercel-ip-country': 'US' } },
      6500,
      'en-US',
    );
    assert.equal(result.currency, 'USD');
    assert.equal(result.formattedTotal, '$65.00');
    assert.equal(result.approximate, false);
    assert.deepEqual(fundingGuidance('US').methods.slice(0, 2), ['Apple Pay', 'debit or credit card']);
    assert.equal(findHandler.requestedWaitMs({ waitMs: 60_000 }), findHandler.MAX_LONG_POLL_MS);
    assert.equal(findHandler.requestedWaitMs({ waitMs: -1 }), 0);
    assert.equal(findHandler.temporaryDiscoveryError(new Error('The operation was aborted due to timeout')), true);
    assert.equal(await findHandler.withDiscoveryTimeout(() => Promise.resolve('ok'), 20), 'ok');
    await assert.rejects(
      findHandler.withDiscoveryTimeout(() => new Promise(() => {}), 5),
      /discovery timed out/i,
    );
  } finally {
    global.fetch = originalFetch;
  }
});
