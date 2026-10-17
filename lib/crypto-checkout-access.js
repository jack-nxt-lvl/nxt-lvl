const crypto = require('node:crypto');
const { redisCommand } = require('./payment-ledger');
const POLICY_VERSION = '2026-10-17-final-sale';
class CryptoCheckoutError extends Error {
  constructor(message, status = 400) { super(message); this.httpStatus = status; }
}
function enabled() { return process.env.DIRECT_CRYPTO_CHECKOUT_ENABLED === 'true'; }
async function ready() {
  const configured = enabled() && String(process.env.CRYPTO_QUOTE_SECRET || '').length >= 32
    && Boolean((process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)
      && (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN));
  if (!configured) return false;
  try { return await redisCommand(['PING']) === 'PONG'; }
  catch (_) { return false; }
}
async function authorize(req, customer) {
  if (!enabled()) throw new CryptoCheckoutError('Crypto checkout is temporarily unavailable. Contact support before sending funds.', 403);
  const consent = req.body && req.body.researchConsent;
  if (!consent || consent.attestation !== true || consent.policyVersion !== POLICY_VERSION) {
    throw new CryptoCheckoutError('Read and accept the research-use and ordering terms before payment.');
  }
  const regions = new Set('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY AS GU MP PR VI AA AE AP'.split(' '));
  if (!regions.has(String(customer.state).toUpperCase()) || !/^\d{5}(?:-\d{4})?$/.test(customer.zip)) {
    throw new CryptoCheckoutError('Enter a valid U.S. state or territory code and ZIP code. Shipping is available within the USA only.');
  }
  const secret = String(process.env.CRYPTO_QUOTE_SECRET || '');
  if (secret.length < 32) throw new CryptoCheckoutError('Crypto checkout is not configured. Please contact support.', 503);
  const ip = String((req.headers || {})['x-forwarded-for'] || (req.headers || {})['x-real-ip'] || 'unknown').split(',')[0].trim();
  const digest = crypto.createHmac('sha256', secret).update(ip).digest('hex');
  const key = 'nxt:crypto-checkout:rate:' + Math.floor(Date.now() / 3600000) + ':' + digest;
  const count = Number(await redisCommand(['INCR', key]));
  await redisCommand(['EXPIRE', key, '7200']);
  if (!Number.isFinite(count) || count > 30) throw new CryptoCheckoutError('Too many payment quotes. Please wait before trying again or contact support.', 429);
  // Records an acknowledgment, never proof of purchaser or product eligibility.
  return { policyVersion: POLICY_VERSION, acknowledgedAt: Date.now() };
}
module.exports = { POLICY_VERSION, CryptoCheckoutError, enabled, ready, authorize };
