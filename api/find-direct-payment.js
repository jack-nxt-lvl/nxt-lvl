const {
  applyCors,
  cleanCustomer,
  customerDigest,
  json,
  normalizeOrder,
  verifyQuote,
} = require('../lib/direct-payment');
const { findOnChainPayment } = require('../lib/chain-verification');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });

  try {
    const quote = verifyQuote(req.body && req.body.quoteToken);
    const order = normalizeOrder(req.body && req.body.items, req.body && req.body.fulfillment);
    if (order.itemDigest !== quote.itemDigest || order.totalCents !== quote.totalCents || order.mode !== quote.fulfillment) {
      return json(res, 400, { error: 'The cart no longer matches this payment quote. Start checkout again.' });
    }
    const customer = cleanCustomer(req.body && req.body.customer, order.mode);
    if (customerDigest(customer) !== quote.customerDigest) {
      return json(res, 400, { error: 'The customer information no longer matches this payment quote. Start checkout again.' });
    }

    const result = await findOnChainPayment(quote);
    if (result.status === 'txid_required') {
      return json(res, 422, {
        status: 'txid_required',
        message: 'For ETH, use the browser-wallet button or paste the transaction ID after sending.',
      });
    }
    if (!result.found) {
      return json(res, 202, {
        status: 'not_found',
        message: `Watching ${quote.asset} for the exact payment amount…`,
      });
    }
    return json(res, 200, {
      status: 'found',
      txid: result.txid,
      paymentStatus: result.verification && result.verification.status,
      confirmations: result.verification && result.verification.confirmations || 0,
      confirmationsRequired: quote.confirmations,
    });
  } catch (error) {
    console.error('Direct payment discovery error:', error);
    const message = String(error && error.message || 'Unable to look for this payment.');
    const temporary = /blockchain|bitcoin|ethereum|rpc|http|height|fetch/i.test(message);
    return json(res, temporary ? 503 : 400, {
      error: temporary ? 'Automatic payment detection is temporarily unavailable. You can still paste the transaction ID.' : message,
    });
  }
};
