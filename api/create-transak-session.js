const {
  applyCors,
  json,
  verifyQuote,
} = require('../lib/direct-payment');
const { buildWidgetParams } = require('../lib/transak-funding');

const ACCESS_CACHE = { token: null, expiresAt: 0, environment: null };

function providerMessage(data, fallback) {
  const value = data && (data.message || data.error);
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') {
    const nested = value.message || value.error || value.description;
    if (typeof nested === 'string' && nested.trim()) return nested.trim();
  }
  return fallback;
}

function clientIp(req) {
  const forwarded = req.headers && req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  return String(req.headers && req.headers['x-real-ip'] || req.socket && req.socket.remoteAddress || '127.0.0.1');
}

function referrerDomain(req) {
  const raw = process.env.TRANSAK_REFERRER_DOMAIN
    || req.headers && req.headers['x-forwarded-host']
    || req.headers && req.headers.host
    || 'nxtlvl-research.com';
  return String(raw).replace(/^https?:\/\//i, '').split('/')[0].split(',')[0].trim();
}

function environmentConfig() {
  const environment = String(process.env.TRANSAK_ENV || 'production').toLowerCase() === 'staging'
    ? 'staging'
    : 'production';
  return {
    environment,
    apiBase: environment === 'staging' ? 'https://api-stg.transak.com' : 'https://api.transak.com',
    gatewayBase: environment === 'staging' ? 'https://api-gateway-stg.transak.com' : 'https://api-gateway.transak.com',
  };
}

async function accessToken(apiKey, apiSecret, config) {
  const now = Math.floor(Date.now() / 1000);
  if (ACCESS_CACHE.token
    && ACCESS_CACHE.environment === config.environment
    && ACCESS_CACHE.expiresAt > now + 60) {
    return ACCESS_CACHE.token;
  }

  const response = await fetch(`${config.apiBase}/partners/api/v2/refresh-token`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-secret': apiSecret,
      'x-api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ apiKey }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data || !data.data || !data.data.accessToken) {
    throw new Error(providerMessage(data, 'Transak authentication failed.'));
  }

  ACCESS_CACHE.token = data.data.accessToken;
  ACCESS_CACHE.environment = config.environment;
  ACCESS_CACHE.expiresAt = Number(data.data.expiresAt) || now + 900;
  return ACCESS_CACHE.token;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });

  const apiKey = process.env.TRANSAK_API_KEY;
  const apiSecret = process.env.TRANSAK_API_SECRET;
  const missing = [!apiKey && 'TRANSAK_API_KEY', !apiSecret && 'TRANSAK_API_SECRET'].filter(Boolean);
  if (missing.length) {
    return json(res, 503, {
      error: 'Card and Apple Pay checkout is not fully configured.',
      setupRequired: true,
      missing,
    });
  }

  try {
    const quote = verifyQuote(req.body && req.body.quoteToken);
    if (Date.now() > Number(quote.expiresAt)) {
      return json(res, 400, { error: 'This payment quote expired. Create a new checkout quote.' });
    }

    const config = environmentConfig();
    const widgetParams = buildWidgetParams({
      apiKey,
      referrerDomain: referrerDomain(req),
      quote,
    });
    const token = await accessToken(apiKey, apiSecret, config);
    const createSession = (formattedToken) => fetch(`${config.gatewayBase}/api/v2/auth/session`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'access-token': formattedToken,
        'x-api-key': apiKey,
        'x-user-ip': clientIp(req),
        'content-type': 'application/json',
      },
      body: JSON.stringify({ widgetParams }),
    });

    let response = await createSession(token);
    let data = await response.json().catch(() => ({}));
    if (!response.ok && !String(token).startsWith('Bearer ')) {
      response = await createSession(`Bearer ${token}`);
      data = await response.json().catch(() => ({}));
    }

    const widgetUrl = data && data.data && data.data.widgetUrl;
    if (!response.ok || !widgetUrl) {
      return json(res, response.status || 502, {
        error: providerMessage(data, 'Unable to start secure card checkout.'),
      });
    }

    return json(res, 200, {
      widgetUrl,
      orderId: quote.orderId,
      environment: config.environment,
      crypto: quote.asset,
      network: widgetParams.network,
      targetCryptoAmount: String(quote.amountDisplay),
      feesIncludedInCardTotal: true,
    });
  } catch (error) {
    console.error('Transak session error:', error);
    const quoteError = /payment quote|quote could not be authenticated|quote is invalid|too old|expired/i.test(String(error && error.message));
    return json(res, quoteError ? 400 : 502, {
      error: error && error.message || 'Unable to start secure card checkout.',
    });
  }
};
