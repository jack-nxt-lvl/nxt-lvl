const crypto = require('crypto');

const LOCK_TTL_MS = 60_000;
const KEY_VERSION = 'v2';

const ACQUIRE_LOCK_SCRIPT = `
local txLock = redis.call('GET', KEYS[1])
local orderLock = redis.call('GET', KEYS[2])
if txLock or orderLock then
  return {0, txLock or '', orderLock or ''}
end
redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[2])
redis.call('SET', KEYS[2], ARGV[1], 'PX', ARGV[2])
return {1, '', ''}
`;

const RELEASE_LOCK_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  redis.call('DEL', KEYS[1])
end
if redis.call('GET', KEYS[2]) == ARGV[1] then
  redis.call('DEL', KEYS[2])
end
return 1
`;

const CLAIM_PAYMENT_SCRIPT = `
local txOrder = redis.call('GET', KEYS[1])
local orderTx = redis.call('GET', KEYS[2])
if txOrder and txOrder ~= ARGV[1] then
  return {'TX_USED', txOrder}
end
if orderTx and orderTx ~= ARGV[2] then
  return {'ORDER_ALREADY_PAID', orderTx}
end
redis.call('SET', KEYS[1], ARGV[1])
redis.call('SET', KEYS[2], ARGV[2])
if txOrder or orderTx then
  return {'IDEMPOTENT', ARGV[1]}
end
return {'CLAIMED', ARGV[1]}
`;

class PaymentLedgerError extends Error {
  constructor(message, code = 'ledger_unavailable') {
    super(message);
    this.name = 'PaymentLedgerError';
    this.code = code;
    this.httpStatus = code === 'verification_busy' ? 202 : 503;
  }
}

function ledgerCredentials() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new PaymentLedgerError('The secure payment ledger is not configured. Payment verification is paused.');
  }
  return { url: String(url).replace(/\/$/, ''), token };
}

async function redisCommand(command) {
  const { url, token } = ledgerCredentials();
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(8_000),
    });
  } catch (error) {
    throw new PaymentLedgerError(`The secure payment ledger is unavailable: ${error.message || 'connection failed'}`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new PaymentLedgerError('The secure payment ledger rejected the request. Payment verification is paused.');
  }
  return data.result;
}

function safeOrderId(orderId) {
  const value = String(orderId || '');
  if (!/^NXT-[A-Z0-9-]{6,80}$/.test(value)) throw new Error('The order ID is invalid.');
  return value;
}

function paymentKeys(asset, txid, orderId) {
  const network = asset === 'BTC' ? 'btc-mainnet' : 'eth-mainnet';
  const order = safeOrderId(orderId);
  const txRef = `${network}:${String(txid).toLowerCase()}`;
  return {
    order,
    txRef,
    txLock: `nxt:payment:${KEY_VERSION}:{verification}:tx:${txRef}`,
    orderLock: `nxt:payment:${KEY_VERSION}:{verification}:order:${order}`,
    txClaim: `nxt:payment:${KEY_VERSION}:{claims}:tx:${txRef}`,
    orderClaim: `nxt:payment:${KEY_VERSION}:{claims}:order:${order}`,
  };
}

async function acquirePaymentLock(asset, txid, orderId) {
  const keys = paymentKeys(asset, txid, orderId);
  const owner = `${keys.order}:${crypto.randomUUID()}`;
  const result = await redisCommand([
    'EVAL', ACQUIRE_LOCK_SCRIPT, '2', keys.txLock, keys.orderLock, owner, String(LOCK_TTL_MS),
  ]);
  if (!Array.isArray(result) || Number(result[0]) !== 1) {
    throw new PaymentLedgerError('This payment is already being verified. Please retry in a few seconds.', 'verification_busy');
  }
  return { keys, owner };
}

async function releasePaymentLock(lease) {
  if (!lease) return;
  await redisCommand([
    'EVAL', RELEASE_LOCK_SCRIPT, '2', lease.keys.txLock, lease.keys.orderLock, lease.owner,
  ]);
}

async function claimPayment(asset, txid, orderId) {
  const keys = paymentKeys(asset, txid, orderId);
  const result = await redisCommand([
    'EVAL', CLAIM_PAYMENT_SCRIPT, '2', keys.txClaim, keys.orderClaim, keys.order, keys.txRef,
  ]);
  if (!Array.isArray(result) || !result[0]) {
    throw new PaymentLedgerError('The secure payment ledger returned an invalid response.');
  }
  return { status: String(result[0]), existing: result[1] ? String(result[1]) : null, durable: true };
}

async function reserveQuoteAmount(asset, amountUnits, orderId, ttlMs) {
  const network = asset === 'BTC' ? 'btc-mainnet' : 'eth-mainnet';
  const order = safeOrderId(orderId);
  if (!/^\d{1,80}$/.test(String(amountUnits))) throw new Error('The quote amount is invalid.');
  const ttl = Number(ttlMs);
  if (!Number.isInteger(ttl) || ttl < 60_000 || ttl > 24 * 60 * 60 * 1000) {
    throw new Error('The quote reservation time is invalid.');
  }
  const key = `nxt:payment:${KEY_VERSION}:{amounts}:${network}:${amountUnits}`;
  const result = await redisCommand(['SET', key, order, 'NX', 'PX', String(ttl)]);
  return result === 'OK';
}

module.exports = {
  LOCK_TTL_MS,
  PaymentLedgerError,
  acquirePaymentLock,
  claimPayment,
  ledgerCredentials,
  paymentKeys,
  redisCommand,
  releasePaymentLock,
  reserveQuoteAmount,
};
