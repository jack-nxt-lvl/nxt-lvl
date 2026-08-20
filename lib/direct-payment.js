const crypto = require('crypto');
const { getAddress } = require('ethers');
const { compounds } = require('../products-data-original.js');

const BTC_ADDRESS = 'bc1qqlvxgtn7rt4mchdwxmpldefauzfag28925jnrz';
const ETH_ADDRESS = getAddress('0xcAB4A4f03D32dA598EfdAba944753415f4915281');
const USDT_ADDRESS = ETH_ADDRESS;
const USDT_CONTRACT = getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7');
const SHIPPING_CENTS = 1000;
const QUOTE_TTL_MS = 15 * 60 * 1000;
const QUOTE_GRACE_MS = 2 * 60 * 60 * 1000;
const QUOTE_RESERVATION_TTL_MS = QUOTE_TTL_MS + QUOTE_GRACE_MS;

const ASSETS = Object.freeze({
  BTC: {
    code: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Mainnet',
    address: BTC_ADDRESS,
    decimals: 8,
    confirmations: 6,
  },
  ETH: {
    code: 'ETH',
    name: 'Ethereum',
    network: 'Ethereum Mainnet',
    address: ETH_ADDRESS,
    decimals: 18,
    displayDecimals: 8,
    confirmations: 64,
  },
  USDT: {
    code: 'USDT',
    name: 'Tether USD',
    network: 'Ethereum Mainnet (ERC-20)',
    address: USDT_ADDRESS,
    contract: USDT_CONTRACT,
    decimals: 6,
    confirmations: 64,
  },
});

function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.end(JSON.stringify(body));
}

function allowedOrigin(req) {
  const value = String(req.headers.origin || '').replace(/\/$/, '');
  if (value === 'https://nxtlvl-research.com' || value === 'https://www.nxtlvl-research.com') return true;
  if (process.env.VERCEL_ENV === 'production') return false;
  try {
    const url = new URL(value);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.vercel.app');
  } catch (_) {
    return false;
  }
}

function applyCors(req, res) {
  if (!allowedOrigin(req)) return false;
  res.setHeader('Access-Control-Allow-Origin', String(req.headers.origin).replace(/\/$/, ''));
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  return true;
}

function normalizeOrder(items, fulfillment) {
  if (!Array.isArray(items) || !items.length || items.length > 50) {
    throw new Error('Your cart is empty or too large.');
  }

  let subtotalCents = 0;
  let totalQuantity = 0;
  const normalizedItems = items.map((item) => {
    const key = String(item && item.key || '');
    const separator = key.lastIndexOf('::');
    const productId = separator > 0 ? key.slice(0, separator) : String(item && item.productId || '');
    const pricingIndex = separator > 0 ? Number(key.slice(separator + 2)) : Number(item && item.pricingIndex);
    const quantity = Number(item && item.qty);
    const product = compounds.find((entry) => entry.id === productId);
    const priceOption = product && Number.isInteger(pricingIndex) ? product.pricing[pricingIndex] : null;

    if (!product || !priceOption || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error('Your cart contains an invalid product, option, or quantity.');
    }

    const unitCents = Math.round(Number(priceOption.price) * 100);
    const lineCents = unitCents * quantity;
    subtotalCents += lineCents;
    totalQuantity += quantity;
    return {
      key: `${product.id}::${pricingIndex}`,
      productId: product.id,
      name: product.name,
      label: priceOption.label,
      quantity,
      unitCents,
      lineCents,
    };
  });

  if (totalQuantity > 100 || subtotalCents < 100 || subtotalCents > 1_000_000) {
    throw new Error('The cart total is outside the supported checkout range.');
  }

  const mode = String(fulfillment || '').toLowerCase() === 'pickup' ? 'pickup' : 'shipping';
  const shippingCents = mode === 'pickup' ? 0 : SHIPPING_CENTS;
  const totalCents = subtotalCents + shippingCents;
  const itemDigest = crypto.createHash('sha256').update(JSON.stringify(normalizedItems)).digest('hex');

  return { mode, normalizedItems, subtotalCents, shippingCents, totalCents, itemDigest };
}

function quoteKey() {
  const secret = process.env.CRYPTO_QUOTE_SECRET;
  if (!secret) throw new Error('CRYPTO_QUOTE_SECRET is not configured.');
  if (secret.length < 32) throw new Error('CRYPTO_QUOTE_SECRET must contain at least 32 characters.');
  return crypto.createHmac('sha256', secret).update('nxt-direct-payment-quote-v1').digest();
}

function requiredConfirmations(asset) {
  const config = ASSETS[String(asset || '').toUpperCase()];
  if (!config) throw new Error('Unsupported payment asset.');
  return Number(config.confirmations);
}

