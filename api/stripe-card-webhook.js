const crypto = require('crypto');
const { escapeHtml, sendEmail } = require('../lib/email');
const { redisCommand } = require('../lib/payment-ledger');

async function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function verifyStripeSignature(payload, signatureHeader, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  const pairs = String(signatureHeader || '').split(',').map((part) => part.trim().split('='));
  const timestamp = Number((pairs.find(([key]) => key === 't') || [])[1]);
  const signatures = pairs.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!Number.isFinite(timestamp) || Math.abs(nowSeconds - timestamp) > 300 || !signatures.length) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload.toString('utf8')}`).digest();
  return signatures.some((value) => {
    if (!/^[a-f0-9]{64}$/i.test(value)) return false;
    const supplied = Buffer.from(value, 'hex');
    return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
  });
}

async function acquireEvent(eventId) {
  const key = `nxt:card-link:v1:stripe-event:${eventId}`;
  const acquired = await redisCommand(['SET', key, 'PROCESSING', 'NX', 'EX', '300']);
  if (acquired === 'OK') return { key, acquired: true };
  return { key, acquired: false, done: String(await redisCommand(['GET', key]) || '') === 'DONE' };
}

async function releaseEvent(key) {
  await redisCommand(['DEL', key]).catch(() => {});
}

async function completeEvent(key) {
  await redisCommand(['SET', key, 'DONE', 'EX', String(30 * 24 * 60 * 60)]);
}

async function sendPaidNotifications(session, eventId) {
  const orderId = String(session.client_reference_id || session.metadata && session.metadata.order_id || 'Unknown');
  const customer = session.customer_details || {};
  const email = String(customer.email || session.customer_email || '');
  const name = String(customer.name || session.metadata && session.metadata.customer_name || 'Customer');
  const phone = String(customer.phone || session.metadata && session.metadata.customer_phone || 'Not supplied');
  const total = (Number(session.amount_total || 0) / 100).toFixed(2);
  const paymentId = String(session.payment_intent || session.id || '');
  const merchantHtml = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111;"><h2>CARD PAYMENT CONFIRMED</h2><p><strong>Order:</strong> ${escapeHtml(orderId)}<br><strong>Total:</strong> $${total}<br><strong>Stripe payment:</strong> ${escapeHtml(paymentId)}<br><strong>Customer:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}<br><strong>Phone:</strong> ${escapeHtml(phone)}</p><p style="color:#166534;font-weight:bold;">Stripe reported this hosted checkout as paid. Verify it in your Stripe Dashboard before fulfillment if anything looks unusual.</p></div>`;
  await sendEmail({
    to: process.env.ORDER_NOTIFICATION_EMAIL || 'payment@nxtlvl-research.com',
    subject: `CARD PAYMENT CONFIRMED — ${orderId} — $${total}`,
    html: merchantHtml,
    idempotencyKey: `nxt-card-paid-merchant-${eventId}`,
  });
  if (email) {
    await sendEmail({
      to: email,
      subject: `Payment received — ${orderId}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111;"><h2>Payment received</h2><p>Hello ${escapeHtml(name)},</p><p>Your hosted card payment of <strong>$${total}</strong> for order <strong>${escapeHtml(orderId)}</strong> was confirmed.</p><p>We will contact you separately regarding ${String(session.metadata && session.metadata.fulfillment) === 'pickup' ? 'local pickup' : 'shipping'}.</p></div>`,
      idempotencyKey: `nxt-card-paid-customer-${eventId}`,
    });
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  const secret = String(process.env.STRIPE_WEBHOOK_SECRET || '');
  if (!secret) return res.status(503).end('Webhook is not configured');
  const payload = await rawBody(req);
  if (!verifyStripeSignature(payload, req.headers['stripe-signature'], secret)) return res.status(400).end('Invalid signature');

  let event;
  try { event = JSON.parse(payload.toString('utf8')); }
  catch (_) { return res.status(400).end('Invalid payload'); }
  if (!event.id || !event.type) return res.status(400).end('Invalid event');
  if (event.type !== 'checkout.session.completed') return res.status(200).end('Ignored');

  const session = event.data && event.data.object || {};
  if (session.payment_status !== 'paid' || !session.metadata || session.metadata.source !== 'nxt_hosted_card_link') {
    return res.status(200).end('Ignored');
  }
  const lease = await acquireEvent(event.id);
  if (!lease.acquired) return res.status(200).end(lease.done ? 'Already processed' : 'Processing');
  try {
    await sendPaidNotifications(session, event.id);
    await completeEvent(lease.key);
    return res.status(200).end('Received');
  } catch (error) {
    await releaseEvent(lease.key);
    console.error('Stripe card webhook error:', error);
    return res.status(500).end('Notification failed');
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
module.exports.verifyStripeSignature = verifyStripeSignature;
