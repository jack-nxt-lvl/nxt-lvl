const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const { buildWidgetParams } = require('../lib/transak-funding');

const QUOTE = Object.freeze({
  asset: 'USDT',
  amountDisplay: '20.000856',
  address: '0xcAB4A4f03D32dA598EfdAba944753415f4915281',
  orderId: 'NXT-EXACT-FEES',
});

test('targets the exact crypto receive amount instead of the invoice fiat spend', () => {
  const params = buildWidgetParams({
    apiKey: 'test-api-key',
    referrerDomain: 'nxtlvl-research.com',
    quote: QUOTE,
  });

  assert.equal(params.productsAvailed, 'BUY');
  assert.equal(params.fiatCurrency, 'USD');
  assert.equal(params.cryptoCurrencyCode, 'USDT');
  assert.equal(params.network, 'ethereum');
  assert.equal(params.defaultCryptoAmount, 20.000856);
  assert.equal(params.walletAddress, QUOTE.address);
  assert.equal(params.disableWalletAddressForm, true);
  assert.equal(params.partnerOrderId, QUOTE.orderId);
  assert.equal(params.fiatAmount, undefined);
  assert.equal(params.defaultFiatAmount, undefined);
});

test('supports exact-amount BTC and ETH card funding targets', () => {
  const btc = buildWidgetParams({
    apiKey: 'key',
    referrerDomain: 'nxtlvl-research.com',
    quote: { ...QUOTE, asset: 'BTC', amountDisplay: '0.00109879', address: 'bc1qtest' },
  });
  const eth = buildWidgetParams({
    apiKey: 'key',
    referrerDomain: 'nxtlvl-research.com',
    quote: { ...QUOTE, asset: 'ETH', amountDisplay: '0.12345678' },
  });
  assert.equal(btc.network, 'bitcoin');
  assert.equal(btc.defaultCryptoAmount, 0.00109879);
  assert.equal(eth.network, 'ethereum');
  assert.equal(eth.defaultCryptoAmount, 0.12345678);
});

test('rejects malformed or unsupported funding targets', () => {
  assert.throws(() => buildWidgetParams({ apiKey: 'key', referrerDomain: 'x.com', quote: { ...QUOTE, asset: 'SOL' } }), /unsupported/i);
  assert.throws(() => buildWidgetParams({ apiKey: 'key', referrerDomain: 'x.com', quote: { ...QUOTE, amountDisplay: '20&fiatAmount=1' } }), /invalid/i);
  assert.throws(() => buildWidgetParams({ apiKey: 'key', referrerDomain: 'x.com', quote: { ...QUOTE, address: '' } }), /wallet/i);
});

test('creates card sessions only from the authenticated server quote', () => {
  const source = readFileSync(join(__dirname, '..', 'api', 'create-transak-session.js'), 'utf8');
  assert.match(source, /verifyQuote\(req\.body && req\.body\.quoteToken\)/);
  assert.match(source, /buildWidgetParams\([\s\S]*quote,/);
  assert.doesNotMatch(source, /req\.body\?\.amount|req\.body && req\.body\.amount/);
  assert.match(source, /feesIncludedInCardTotal: true/);
});

test('sends Transak the signed exact receive target and ignores browser overrides', async () => {
  const originalFetch = global.fetch;
  const envKeys = ['CRYPTO_QUOTE_SECRET', 'TRANSAK_API_KEY', 'TRANSAK_API_SECRET', 'TRANSAK_ENV', 'TRANSAK_REFERRER_DOMAIN'];
  const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  let sessionRequest;

  process.env.CRYPTO_QUOTE_SECRET = 'test-only-quote-secret-that-is-long-enough';
  process.env.TRANSAK_API_KEY = 'test-api-key';
  process.env.TRANSAK_API_SECRET = 'test-api-secret';
  process.env.TRANSAK_ENV = 'production';
  process.env.TRANSAK_REFERRER_DOMAIN = 'nxtlvl-research.com';

  const { ASSETS, signQuote } = require('../lib/direct-payment');
  const handler = require('../api/create-transak-session');
  const quoteToken = signQuote({
    v: 1,
    orderId: QUOTE.orderId,
    asset: 'USDT',
    address: ASSETS.USDT.address,
    amountUnits: '20000856',
    amountDisplay: QUOTE.amountDisplay,
    confirmations: 64,
    totalCents: 2000,
    itemDigest: 'trusted-items',
    customerDigest: 'trusted-customer',
    fulfillment: 'pickup',
    createdAt: Date.now(),
    expiresAt: Date.now() + 60_000,
  });

  global.fetch = async (url, options = {}) => {
    if (String(url).endsWith('/partners/api/v2/refresh-token')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { accessToken: 'test-access-token', expiresAt: Math.floor(Date.now() / 1000) + 900 } }),
      };
    }
    if (String(url).endsWith('/api/v2/auth/session')) {
      sessionRequest = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { widgetUrl: 'https://global.transak.com/session/test' } }),
      };
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };

  const res = {
    statusCode: 0,
    headers: {},
    body: '',
    status(value) { this.statusCode = value; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
    end(value = '') { this.body = value; return this; },
  };

  try {
    await handler({
      method: 'POST',
      headers: {
        origin: 'https://nxtlvl-research.com',
        host: 'nxtlvl-research.com',
        'x-forwarded-for': '203.0.113.10',
      },
      socket: {},
      body: {
        quoteToken,
        amount: '1',
        address: '0x0000000000000000000000000000000000000000',
      },
    }, res);
  } finally {
    global.fetch = originalFetch;
    for (const key of envKeys) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  }

  assert.equal(res.statusCode, 200);
  assert.equal(sessionRequest.widgetParams.defaultCryptoAmount, 20.000856);
  assert.equal(sessionRequest.widgetParams.walletAddress, ASSETS.USDT.address);
  assert.equal(sessionRequest.widgetParams.partnerOrderId, QUOTE.orderId);
  assert.equal(sessionRequest.widgetParams.fiatAmount, undefined);
  assert.equal(sessionRequest.widgetParams.defaultFiatAmount, undefined);
});
