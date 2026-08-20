// Secure Transak session creator for embedded Apple Pay / card checkout.
// Required Vercel env vars:
//   TRANSAK_API_KEY
//   TRANSAK_API_SECRET
//   TRANSAK_WALLET_ADDRESS
// Optional:
//   TRANSAK_ENV=staging|production (default: staging)
//   TRANSAK_CRYPTO_CODE=USDT (default: USDT)
//   TRANSAK_NETWORK=ethereum (default: ethereum)
//   TRANSAK_REFERRER_DOMAIN=nxtlvl-research.com

const ACCESS_CACHE = { token: null, expiresAt: 0 };

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(body));
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

async function getAccessToken({ apiKey, apiSecret, env }) {
  const now = Math.floor(Date.now() / 1000);
  if (ACCESS_CACHE.token && ACCESS_CACHE.expiresAt > now + 60) return ACCESS_CACHE.token;

  const authBase = env === 'production' ? 'https://api.transak.com' : 'https://api-stg.transak.com';
  const response = await fetch(`${authBase}/partners/api/v2/refresh-token`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-secret': apiSecret,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ apiKey })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.data?.accessToken) {
    const message = data?.message || data?.error || 'Unable to authenticate with Transak.';
    throw new Error(message);
  }

  ACCESS_CACHE.token = data.data.accessToken;
  ACCESS_CACHE.expiresAt = Number(data.data.expiresAt) || now + 900;
  return ACCESS_CACHE.token;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const apiKey = process.env.TRANSAK_API_KEY;
  const apiSecret = process.env.TRANSAK_API_SECRET;
  const walletAddress = process.env.TRANSAK_WALLET_ADDRESS;
  const env = String(process.env.TRANSAK_ENV || 'staging').toLowerCase() === 'production' ? 'production' : 'staging';

  if (!apiKey || !apiSecret || !walletAddress) {
    return json(res, 503, {
      error: 'Transak is not configured yet.',
      setupRequired: true,
      missing: [
        !apiKey && 'TRANSAK_API_KEY',
        !apiSecret && 'TRANSAK_API_SECRET',
        !walletAddress && 'TRANSAK_WALLET_ADDRESS'
      ].filter(Boolean)
    });
  }

  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount < 5 || amount > 10000) {
    return json(res, 400, { error: 'Invalid checkout amount.' });
  }

  const orderId = String(req.body?.orderId || `NXT-${Date.now()}`).slice(0, 100);
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().slice(0, 180) : '';
  const cryptoCurrencyCode = String(process.env.TRANSAK_CRYPTO_CODE || 'USDT').toUpperCase();
  const network = String(process.env.TRANSAK_NETWORK || 'ethereum').toLowerCase();
  const referrerDomain = String(process.env.TRANSAK_REFERRER_DOMAIN || req.headers.host || 'nxtlvl-research.com').replace(/^https?:\/\//, '').split('/')[0];

  try {
    const accessToken = await getAccessToken({ apiKey, apiSecret, env });
    const gatewayBase = env === 'production' ? 'https://api-gateway.transak.com' : 'https://api-gateway-stg.transak.com';

    const widgetParams = {
      apiKey,
      referrerDomain,
      productsAvailed: 'BUY',
      fiatAmount: Number(amount.toFixed(2)),
      fiatCurrency: 'USD',
      cryptoCurrencyCode,
      network,
      walletAddress,
      disableWalletAddressForm: true,
      partnerOrderId: orderId,
      hideExchangeScreen: false,
      themeColor: '7C3AED'
    };
    if (email) widgetParams.email = email;

    const response = await fetch(`${gatewayBase}/api/v2/auth/session`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'access-token': accessToken,
        'x-api-key': apiKey,
        'x-user-ip': clientIp(req),
        'content-type': 'application/json'
      },
      body: JSON.stringify({ widgetParams })
    });

    const data = await response.json().catch(() => ({}));
    const widgetUrl = data?.data?.widgetUrl;
    if (!response.ok || !widgetUrl) {
      return json(res, response.status || 502, {
        error: data?.message || data?.error || 'Unable to start Transak checkout.'
      });
    }

    return json(res, 200, { widgetUrl, orderId, environment: env });
  } catch (error) {
    console.error('Transak session error:', error);
    return json(res, 502, { error: error.message || 'Unable to start Transak checkout.' });
  }
};
