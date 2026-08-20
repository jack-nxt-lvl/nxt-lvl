const {
  ASSETS,
  applyCors,
  cleanCustomer,
  cleanTxid,
  customerDigest,
  explorerUrl,
  json,
  normalizeOrder,
  verifyQuote,
} = require('../lib/direct-payment');
const { verifyOnChain } = require('../lib/chain-verification');
const { escapeHtml, sendEmail } = require('../lib/email');

function formatMoney(cents) { return `$${(Number(cents) / 100).toFixed(2)}`; }

async function claimTransaction(txid, orderId) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { claimed: true, durable: false };

  const key = `nxt:payment-tx:${txid}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, orderId, 'NX', 'EX', '31536000']),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('The payment ledger is temporarily unavailable.');
  if (data.result === 'OK') return { claimed: true, durable: true };

  const existingResponse = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['GET', key]),
  });
  const existing = await existingResponse.json().catch(() => ({}));
  return { claimed: existing.result === orderId, durable: true, duplicateOrderId: existing.result || null };
}

function statusMessage(result) {
  switch (result.status) {
    case 'not_found': return 'Transaction not found yet. Confirm the transaction ID and try again in a moment.';
    case 'confirming': return `Payment found. Waiting for confirmations (${result.confirmations}/${result.requiredConfirmations}).`;
    case 'underpaid': return 'The transaction amount is lower than the exact checkout amount. Contact support before sending anything else.';
    case 'overpaid': return 'The transaction amount is higher than the exact checkout amount. It requires manual review.';
    case 'wrong_address': return 'This transaction was not sent to the checkout wallet.';
    case 'transaction_before_quote': return 'This transaction predates the current checkout quote and cannot be used for this order.';
    case 'failed': return 'The blockchain transaction failed.';
    default: return 'Payment has not been confirmed yet.';
  }
}

function itemRows(items) {
  return items.map((item) => `<tr><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(item.name)}<br><small>${escapeHtml(item.label)}</small></td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">${formatMoney(item.lineCents)}</td></tr>`).join('');
}

function addressHtml(customer, mode) {
  if (mode === 'pickup') return 'LOCAL PICKUP';
  return `${escapeHtml(customer.address)}${customer.unit ? `, ${escapeHtml(customer.unit)}` : ''}<br>${escapeHtml(customer.city)}, ${escapeHtml(customer.state)} ${escapeHtml(customer.zip)}`;
}

async function sendConfirmationEmails({ quote, txid, customer, order, transactionUrl }) {
  const asset = ASSETS[quote.asset];
  const amount = quote.amountDisplay;
  const table = `<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #111;">Product</th><th style="padding:8px;border-bottom:2px solid #111;">Qty</th><th style="text-align:right;padding:8px;border-bottom:2px solid #111;">Total</th></tr></thead><tbody>${itemRows(order.normalizedItems)}</tbody></table>`;
  const details = `<p><strong>Order:</strong> ${escapeHtml(quote.orderId)}<br><strong>Payment:</strong> ${escapeHtml(amount)} ${escapeHtml(quote.asset)}<br><strong>Network:</strong> ${escapeHtml(asset.network)}<br><strong>Transaction:</strong> <a href="${escapeHtml(transactionUrl)}">${escapeHtml(txid)}</a><br><strong>Order total:</strong> ${formatMoney(order.totalCents)}</p>`;
  const delivery = `<h3>${order.mode === 'pickup' ? 'Pickup' : 'Shipping address'}</h3><p>${addressHtml(customer, order.mode)}</p>`;
  const wrapper = (title, body) => `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111;"><h2>${title}</h2>${body}<p style="margin-top:18px;color:#666;font-size:12px;">Payment was independently verified on the blockchain. Never share wallet recovery words or private keys.</p></div>`;

  await Promise.all([
    sendEmail({
      to: 'payment@nxtlvl-research.com',
      subject: `PAYMENT CONFIRMED — ${quote.orderId} — ${quote.asset} — ${formatMoney(order.totalCents)}`,
      html: wrapper('Payment confirmed', `${details}<h3>Customer</h3><p>${escapeHtml(customer.name)}<br>${escapeHtml(customer.email)}<br>${escapeHtml(customer.phone)}</p>${delivery}<h3>Products</h3>${table}`),
      idempotencyKey: `nxt-merchant-${txid}`,
    }),
    sendEmail({
      to: customer.email,
      subject: `Payment confirmed — ${quote.orderId}`,
      html: wrapper('Your payment is confirmed', `<p>Thank you, ${escapeHtml(customer.name)}. Your blockchain payment has been confirmed.</p>${details}${delivery}<h3>Order summary</h3>${table}`),
      idempotencyKey: `nxt-customer-${txid}`,
    }),
  ]);
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });

  try {
    const quote = verifyQuote(req.body && req.body.quoteToken);
    const txid = cleanTxid(req.body && req.body.txid, quote.asset);
    const order = normalizeOrder(req.body && req.body.items, req.body && req.body.fulfillment);
    if (order.itemDigest !== quote.itemDigest || order.totalCents !== quote.totalCents || order.mode !== quote.fulfillment) {
      return json(res, 400, { error: 'The cart no longer matches this payment quote. Start checkout again.' });
    }
    const customer = cleanCustomer(req.body && req.body.customer, order.mode);
    if (customerDigest(customer) !== quote.customerDigest) {
      return json(res, 400, { error: 'The customer information no longer matches this payment quote. Start checkout again.' });
    }
    const result = await verifyOnChain(txid, quote);
    if (!result.ok) {
      const code = result.status === 'confirming' || result.status === 'not_found' ? 202 : 400;
      return json(res, code, {
        status: result.status,
        message: statusMessage(result),
        confirmations: result.confirmations || 0,
        confirmationsRequired: result.requiredConfirmations || quote.confirmations,
      });
    }

    const ledger = await claimTransaction(txid, quote.orderId);
    if (!ledger.claimed) {
      return json(res, 409, { error: 'This transaction has already been used for another order.' });
    }

    const transactionUrl = explorerUrl(quote.asset, txid);
    let confirmationEmailSent = true;
    try {
      await sendConfirmationEmails({ quote, txid, customer, order, transactionUrl });
    } catch (emailError) {
      confirmationEmailSent = false;
      console.error('Payment verified, but confirmation email failed:', emailError);
    }
    return json(res, 200, {
      status: 'paid',
      orderId: quote.orderId,
      asset: quote.asset,
      amount: quote.amountDisplay,
      confirmations: result.confirmations,
      confirmationsRequired: quote.confirmations,
      transactionUrl,
      durableDuplicateProtection: ledger.durable,
      confirmationEmailSent,
    });
  } catch (error) {
    console.error('Direct payment verification error:', error);
    return json(res, 400, { error: error.message || 'Unable to verify this payment.' });
  }
};
