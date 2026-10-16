const crypto = require('node:crypto');
const { redisCommand } = require('./payment-ledger');
const { customerDigest } = require('./direct-payment');

const POLICY_VERSION = '2026-10-16';
const RECORD_TTL = 90 * 24 * 60 * 60;
const PREFIX = 'nxt:research:v1:';
class ResearchAccessError extends Error {
  constructor(message, status = 403) { super(message); this.httpStatus = status; }
}
function hash(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
function key(reference) {
  if (!/^RR-[a-f0-9]{32}$/.test(String(reference))) throw new ResearchAccessError('Invalid review reference.', 400);
  return PREFIX + reference;
}
function enabled() { return process.env.RESEARCH_COMMERCE_ENABLED === 'true'; }
function normalizeApplication(body) {
  const source = body.research || {};
  const take = (name, min, max) => {
    const text = String(source[name] || '').trim();
    if (text.length < min || text.length > max || /[\u0000-\u001f]/.test(text)) {
      throw new ResearchAccessError('Complete the research organization, role, website, and intended-use fields.', 400);
    }
    return text;
  };
  const organization = take('organization', 3, 160);
  const role = take('role', 2, 120);
  const website = take('website', 6, 240);
  let url;
  try { url = new URL(website); } catch (_) { throw new ResearchAccessError('Enter the public organization website, starting with https://.', 400); }
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.')) {
    throw new ResearchAccessError('Enter the public organization website, starting with https://.', 400);
  }
  const purpose = take('purpose', 30, 1200);
  if (source.attestation !== true || source.policyVersion !== POLICY_VERSION) {
    throw new ResearchAccessError('Read and acknowledge the research eligibility and privacy notices.', 400);
  }
  // These are applicant statements, never evidence of eligibility or automatic approval.
  return { organization, role, website: url.href, purpose, attestation: true, policyVersion: POLICY_VERSION };
}
async function rateLimit(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown').split(',')[0].trim();
  const bucket = Math.floor(Date.now() / 3600000);
  const count = await redisCommand(['INCR', PREFIX + 'rate:' + hash(ip) + ':' + bucket]);
  await redisCommand(['EXPIRE', PREFIX + 'rate:' + hash(ip) + ':' + bucket, '7200']);
  if (Number(count) > 5) throw new ResearchAccessError('Too many requests. Please try again later or call our support number.', 429);
}
async function createApplication({ req, body, order, customer }) {
  const research = normalizeApplication(body);
  await rateLimit(req);
  const reference = 'RR-' + crypto.randomBytes(16).toString('hex');
  const record = {
    reference, status: 'pending', policyVersion: POLICY_VERSION, createdAt: Date.now(),
    customer, research, items: body.items, fulfillment: order.mode,
    customerDigest: customerDigest(customer), itemDigest: order.itemDigest, totalCents: order.totalCents,
  };
  await redisCommand(['SET', key(reference), JSON.stringify(record), 'EX', String(RECORD_TTL)]);
  return record;
}
async function readApplication(reference) {
  const value = await redisCommand(['GET', key(reference)]);
  return value ? JSON.parse(value) : null;
}
function assertApproved(record, order, customer) {
  if (!record || record.status !== 'approved' || record.policyVersion !== POLICY_VERSION || !Number.isFinite(record.expiresAt) || record.expiresAt <= Date.now()) {
    throw new ResearchAccessError('An active, independently reviewed research approval is required. Request a review before payment.');
  }
  if (record.customerDigest !== customerDigest(customer) || record.itemDigest !== order.itemDigest || record.totalCents !== order.totalCents || record.fulfillment !== order.mode) {
    throw new ResearchAccessError('These buyer, material, quantity, or fulfillment details differ from the reviewed request. Please request a new review.');
  }
  return record;
}
async function requireApproval(body, order, customer, channel) {
  if (!enabled()) throw new ResearchAccessError('Payment is not open while business and payment-provider review is being completed. You can submit a research inquiry without paying.');
  if (channel === 'card' && process.env.STRIPE_RESEARCH_APPROVED !== 'true') {
    throw new ResearchAccessError('Card payments are not available. Provider review is required.');
  }
  const code = String(body.researchApprovalCode || '').trim();
  if (!/^[a-f0-9]{64}$/.test(code)) throw new ResearchAccessError('A private research approval code is required before payment.');
  const reference = await redisCommand(['GET', PREFIX + 'code:' + hash(code)]);
  const record = assertApproved(reference ? await readApplication(reference) : null, order, customer);
  // One approved request can use only one payment route, preventing cross-channel duplicates.
  const route = await redisCommand(['SET', PREFIX + 'route:' + record.reference, channel, 'NX', 'EX', String(RECORD_TTL)]);
  if (route !== 'OK' && await redisCommand(['GET', PREFIX + 'route:' + record.reference]) !== channel) {
    throw new ResearchAccessError('A different payment route was already started for this request. Contact support before paying again.');
  }
  return record;
}
module.exports = { POLICY_VERSION, RECORD_TTL, PREFIX, ResearchAccessError, hash, key, enabled, normalizeApplication, createApplication, readApplication, assertApproved, requireApproval };
