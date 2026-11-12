const crypto = require('node:crypto');
const {redisCommand} = require('./payment-ledger');
const {sendEmail} = require('./email');
const rates = require('../fulfillment-rates');

const VERSION = 'email10-v1';
const WEEK = 7 * 24 * 60 * 60 * 1000;
const prefix = () => 'nxt:email-offer:' + (process.env.VERCEL_ENV || 'development') + ':v1:';
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
class OfferError extends Error {
  constructor(message, status = 400) { super(message); this.httpStatus = status; }
}
function emailAddress(input) {
  const email = typeof input === 'string' ? input.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new OfferError('Enter a valid email address.');
  return email;
}
async function limit(key, maximum, seconds) {
  const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";
  const count = await redisCommand(['EVAL',script,1,prefix()+'rate:'+key,seconds]);
  if (Number(count) > maximum) throw new OfferError('Too many requests. Please try again later.',429);
}
function requestIp(req) {
  const h = req.headers || {};
  return hash(String(h['x-vercel-forwarded-for'] || h['x-forwarded-for'] || 'unknown').split(',')[0].trim());
}
async function signup(req, body) {
  if (body.consent !== true) throw new OfferError('Confirm that we may save your email and send your discount code.');
  const email = emailAddress(body.email);
  const field = hash(email);
  await limit('signup:'+requestIp(req),20,3600);
  await limit('delivery:'+field,4,86400);
  const now = Date.now();
  const record = {email,code:'NXT-'+crypto.randomBytes(6).toString('hex').toUpperCase(),createdAt:now,expiresAt:now+WEEK,consent:'email-me-my-code-v1'};
  const signups = prefix()+'signups';
  // Serialize first issue and renewal so concurrent sends always agree on the code.
  const issue = `
    local prior = redis.call('HGET', KEYS[1], ARGV[1])
    local fresh = cjson.decode(ARGV[2])
    if prior then
      local previous = cjson.decode(prior)
      if previous.expiresAt > tonumber(ARGV[3]) then return prior end
      fresh.createdAt = previous.createdAt
    end
    local value = cjson.encode(fresh)
    redis.call('HSET', KEYS[1], ARGV[1], value)
    return value`;
  const saved = JSON.parse(await redisCommand(['EVAL',issue,1,signups,field,JSON.stringify(record),now]));
  const until = new Date(saved.expiresAt).toUTCString();
  await sendEmail({
    to:email, subject:'Your NXT LVL 10% discount code',
    html:`<div style="font-family:Arial,sans-serif;max-width:520px;color:#17251c"><p>NXT LVL RESEARCH</p><h1>Your 10% code</h1><p style="font-size:25px;letter-spacing:2px"><strong>${saved.code}</strong></p><p>Use this code with the same email address at checkout through ${until}. It takes 10% off merchandise after pack discounts. Shipping is calculated separately.</p><p><a href="https://www.nxtlvl-research.com/catalog.html">Browse the research catalog</a></p><p>You requested this code on the NXT LVL website. <a href="https://www.nxtlvl-research.com/privacy.html">Privacy and contact information</a>.</p></div>`,
    idempotencyKey:'email10-'+hash(field+saved.code)+'-'+Math.floor(now/3600000),
  });
}
async function validate(email, input) {
  if (input === undefined || input === null || input === '') return null;
  const code = typeof input === 'string' ? input.trim().toUpperCase() : '';
  const message = 'This code is invalid or expired for that email address.';
  if (!/^NXT-[0-9A-F]{12}$/.test(code)) throw new OfferError(message);
  const record = JSON.parse(await redisCommand(['HGET',prefix()+'signups',hash(emailAddress(email))]));
  if (!record || record.expiresAt <= Date.now() || !crypto.timingSafeEqual(Buffer.from(record.code),Buffer.from(code))) throw new OfferError(message);
  return VERSION;
}
function discountedOrder(order, version) {
  if (!version) return order;
  if (version !== VERSION) throw new OfferError('Unsupported discount.');
  const discountCents = Math.round(order.subtotalCents/10);
  const discountedSubtotalCents = order.subtotalCents-discountCents;
  const shippingCents = order.mode === 'pickup' ? 0 : rates.feeCents(order.mode,discountedSubtotalCents);
  return {...order,offerVersion:VERSION,discountCents,discountedSubtotalCents,shippingCents,totalCents:discountedSubtotalCents+shippingCents};
}
async function priceForEmail(order, email, code) {
  return discountedOrder(order,await validate(email,code));
}
module.exports = {VERSION,OfferError,signup,validate,discountedOrder,priceForEmail,limit,requestIp};