function signQuote(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', quoteKey()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyQuote(token) {
  const [body, supplied] = String(token || '').split('.');
  if (!body || !supplied) throw new Error('The payment quote is invalid.');
  const expected = crypto.createHmac('sha256', quoteKey()).update(body).digest();
  let actual;
  try { actual = Buffer.from(supplied, 'base64url'); } catch (_) { throw new Error('The payment quote is invalid.'); }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    throw new Error('The payment quote could not be authenticated.');
  }
  let payload;
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); }
  catch (_) { throw new Error('The payment quote is invalid.'); }
  if (payload.v !== 1 || !ASSETS[payload.asset] || !payload.orderId || !payload.amountUnits || !payload.customerDigest) {
    throw new Error('The payment quote is invalid.');
  }
  if (Date.now() > Number(payload.expiresAt) + QUOTE_GRACE_MS) {
    throw new Error('This payment quote is too old. Start checkout again.');
  }
  return payload;
}

function randomOrderId() {
  return `NXT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function uniqueAtomicTag(maxExclusive) {
  return crypto.randomInt(1, maxExclusive);
}

async function fetchUsdPrice(asset) {
  if (asset === 'USDT') return 1;
  const pair = `${asset}-USD`;
  const sources = [
    async () => {
      const response = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, {
        headers: { Accept: 'application/json', 'User-Agent': 'NXT-LVL-Checkout/1.0' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error('Coinbase price unavailable');
      return Number(data && data.data && data.data.amount);
    },
    async () => {
      const id = asset === 'BTC' ? 'bitcoin' : 'ethereum';
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`, {
        headers: { Accept: 'application/json', 'User-Agent': 'NXT-LVL-Checkout/1.0' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error('CoinGecko price unavailable');
      return Number(data && data[id] && data[id].usd);
    },
  ];
  for (const source of sources) {
    try {
      const price = await source();
      if (Number.isFinite(price) && price > 0) return price;
    } catch (_) {}
  }
  throw new Error(`A live ${asset} price is temporarily unavailable.`);
}

function amountForQuote(asset, totalCents, usdPrice) {
  if (asset === 'USDT') {
    const units = BigInt(totalCents) * 10_000n + BigInt(uniqueAtomicTag(10_000));
    return { amountUnits: units.toString(), amountDisplay: formatAtomic(units, 6) };
  }
  const atomicPerCoin = 100_000_000;
  const baseAtomic = Math.ceil((totalCents / 100 / usdPrice) * atomicPerCoin);
  const fingerprintRange = asset === 'BTC' ? 1_000 : 10_000;
  const atomic = BigInt(baseAtomic + uniqueAtomicTag(fingerprintRange));
  if (asset === 'BTC') return { amountUnits: atomic.toString(), amountDisplay: formatAtomic(atomic, 8) };
  const wei = atomic * 10_000_000_000n;
  return { amountUnits: wei.toString(), amountDisplay: formatAtomic(atomic, 8) };
}

function formatAtomic(units, decimals) {
  const value = BigInt(units);
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = (value % base).toString().padStart(decimals, '0');
  return `${whole}.${fraction}`;
}

function paymentUri(asset, amountUnits, amountDisplay, orderId) {
  const config = ASSETS[asset];
  if (asset === 'BTC') {
    return `bitcoin:${config.address}?amount=${amountDisplay}&label=${encodeURIComponent('NXT LVL')}&message=${encodeURIComponent(orderId)}`;
  }
  if (asset === 'ETH') return `ethereum:${config.address}@1?value=${amountUnits}`;
  return `ethereum:${config.contract}@1/transfer?address=${config.address}&uint256=${amountUnits}`;
}

function explorerUrl(asset, txid) {
  return asset === 'BTC' ? `https://mempool.space/tx/${txid}` : `https://etherscan.io/tx/${txid}`;
}

function cleanTxid(value, asset) {
  const txid = String(value || '').trim();
  if (!/^(?:0x)?[a-fA-F0-9]{64}$/.test(txid)) throw new Error('Enter the 64-character transaction ID from your wallet.');
  const body = txid.replace(/^0x/i, '').toLowerCase();
  return asset === 'BTC' ? body : `0x${body}`;
}

function cleanCustomer(customer, mode) {
  const take = (name, max = 180) => String(customer && customer[name] || '').trim().slice(0, max);
  const clean = {
    name: take('name', 120), email: take('email', 180), phone: take('phone', 60),
    address: take('address', 180), unit: take('unit', 80), city: take('city', 100),
    state: take('state', 80), zip: take('zip', 30),
  };
  if (!clean.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) || !clean.phone) {
    throw new Error('Customer name, email, and phone are required.');
  }
  if (mode === 'shipping' && (!clean.address || !clean.city || !clean.state || !clean.zip)) {
    throw new Error('A complete shipping address is required.');
  }
  return clean;
}

function customerDigest(customer) {
  return crypto.createHash('sha256').update(JSON.stringify(customer)).digest('hex');
}

module.exports = {
  ASSETS,
  QUOTE_TTL_MS,
  QUOTE_RESERVATION_TTL_MS,
  applyCors,
  allowedOrigin,
  amountForQuote,
  cleanCustomer,
  cleanTxid,
  customerDigest,
  explorerUrl,
  fetchUsdPrice,
  formatAtomic,
  json,
  normalizeOrder,
  paymentUri,
  randomOrderId,
  requiredConfirmations,
  signQuote,
  verifyQuote,
};
