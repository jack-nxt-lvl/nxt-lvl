const { applyCors, cleanCustomer, json, normalizeOrder, randomOrderId } = require('../lib/direct-payment');
const {
  abandonRequest,
  beginRequest,
  cardLinkCapabilities,
  createStripeCheckoutSession,
  deliverHostedLink,
  enforceRateLimit,
  finishRequest,
  notifyMerchantLinkSent,
  requestDigest,
} = require('../lib/hosted-card-link');
const { normalizePhone } = require('../lib/sms');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });

  let lease = null;
  let digest = '';
  try {
    const capabilities = cardLinkCapabilities();
    const channel = String(req.body && req.body.channel || '').toLowerCase();
    if (channel !== 'email' && channel !== 'sms' && channel !== 'both') {
      return json(res, 400, { error: 'Choose email, text, or both delivery methods.' });
    }
    if (!capabilities[channel]) {
      const method = channel === 'both' ? 'Email and text' : channel === 'sms' ? 'Text' : 'Email';
      return json(res, 503, { error: `${method} payment-link delivery is not configured.` });
    }
    if ((channel === 'sms' || channel === 'both') && req.body && req.body.smsConsent !== true) {
      return json(res, 400, { error: 'Consent is required before sending a payment link by text.' });
    }

    const order = normalizeOrder(req.body && req.body.items, req.body && req.body.fulfillment);
    const customer = cleanCustomer(req.body && req.body.customer, order.mode);
    if (channel === 'sms' || channel === 'both') customer.phone = normalizePhone(customer.phone);
    const requestId = String(req.body && req.body.requestId || '');
    digest = requestDigest({ requestId, order, customer, channel });
    await enforceRateLimit(req, customer);
    lease = await beginRequest(requestId, digest);
    if (lease.duplicate) {
      return json(res, lease.sent ? 200 : 202, {
        sent: lease.sent,
        duplicate: true,
        message: lease.sent ? 'That secure payment link was already sent.' : 'That secure payment link is already being prepared.',
      });
    }

    const orderId = randomOrderId();
    const session = await createStripeCheckoutSession({ order, customer, orderId, requestId });
    await deliverHostedLink({ channel, customer, order, orderId, session, requestId });
    await notifyMerchantLinkSent({ channel, customer, order, orderId, requestId }).catch((error) => {
      console.error('Card-link merchant notification error:', error);
    });
    await finishRequest(lease.key, digest);

    const maskedPhone = customer.phone.replace(/.(?=.{4})/g, '•');
    const destination = channel === 'email'
      ? customer.email
      : channel === 'sms'
        ? maskedPhone
        : `${customer.email} and ${maskedPhone}`;
    const deliveryLabel = channel === 'both' ? 'email and text' : channel === 'email' ? 'email' : 'text';
    return json(res, 200, {
      sent: true,
      orderId,
      channel,
      destination,
      expiresAt: session.expiresAt,
      message: `Secure payment link sent by ${deliveryLabel}.`,
    });
  } catch (error) {
    if (lease && lease.key && digest) await abandonRequest(lease.key, digest);
    console.error('Hosted card-link request error:', error);
    return json(res, Number(error.httpStatus) || (/not configured|ledger/i.test(String(error.message)) ? 503 : 400), {
      error: error.message || 'Unable to send the secure payment link.',
    });
  }
};
