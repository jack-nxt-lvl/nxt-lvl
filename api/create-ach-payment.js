const { applyCors, cleanCustomer, json, normalizeOrder } = require('../lib/direct-payment');
const { priceForEmail } = require('../lib/email-offer');
const { requireApproval } = require('../lib/research-access');
const { POLICY_VERSION } = require('../lib/crypto-checkout-access');
const { creationConfigured, limitRequests, createPayment } = require('../lib/mercury-ach');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed.' });
  }
  if (!creationConfigured()) return json(res, 503, { error: 'Bank payments are not available yet. Please contact support.' });
  try {
    const body = req.body || {};
    if (!body.researchConsent || body.researchConsent.attestation !== true || body.researchConsent.policyVersion !== POLICY_VERSION) {
      return json(res, 400, { error: 'Read and accept the research-use and ordering terms before payment.' });
    }
    await limitRequests(req, 'create', 20);
    const base = normalizeOrder(body.items, body.fulfillment);
    const customer = cleanCustomer(body.customer, base.mode);
    const order = await priceForEmail(base, customer.email, body.promoCode);
    const approval = await requireApproval(body, order, customer, 'mercury-ach');
    return json(res, 200, await createPayment({ order, customer, approval }));
  } catch (error) {
    // Never log the API token, approval code, customer, or provider response body.
    console.error('ACH invoice request failed', { code: error.code || 'order_validation', status: error.httpStatus || 400 });
    return json(res, Number(error.httpStatus) || 400, { error: error.message || 'The bank-payment invoice could not be confirmed.' });
  }
};
