const crypto = require('crypto');
const { escapeHtml, sendEmail } = require('./email');
const { redisCommand } = require('./payment-ledger');
const { sendSms, smsConfigured } = require('./sms');

const REQUEST_TTL_SECONDS = 24 * 60 * 60;
const RATE_WINDOW_SECONDS = 60 * 60;
const RATE_LIMIT = 5;

function isProduction() {
  return process.env.VERCEL_ENV === 'production';
}

function stripeConfigured() {
  const key = String(process.env.STRIPE_SECRET_KEY || '');
  const webhook = String(process.env.STRIPE_WEBHOOK_SECRET || '');
  if (!/^whsec_[A-Za-z0-9_\-]{12,}$/.test(webhook)) return false;
  return isProduction() ? /^sk_live_[A-Za-z0-9_\-]{12,}$/.test(key) : /^sk_(?:test|live)_[A-Za-z0-9_\-]{12,}$/.test(key);
}

function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function cardLinkCapabilities() {
  const providerReady = stripeConfigured();
  const ledgerReady = Boolean(
    (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)
    && (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
  );
  const email = providerReady && ledgerReady && emailConfigured();
  const sms = providerReady && ledgerReady && emailConfigured() && smsConfigured();
  return { available: email || sms, email, sms, hosted: true };
}

function checkoutBaseUrl() {
  const configured = String(process.env.PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  if (configured && /^https:\/\//i.test(configured)) return configured;
  return 'https://www.nxtlvl-research.com';
}

function buildStripeCheckoutForm({ order, customer, orderId }) {
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('ui_mode', 'hosted');
  params.set('payment_method_types[0]', 'card');
  params.set('billing_address_collection', 'required');
  params.set('submit_type', 'pay');
  params.set('locale', 'auto');
  params.set('customer_email', customer.email);
  params.set('client_reference_id', orderId);
  params.set('success_url', `${checkoutBaseUrl()}/?card_payment=success&order_id=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${checkoutBaseUrl()}/?card_payment=cancelled&order_id=${encodeURIComponent(orderId)}`);
  params.set('metadata[source]', 'nxt_hosted_card_link');
  params.set('metadata[order_id]', orderId);
  params.set('metadata[fulfillment]', order.mode);
  params.set('metadata[item_digest]', order.itemDigest);
  params.set('metadata[customer_name]', customer.name);
  params.set('metadata[customer_phone]', customer.phone);
  params.set('payment_intent_data[metadata][source]', 'nxt_hosted_card_link');
  params.set('payment_intent_data[metadata][order_id]', orderId);

  order.normalizedItems.forEach((item, index) => {
    params.set(`line_items[${index}][price_data][currency]`, 'usd');
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.unitCents));
    params.set(`line_items[${index}][price_data][product_data][name]`, `${item.name} — ${item.label}`.slice(0, 250));
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
  });
  if (order.shippingCents) {
    const index = order.normalizedItems.length;
    params.set(`line_items[${index}][price_data][currency]`, 'usd');
    params.set(`line_items[${index}][price_data][unit_amount]`, String(order.shippingCents));
    params.set(`line_items[${index}][price_data][product_data][name]`, 'Standard shipping');
    params.set(`line_items[${index}][quantity]`, '1');
  }
  return params;
}

async function createStripeCheckoutSession({ order, customer, orderId, requestId }) {
  if (!stripeConfigured()) throw new Error('Hosted card checkout is not configured.');
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Idempotency-Key': `nxt-card-link-${requestId}`,
    },
    body: buildStripeCheckoutForm({ order, customer, orderId }).toString(),
    signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url || !/^https:\/\/checkout\.stripe\.com\//.test(data.url)) {
    throw new Error(data.error && data.error.message || 'Unable to create the secure card-payment link.');
  }
  return { id: data.id, url: data.url, expiresAt: data.expires_at || null };
}

function requestDigest({ requestId, order, customer, channel }) {
  return crypto.createHash('sha256').update(JSON.stringify({
    requestId,
    itemDigest: order.itemDigest,
    totalCents: order.totalCents,
    email: customer.email.toLowerCase(),
    phone: customer.phone,
    channel,
  })).digest('hex');
}

function rateLimitKey(req, customer) {
  const forwarded = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').split(',')[0].trim();
  const secret = String(process.env.CRYPTO_QUOTE_SECRET || process.env.STRIPE_WEBHOOK_SECRET || 'nxt-card-link');
  const identity = `${forwarded}|${customer.email.toLowerCase()}|${customer.phone}`;
  const digest = crypto.createHmac('sha256', secret).update(identity).digest('hex');
  return `nxt:card-link:v1:rate:${digest}`;
}

