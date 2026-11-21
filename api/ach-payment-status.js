const { applyCors, json } = require('../lib/direct-payment');
const { credentialsConfigured, limitRequests, paymentStatus } = require('../lib/mercury-ach');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  // Same-origin GETs normally omit Origin. The receipt is an explicit bearer
  // capability, never cookie/ambient authentication; validate Origin when sent.
  if ((req.headers || {}).origin && !applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return json(res, 405, { error: 'Method not allowed.' });
  }
  if (!credentialsConfigured()) return json(res, 503, { error: 'Bank-payment status is temporarily unavailable. Please contact support.' });
  try {
    const match = /^Bearer ([A-Za-z0-9_.-]+)$/.exec(String((req.headers || {}).authorization || ''));
    if (!match) return json(res, 401, { error: 'A bank-payment receipt is required.' });
    await limitRequests(req, 'status', 240);
    return json(res, 200, await paymentStatus(match[1]));
  } catch (error) {
    console.error('ACH invoice status failed', { code: error.code || 'status_unavailable', status: error.httpStatus || 503 });
    return json(res, Number(error.httpStatus) || 503, { error: error.message || 'Bank-payment status is temporarily unavailable.' });
  }
};
