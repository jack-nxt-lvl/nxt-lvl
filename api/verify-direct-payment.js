const {
  ASSETS,
  applyCors,
  cleanCustomer,
  cleanTxid,
  customerDigest,
  explorerUrl,
  formatAtomic,
  json,
  normalizeOrder,
  requiredConfirmations,
  verifyQuote,
} = require('../lib/direct-payment');
const { verifyOnChain } = require('../lib/chain-verification');
const { escapeHtml, sendEmail } = require('../lib/email');
const {
  PaymentLedgerError,
  acquirePaymentLock,
  claimPayment,
  flagPaymentForReview,
  releasePaymentLock,
} = require('../lib/payment-ledger');

function formatMoney(cents) { return `$${(Number(cents) / 100).toFixed(2)}`; }

function statusMessage(result) {
  switch (result.status) {
    case 'not_found': return 'Transaction not found yet. Confirm the transaction ID and try again in a moment.';
    case 'confirming': return result.replaceable && !result.confirmations
      ? `Payment found in the Bitcoin mempool, but it can still be replaced. Waiting for confirmations (0/${result.requiredConfirmations}).`
      : `Payment found. Waiting for secure confirmations (${result.confirmations}/${result.requiredConfirmations}).`;
    case 'provider_disagreement': return 'Blockchain providers have not reached the same confirmed view yet. Verification will retry automatically.';
    case 'reorged': return 'The transaction moved during a blockchain reorganization. Waiting for it to settle on the canonical chain.';
    case 'underpaid': return 'Payment was received, but it is more than 10% below the invoice amount. The order has been sent for manual review.';
    case 'wrong_address': return 'This transaction was not sent to the checkout wallet.';
    case 'transaction_before_quote': return 'This transaction predates the current checkout quote and cannot be used for this order.';
    case 'failed': return 'The blockchain transaction failed.';
    default: return 'Payment has not been confirmed yet.';
  }
}

function formatCryptoUnits(asset, units) {
  const value = formatAtomic(units, ASSETS[asset].decimals);
  return value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
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

async function sendManualReviewEmail({ quote, txid, customer, order, result, transactionUrl }) {
  const requested = `${quote.amountDisplay} ${quote.asset}`;
  const received = `${formatCryptoUnits(quote.asset, result.receivedUnits)} ${quote.asset}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111;">
    <h2>Payment requires manual review</h2>
    <p>This confirmed transaction is more than 10% below the signed invoice amount. Do not fulfill it automatically.</p>
    <p><strong>Order:</strong> ${escapeHtml(quote.orderId)}<br>
    <strong>Invoice:</strong> ${escapeHtml(requested)}<br>
    <strong>Received:</strong> ${escapeHtml(received)}<br>
    <strong>Order total:</strong> ${formatMoney(order.totalCents)}<br>
    <strong>Transaction:</strong> <a href="${escapeHtml(transactionUrl)}">${escapeHtml(txid)}</a></p>
    <h3>Customer</h3><p>${escapeHtml(customer.name)}<br>${escapeHtml(customer.email)}<br>${escapeHtml(customer.phone)}</p>
    <p style="margin-top:18px;color:#a11;font-size:12px;"><strong>RED FLAG:</strong> Manual decision required. The transaction has been durably bound to this order and cannot be used for another order.</p>
  </div>`;
  return sendEmail({
    to: 'payment@nxtlvl-research.com',
    subject: `PAYMENT REVIEW — ${quote.orderId} — ${quote.asset} — MORE THAN 10% SHORT`,
    html,
    idempotencyKey: `nxt-review-${quote.asset}-${txid}`,
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });

  let paymentLease = null;
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

    paymentLease = await acquirePaymentLock(quote.asset, txid, quote.orderId);
    const result = await verifyOnChain(txid, quote);
    if (!result.ok) {
      if (result.status === 'underpaid' && result.reviewRequired) {
        const review = await flagPaymentForReview(quote.asset, txid, quote.orderId);
        if (review.status === 'TX_USED') {
          return json(res, 409, { error: 'This transaction has already been used for another order.' });
        }
        if (review.status === 'ORDER_ALREADY_PAID') {
          return json(res, 409, { error: 'This order already has a confirmed payment.' });
        }
        const transactionUrl = explorerUrl(quote.asset, txid);
        let reviewNotificationSent = true;
        try {
          await sendManualReviewEmail({ quote, txid, customer, order, result, transactionUrl });
        } catch (emailError) {
          reviewNotificationSent = false;
          console.error('Payment review was recorded, but the review email failed:', emailError);
        }
        return json(res, 202, {
          status: 'manual_review',
          message: statusMessage(result),
          confirmations: result.confirmations || 0,
          confirmationsRequired: result.requiredConfirmations || requiredConfirmations(quote.asset),
          durableManualReview: true,
          reviewNotificationSent,
        });
      }
      const pending = ['confirming', 'not_found', 'provider_disagreement', 'reorged'].includes(result.status);
      const code = pending ? 202 : 400;
      return json(res, code, {
        status: result.status,
        message: statusMessage(result),
        confirmations: result.confirmations || 0,
        confirmationsRequired: result.requiredConfirmations || requiredConfirmations(quote.asset),
      });
    }

    const ledger = await claimPayment(quote.asset, txid, quote.orderId);
    if (ledger.status === 'TX_USED') {
      return json(res, 409, { error: 'This transaction has already been used for another order.' });
    }
    if (ledger.status === 'ORDER_ALREADY_PAID') {
      return json(res, 409, { error: 'This order already has a different confirmed payment. Contact support before sending anything else.' });
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
      confirmationsRequired: requiredConfirmations(quote.asset),
      transactionUrl,
      durableDuplicateProtection: true,
      idempotent: ledger.status === 'IDEMPOTENT',
      confirmationEmailSent,
      amountPolicy: result.amountPolicy || 'exact',
    });
  } catch (error) {
    console.error('Direct payment verification error:', error);
    const blockchainTemporary = /blockchain|bitcoin|ethereum|rpc|provider|fetch|network|timeout|height/i.test(String(error && error.message));
    const status = error instanceof PaymentLedgerError ? error.httpStatus : (blockchainTemporary ? 503 : 400);
    if (error instanceof PaymentLedgerError && error.code === 'verification_busy') {
      return json(res, status, { status: error.code, message: error.message });
    }
    return json(res, status, { error: error.message || 'Unable to verify this payment.' });
  } finally {
    if (paymentLease) {
      try { await releasePaymentLock(paymentLease); }
      catch (releaseError) { console.error('Payment verification lock release failed:', releaseError); }
    }
  }
};