async function enforceRateLimit(req, customer) {
  const script = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
`;
  const count = Number(await redisCommand(['EVAL', script, '1', rateLimitKey(req, customer), String(RATE_WINDOW_SECONDS)]));
  if (!Number.isFinite(count) || count > RATE_LIMIT) {
    const error = new Error('Too many payment-link requests. Please wait before trying again.');
    error.httpStatus = 429;
    throw error;
  }
}

async function beginRequest(requestId, digest) {
  if (!/^[a-f0-9-]{24,80}$/i.test(String(requestId || ''))) throw new Error('The payment-link request ID is invalid.');
  const key = `nxt:card-link:v1:request:${requestId}`;
  const marker = `PROCESSING:${digest}`;
  const acquired = await redisCommand(['SET', key, marker, 'NX', 'EX', '600']);
  if (acquired === 'OK') return { key, duplicate: false };
  const existing = String(await redisCommand(['GET', key]) || '');
  if (!existing.endsWith(digest)) {
    const error = new Error('This payment-link request ID was already used for different order details.');
    error.httpStatus = 409;
    throw error;
  }
  return { key, duplicate: true, sent: existing.startsWith('SENT:') };
}

async function finishRequest(key, digest) {
  await redisCommand(['SET', key, `SENT:${digest}`, 'EX', String(REQUEST_TTL_SECONDS)]);
}

async function abandonRequest(key, digest) {
  const script = `if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0`;
  await redisCommand(['EVAL', script, '1', key, `PROCESSING:${digest}`]).catch(() => {});
}

function orderRows(order) {
  return order.normalizedItems.map((item) => `<tr><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(item.name)}<br><small>${escapeHtml(item.label)}</small></td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${(item.lineCents / 100).toFixed(2)}</td></tr>`).join('');
}

async function deliverHostedLink({ channel, customer, order, orderId, session, requestId }) {
  const total = (order.totalCents / 100).toFixed(2);
  if (channel === 'email') {
    const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111;"><h2>Your secure NXT LVL payment link</h2><p>Hello ${escapeHtml(customer.name)},</p><p>Use the button below to pay order <strong>${escapeHtml(orderId)}</strong> on the card provider's secure hosted page. NXT LVL never receives or stores your card number.</p><p style="margin:28px 0;"><a href="${escapeHtml(session.url)}" style="display:inline-block;padding:15px 22px;border-radius:10px;background:#6d28d9;color:white;text-decoration:none;font-weight:bold;">Pay $${total} securely</a></p><p><strong>Order total:</strong> $${total}<br><strong>Delivery:</strong> ${order.mode === 'pickup' ? 'Local pickup' : 'Shipping'}</p><table style="width:100%;border-collapse:collapse;"><tbody>${orderRows(order)}</tbody></table><p style="margin-top:22px;color:#666;font-size:12px;">Only use a link beginning with https://checkout.stripe.com/. Payment options such as Apple Pay depend on your device and the provider's eligibility checks.</p></div>`;
    await sendEmail({
      to: customer.email,
      subject: `Secure payment link — ${orderId} — $${total}`,
      html,
      idempotencyKey: `nxt-card-link-customer-${requestId}`,
    });
    return;
  }
  if (channel === 'sms') {
    await sendSms({
      to: customer.phone,
      body: `NXT LVL: Secure card/Apple Pay link for order ${orderId} ($${total}): ${session.url} Card processing happens on Stripe's hosted page. Reply STOP to opt out.`,
    });
    return;
  }
  throw new Error('Choose email or text delivery.');
}

async function notifyMerchantLinkSent({ channel, customer, order, orderId, requestId }) {
  const total = (order.totalCents / 100).toFixed(2);
  const delivery = order.mode === 'pickup'
    ? 'LOCAL PICKUP'
    : `${escapeHtml(customer.address)}${customer.unit ? `, ${escapeHtml(customer.unit)}` : ''}<br>${escapeHtml(customer.city)}, ${escapeHtml(customer.state)} ${escapeHtml(customer.zip)}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111;"><h2>Hosted card-payment link sent</h2><p><strong>Order:</strong> ${escapeHtml(orderId)}<br><strong>Total:</strong> $${total}<br><strong>Sent by:</strong> ${escapeHtml(channel)}<br><strong>Status:</strong> Awaiting payment—do not fulfill yet.</p><h3>Customer</h3><p>${escapeHtml(customer.name)}<br>${escapeHtml(customer.email)}<br>${escapeHtml(customer.phone)}</p><h3>${order.mode === 'pickup' ? 'Pickup' : 'Shipping address'}</h3><p>${delivery}</p><table style="width:100%;border-collapse:collapse;"><tbody>${orderRows(order)}</tbody></table><p style="color:#666;font-size:12px;">Wait for the separate CARD PAYMENT CONFIRMED message generated from the signed Stripe webhook before fulfillment.</p></div>`;
  await sendEmail({
    to: process.env.ORDER_NOTIFICATION_EMAIL || 'payment@nxtlvl-research.com',
    subject: `CARD LINK SENT — ${orderId} — $${total}`,
    html,
    idempotencyKey: `nxt-card-link-merchant-${requestId}`,
  });
}

module.exports = {
  abandonRequest,
  beginRequest,
  buildStripeCheckoutForm,
  cardLinkCapabilities,
  createStripeCheckoutSession,
  deliverHostedLink,
  enforceRateLimit,
  finishRequest,
  notifyMerchantLinkSent,
  requestDigest,
  stripeConfigured,
};
