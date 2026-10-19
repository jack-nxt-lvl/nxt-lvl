const fulfillmentRates = require('../fulfillment-rates');
const crypto = require('crypto');
const { escapeHtml, sendEmail } = require('../lib/email');
const { redisCommand } = require('../lib/payment-ledger');
const { stripeMode } = require('../lib/hosted-card-link');

const RECORD_TTL_SECONDS = 90 * 24 * 60 * 60;
const MAX_BODY_BYTES = 1024 * 1024;

async function rawBody(req) {
  if (Buffer.isBuffer(req.body) || typeof req.body === 'string') {
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    if (body.length > MAX_BODY_BYTES) throw new Error('Payload too large');
    return body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error('Payload too large');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function verifyStripeSignature(payload, signatureHeader, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  const pairs = String(signatureHeader || '').split(',').map((part) => part.trim().split('='));
  const timestamp = Number((pairs.find(([key]) => key === 't') || [])[1]);
  const signatures = pairs.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > 300 || !signatures.length) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload.toString('utf8')}`).digest();
  return signatures.some((value) => {
    if (!/^[a-f0-9]{64}$/i.test(value)) return false;
    const supplied = Buffer.from(value, 'hex');
    return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
  });
}

async function acquireEvent(sessionId, outcome) {
  // Stripe can deliver different event IDs for the same Checkout Session.
  const key = `nxt:card-link:v2:stripe-session:${sessionId}:${outcome}`;
  const owner = crypto.randomUUID();
  const acquired = await redisCommand(['SET', key, owner, 'NX', 'EX', '300']);
  if (acquired === 'OK') return { key, owner, acquired: true };
  return { key, acquired: false, done: String(await redisCommand(['GET', key]) || '') === 'DONE' };
}

async function releaseEvent(lease) {
  const script = "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0";
  await redisCommand(['EVAL', script, '1', lease.key, lease.owner]).catch(() => {});
}

async function completeEvent(lease) {
  const script = "if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], 'DONE', 'EX', ARGV[2]); return 1 end return 0";
  const completed = await redisCommand(['EVAL', script, '1', lease.key, lease.owner, String(RECORD_TTL_SECONDS)]);
  if (Number(completed) !== 1) throw new Error('Notification lease expired');
}

async function sendNotificationOnce({ idempotencyKey, ...message }) {
  const key = `nxt:card-link:v2:notification:${idempotencyKey}`;
  if (await redisCommand(['GET', key]) === 'DONE') return;
  await sendEmail({ ...message, idempotencyKey });
  // Persist each recipient separately so a failed customer email does not
  // resend the merchant's receipt after the email provider's retry window.
  await redisCommand(['SET', key, 'DONE', 'EX', String(RECORD_TTL_SECONDS)]);
}

async function sendPaidNotifications(session) {
  const orderId = String(session.client_reference_id || session.metadata && session.metadata.order_id || 'Unknown');
  const customer = session.customer_details || {};
  const email = String(customer.email || session.customer_email || '');
  const name = String(customer.name || session.metadata && session.metadata.customer_name || 'Customer');
  const phone = String(customer.phone || session.metadata && session.metadata.customer_phone || 'Not supplied');
  const total = (Number(session.amount_total || 0) / 100).toFixed(2);
  const paymentId = String(session.payment_intent || session.id || '');
  const merchantHtml = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111;"><h2>CARD PAYMENT CONFIRMED</h2><p><strong>Order:</strong> ${escapeHtml(orderId)}<br><strong>Total:</strong> $${total}<br><strong>Stripe payment:</strong> ${escapeHtml(paymentId)}<br><strong>Customer:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}<br><strong>Phone:</strong> ${escapeHtml(phone)}</p><p style="color:#166534;font-weight:bold;">Payment receipt is not fulfillment approval. Independently check the research approval record, buyer, batch documents, final terms and delivery address before dispatch. Legacy payments without research approval require manual resolution.</p></div>`;
  await sendNotificationOnce({
    to: process.env.ORDER_NOTIFICATION_EMAIL || 'payment@nxtlvl-research.com',
    subject: `CARD PAYMENT CONFIRMED — ${orderId} — $${total}`,
    html: merchantHtml,
    idempotencyKey: `nxt-card-paid-merchant-${session.id}`,
  });
  if (email) {
    await sendNotificationOnce({
      to: email,
      subject: `Payment received — ${orderId}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111;"><h2>Payment received</h2><p>Hello ${escapeHtml(name)},</p><p>Your hosted card payment of <strong>$${total}</strong> for order <strong>${escapeHtml(orderId)}</strong> was confirmed.</p><p>We will contact you separately regarding ${escapeHtml((fulfillmentRates.OPTIONS[String(session.metadata && session.metadata.fulfillment)] || {}).label || 'fulfillment')}.</p></div>`,
      idempotencyKey: `nxt-card-paid-customer-${session.id}`,
    });
  }
}

