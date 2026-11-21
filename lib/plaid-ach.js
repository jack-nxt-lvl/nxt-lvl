const crypto = require('node:crypto');
const { redisCommand, ledgerConfigured } = require('./payment-ledger');
const { escapeHtml, sendEmail } = require('./email');
const { normalizeOrder, cleanCustomer } = require('./direct-payment');
const { requireApproval } = require('./research-access');
const { priceForEmail } = require('./email-offer');
const { POLICY_VERSION } = require('./crypto-checkout-access');

const TTL = 180 * 86400;
const env = () => process.env.PLAID_ENV;
const key = name => 'nxt:plaid:' + env() + ':' + name;
const amount = cents => (cents / 100).toFixed(2);
const fail = (message, httpStatus = 400) => Object.assign(new Error(message), {httpStatus});
function configured() {
  const expected = process.env.VERCEL_ENV === 'production' ? 'production' : 'sandbox';
  return env() === expected && Boolean(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET) && ledgerConfigured();
}
async function available() {
  if (!configured() || process.env.PLAID_ACH_ENABLED !== 'true' || process.env.RESEARCH_COMMERCE_ENABLED !== 'true' ||
      !process.env.PLAID_LINK_CUSTOMIZATION || !process.env.RESEND_API_KEY) return false;
  try { return await redisCommand(['PING']) === 'PONG'; } catch { return false; }
}
async function plaid(path, body) {
  if (!configured()) throw fail('Bank payments are unavailable.', 503);
  const r = await fetch('https://' + env() + '.plaid.com' + path, {
    method:'POST', headers:{'Content-Type':'application/json','Plaid-Version':'2020-09-14',
      'PLAID-CLIENT-ID':process.env.PLAID_CLIENT_ID,'PLAID-SECRET':process.env.PLAID_SECRET},
    body:JSON.stringify(body), signal:AbortSignal.timeout(8000)
  });
  if (!r.ok) throw fail('Plaid could not complete this request. Please try again later.', 502);
  return r.json();
}
async function readOrder(id) {
  if (!/^NXT-[A-Z0-9]+-[A-F0-9]{6}$/.test(String(id))) return null;
  const value = await redisCommand(['GET',key('order:'+id)]);
  return value ? JSON.parse(value) : null;
}
function validateTransfer(t, order) {
  if (!t || t.type !== 'debit' || t.network !== 'ach' || t.iso_currency_code !== 'USD' ||
      t.amount !== amount(order.totalCents) || t.metadata?.nxt_order !== order.id) throw fail('Payment requires reconciliation. Contact support with your order number.', 409);
}
async function getIntent(order) {
  const intentId = await redisCommand(['GET',key('intent:'+order.id)]);
  if (!intentId) return null;
  const {transfer_intent:intent} = await plaid('/transfer/intent/get',{transfer_intent_id:intentId});
  if (!intent || intent.id !== intentId || intent.mode !== 'PAYMENT' || intent.amount !== amount(order.totalCents) ||
      intent.metadata?.nxt_order !== order.id) throw fail('Payment requires reconciliation.',409);
  return intent;
}
async function status(order, intent) {
  if (!intent || intent.status === 'PENDING') return 'awaiting_authorization';
  if (intent.status === 'FAILED') return 'failed';
  if (intent.status !== 'SUCCEEDED' || !intent.transfer_id) return 'processing';
  const {transfer} = await plaid('/transfer/get',{transfer_id:intent.transfer_id});
  validateTransfer(transfer,order);
  return transfer.status;
}
async function checkout(body) {
  if (!await available()) throw fail('Bank payments are currently unavailable.',503);
  if (body.researchConsent?.attestation !== true || body.researchConsent.policyVersion !== POLICY_VERSION) throw fail('Accept the research-use and ordering terms.');
  if (!['web','ccd'].includes(body.accountClass)) throw fail('Select a personal or business bank account.');
  const base = normalizeOrder(body.items,body.fulfillment);
  const buyer = cleanCustomer(body.customer,base.mode);
  const order = await priceForEmail(base,buyer.email,body.promoCode);
  if (body.confirmedTotalCents !== order.totalCents) throw fail('The order total changed. Reopen your cart and review it before paying.',409);
  const approval = await requireApproval(body,order,buyer,'ach');
  const id = approval.orderId;
  const details = {id,totalCents:order.totalCents,items:order.normalizedItems,buyer,mode:order.mode,
    shippingCents:order.shippingCents,discountCents:order.discountCents || 0,accountClass:body.accountClass,
    receipt:crypto.randomBytes(32).toString('hex')};
  await redisCommand(['SET',key('order:'+id),JSON.stringify(details),'NX','EX',String(TTL)]);
  const saved = await readOrder(id);
  if (!saved || saved.accountClass !== body.accountClass) throw fail('Use the account type originally selected for this order.',409);
  let intent = await getIntent(saved);
  if (!intent) {
    const result = await plaid('/transfer/intent/create',{
      mode:'PAYMENT',network:'ach',ach_class:body.accountClass,amount:amount(order.totalCents),
      description:'NXT LVL ORDER',iso_currency_code:'USD',
      user:{legal_name:body.accountClass === 'ccd' ? approval.research.organization : buyer.name,email_address:buyer.email},
      metadata:{nxt_order:id}, ...(process.env.PLAID_FUNDING_ACCOUNT_ID ? {funding_account_id:process.env.PLAID_FUNDING_ACCOUNT_ID} : {})
    });
    if (!result.transfer_intent?.id) throw fail('Unable to prepare bank payment.',502);
    // Only the winning intent is ever handed to a buyer, including on concurrent retries.
    await redisCommand(['SET',key('intent:'+id),result.transfer_intent.id,'NX','EX',String(TTL)]);
    intent = await getIntent(saved);
  }
  const summary = {orderId:id,receipt:saved.receipt,totalCents:saved.totalCents};
  if (intent.status !== 'PENDING') return {...summary,status:await status(saved,intent)};
  const site = env() === 'production' ? 'https://www.nxtlvl-research.com' : (process.env.PLAID_SANDBOX_SITE_URL || 'http://localhost:3000');
  const link = await plaid('/link/token/create',{client_name:'NXT LVL Research',language:'en',country_codes:['US'],
    user:{client_user_id:approval.reference},products:['transfer'],transfer:{intent_id:intent.id},
    link_customization_name:process.env.PLAID_LINK_CUSTOMIZATION,
    hosted_link:{completion_redirect_uri:new URL('/?ach_return=1',site).href,url_lifetime_seconds:1800}});
  const destination = new URL(link.hosted_link_url);
  if (destination.origin !== 'https://secure.plaid.com' || !destination.pathname.startsWith('/hl/')) throw fail('Plaid did not return a secure checkout link.',502);
  return {...summary,url:destination.href};
}
async function receiptStatus(body) {
  const order = await readOrder(body.orderId);
  if (!order || typeof body.receipt !== 'string' || !/^[a-f0-9]{64}$/.test(body.receipt) ||
      !crypto.timingSafeEqual(Buffer.from(order.receipt),Buffer.from(body.receipt))) throw fail('Order status is unavailable.',404);
  return {orderId:order.id,totalCents:order.totalCents,status:await status(order,await getIntent(order))};
}
async function verifyWebhook(raw, jwt) {
  if (typeof jwt !== 'string' || jwt.length > 6000) throw fail('Invalid webhook.',401);
  const parts = jwt.split('.');
  if (parts.length !== 3) throw fail('Invalid webhook.',401);
  let header, claims;
  try { [header,claims] = parts.slice(0,2).map(v=>JSON.parse(Buffer.from(v,'base64url'))); } catch { throw fail('Invalid webhook.',401); }
  if (header?.alg !== 'ES256' || !/^[A-Za-z0-9_-]{1,128}$/.test(header.kid || '') ||
      !Number.isInteger(claims?.iat) || Math.abs(Date.now()/1000-claims.iat) > 300 ||
      claims.request_body_sha256 !== crypto.createHash('sha256').update(raw).digest('hex')) throw fail('Invalid webhook.',401);
  const {key:jwk} = await plaid('/webhook_verification_key/get',{key_id:header.kid});
  if (!jwk || jwk.kid !== header.kid || jwk.expired_at || jwk.alg !== 'ES256' || jwk.crv !== 'P-256' ||
      !crypto.verify('sha256',Buffer.from(parts[0]+'.'+parts[1]),{key:crypto.createPublicKey({key:jwk,format:'jwk'}),dsaEncoding:'ieee-p1363'},Buffer.from(parts[2],'base64url'))) throw fail('Invalid webhook.',401);
}
async function handleEvent(event) {
  if (!event.transfer_id || event.refund_id || !['pending','posted','settled','funds_available','returned','failed','cancelled'].includes(event.event_type)) return;
  const {transfer} = await plaid('/transfer/get',{transfer_id:event.transfer_id});
  const id = transfer?.metadata?.nxt_order;
  if (!id) return;
  const order = await readOrder(id);
  if (!order) throw fail('Order record missing. Reconcile in Plaid.',503);
  validateTransfer(transfer,order);
  const intent = await getIntent(order);
  if (!intent || intent.transfer_id !== transfer.id) throw fail('Transfer and order are not yet matched.',503);
  // Use current provider state even for delayed or replayed notifications.
  const label = transfer.status;
  await redisCommand(['HSET',key('status:'+id),'transferId',transfer.id,'status',label]);
  await redisCommand(['EXPIRE',key('status:'+id),String(TTL)]);
  if (!['funds_available','returned','failed','cancelled'].includes(label)) return;
  const noticeKey = key('notice:'+transfer.id+':'+label);
  if (await redisCommand(['GET',noticeKey])) return;
  const subject = 'ACH ' + label.replace(/_/g,' ') + ' — ' + id;
  const detail = label === 'funds_available' ? 'Plaid reports the funds are available.' : 'Hold fulfillment and review this bank payment.';
  const items = order.items.map(i=>'<li>'+escapeHtml(i.quantity)+' × '+escapeHtml(i.name)+' ('+escapeHtml(i.label)+')</li>').join('');
  const summary = '<p>'+escapeHtml(detail)+'</p><p>'+escapeHtml(id)+' · $'+amount(order.totalCents)+'</p>';
  const buyer = order.buyer;
  const delivery = [buyer.name,buyer.email,buyer.phone,buyer.address,buyer.unit,buyer.city,buyer.state,buyer.zip,order.mode].filter(Boolean).map(escapeHtml).join('<br>');
  if (!await redisCommand(['GET',noticeKey+':merchant'])) {
    await sendEmail({to:process.env.ORDER_NOTIFICATION_EMAIL || 'payment@nxtlvl-research.com',subject,
      html:summary+'<ul>'+items+'</ul><p>'+delivery+'</p>',idempotencyKey:noticeKey+':merchant'});
    await redisCommand(['SET',noticeKey+':merchant','1','EX',String(TTL)]);
  }
  await sendEmail({to:buyer.email,subject,html:'<p>Bank payment status: '+escapeHtml(label.replace(/_/g,' '))+'.</p><p>'+escapeHtml(id)+' · $'+amount(order.totalCents)+'</p>',
    idempotencyKey:noticeKey+':buyer'});
  await redisCommand(['SET',noticeKey,'1','EX',String(TTL)]);
}
async function syncEvents() {
  const cursorKey = key('event-cursor');
  const cursor = Number(await redisCommand(['GET',cursorKey]) || 0);
  const page = await plaid('/transfer/event/sync',{after_id:cursor,count:12});
  if (!Array.isArray(page.transfer_events)) throw fail('Invalid event response.',502);
  let previous = cursor;
  for (const event of page.transfer_events) {
    if (!Number.isSafeInteger(event.event_id) || event.event_id <= previous) throw fail('Invalid event sequence.',502);
    await handleEvent(event);
    const updated = await redisCommand(['EVAL',"if tonumber(redis.call('GET',KEYS[1]) or '0') == tonumber(ARGV[1]) then redis.call('SET',KEYS[1],ARGV[2]); return 1 end return 0",'1',cursorKey,String(previous),String(event.event_id)]);
    if (!Number(updated)) throw fail('Concurrent event delivery. Retry.',503);
    previous = event.event_id;
  }
  if (page.has_more || page.transfer_events.length === 12) throw fail('More events remain. Retry.',503);
}
module.exports = {available, configured, checkout, receiptStatus, verifyWebhook, syncEvents, handleEvent, validateTransfer, fail};
