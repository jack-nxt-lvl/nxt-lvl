const QRCode = require('qrcode');
const {
  ASSETS,
  QUOTE_TTL_MS,
  amountForQuote,
  applyCors,
  cleanCustomer,
  customerDigest,
  fetchUsdPrice,
  json,
  normalizeOrder,
  paymentUri,
  randomOrderId,
  signQuote,
} = require('../lib/direct-payment');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });

  try {
    const asset = String(req.body && req.body.asset || '').toUpperCase();
    const config = ASSETS[asset];
    if (!config) return json(res, 400, { error: 'Choose BTC, ETH, or USDT.' });

    const order = normalizeOrder(req.body && req.body.items, req.body && req.body.fulfillment);
    const customer = cleanCustomer(req.body && req.body.customer, order.mode);
    const usdPrice = await fetchUsdPrice(asset);
    const amount = amountForQuote(asset, order.totalCents, usdPrice);
    const createdAt = Date.now();
    const expiresAt = createdAt + QUOTE_TTL_MS;
    const orderId = randomOrderId();
    const payload = {
      v: 1,
      orderId,
      asset,
      address: config.address,
      amountUnits: amount.amountUnits,
      amountDisplay: amount.amountDisplay,
      confirmations: config.confirmations,
      totalCents: order.totalCents,
      itemDigest: order.itemDigest,
      customerDigest: customerDigest(customer),
      fulfillment: order.mode,
      createdAt,
      expiresAt,
    };
    const uri = paymentUri(asset, amount.amountUnits, amount.amountDisplay, orderId);
    const qrDataUrl = await QRCode.toDataURL(uri, {
      errorCorrectionLevel: 'M', width: 300, margin: 2,
      color: { dark: '#09090f', light: '#ffffff' },
    });

    return json(res, 200, {
      quoteToken: signQuote(payload),
      orderId,
      asset,
      assetName: config.name,
      network: config.network,
      address: config.address,
      amount: amount.amountDisplay,
      amountUnits: amount.amountUnits,
      totalUsd: (order.totalCents / 100).toFixed(2),
      spotPriceUsd: Number(usdPrice.toFixed(2)),
      confirmationsRequired: config.confirmations,
      expiresAt,
      paymentUri: uri,
      qrDataUrl,
      note: 'Send the exact amount on the exact network. The small fractional amount identifies this order.',
    });
  } catch (error) {
    console.error('Direct payment quote error:', error);
    const setupRequired = /CRYPTO_QUOTE_SECRET/.test(String(error && error.message));
    return json(res, setupRequired ? 503 : 400, {
      error: setupRequired ? 'Direct checkout is missing its internal quote-signing secret.' : (error.message || 'Unable to create a payment quote.'),
      setupRequired,
      missing: setupRequired ? ['CRYPTO_QUOTE_SECRET'] : undefined,
    });
  }
};