async function sendFailedNotifications(session) {
  const orderId = String(session.client_reference_id || session.metadata.order_id || 'Unknown');
  const email = String(session.customer_details && session.customer_details.email || session.customer_email || '');
  await sendNotificationOnce({
    to: process.env.ORDER_NOTIFICATION_EMAIL || 'payment@nxtlvl-research.com',
    subject: `PAYMENT FAILED — ${orderId}`,
    html: `<h2>Payment not received</h2><p>The delayed payment for order <strong>${escapeHtml(orderId)}</strong> failed. Do not dispatch this order. Check the payment and research review records before arranging another payment.</p>`,
    idempotencyKey: `nxt-card-failed-merchant-${session.id}`,
  });
  if (email) await sendNotificationOnce({
    to: email,
    subject: `Payment could not be completed — ${orderId}`,
    html: `<h2>Payment could not be completed</h2><p>The payment for order <strong>${escapeHtml(orderId)}</strong> was not confirmed. Please contact NXT LVL Research at 754-290-7210 before trying another payment.</p>`,
    idempotencyKey: `nxt-card-failed-customer-${session.id}`,
  });
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  const secret = String(process.env.STRIPE_WEBHOOK_SECRET || '');
  const mode = stripeMode();
  if (!secret || !mode) return res.status(503).end('Webhook is not configured');
  let payload;
  try { payload = await rawBody(req); }
  catch (_) { return res.status(400).end('Invalid payload'); }
  if (!verifyStripeSignature(payload, req.headers['stripe-signature'], secret)) return res.status(400).end('Invalid signature');

  let event;
  try { event = JSON.parse(payload.toString('utf8')); }
  catch (_) { return res.status(400).end('Invalid payload'); }
  if (!event || typeof event !== 'object' || !/^evt_[A-Za-z0-9_]+$/.test(event.id || '') || typeof event.type !== 'string') return res.status(400).end('Invalid event');
  if (event.livemode !== (mode === 'live')) return res.status(400).end('Payment mode mismatch');
  const supported = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed'];
  if (!supported.includes(event.type)) return res.status(200).end('Ignored');

  const session = event.data && event.data.object || {};
  if (!session.metadata || session.metadata.source !== 'nxt_hosted_card_link') {
    return res.status(200).end('Ignored');
  }
  if (!/^cs_[A-Za-z0-9_]+$/.test(session.id || '') || session.mode !== 'payment' || session.livemode !== event.livemode || session.currency !== 'usd' || !Number.isSafeInteger(session.amount_total) || session.amount_total <= 0) {
    return res.status(400).end('Invalid checkout session');
  }
  const failed = event.type === 'checkout.session.async_payment_failed';
  if (failed ? session.payment_status !== 'unpaid' : session.payment_status !== 'paid') return res.status(200).end('Ignored');
  let lease;
  try {
    if (failed) {
      const paid = await redisCommand(['GET', `nxt:card-link:v2:stripe-session:${session.id}:paid`]);
      if (paid === 'DONE') return res.status(200).end('Already paid');
      if (paid) return res.status(503).end('Payment notification in progress');
    }
    lease = await acquireEvent(session.id, failed ? 'failed' : 'paid');
    if (!lease.acquired) return res.status(lease.done ? 200 : 503).end(lease.done ? 'Already processed' : 'Retry notification later');
    if (failed) await sendFailedNotifications(session);
    else await sendPaidNotifications(session);
    await completeEvent(lease);
    return res.status(200).end('Received');
  } catch (error) {
    if (lease && lease.acquired) await releaseEvent(lease);
    console.error('Stripe payment notification failed:', error.name);
    return res.status(500).end('Notification failed');
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
module.exports.verifyStripeSignature = verifyStripeSignature;
