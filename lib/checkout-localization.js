const FX_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const fxCache = new Map();

const EURO_COUNTRIES = new Set([
  'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT',
  'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK', 'AD', 'MC', 'SM', 'VA',
]);

const COUNTRY_CURRENCY = Object.freeze({
  AU: 'AUD', BR: 'BRL', CA: 'CAD', CH: 'CHF', CN: 'CNY', CZ: 'CZK', DK: 'DKK',
  GB: 'GBP', HK: 'HKD', HU: 'HUF', ID: 'IDR', IL: 'ILS', IN: 'INR', IS: 'ISK',
  JP: 'JPY', KR: 'KRW', MX: 'MXN', MY: 'MYR', NO: 'NOK', NZ: 'NZD', PH: 'PHP',
  PL: 'PLN', RO: 'RON', SE: 'SEK', SG: 'SGD', TH: 'THB', TR: 'TRY', US: 'USD',
  ZA: 'ZAR', AE: 'AED', SA: 'SAR',
});

const APPLE_PAY_MARKETS = new Set([
  'US', 'CA', 'GB', 'AU', 'NZ', 'JP', 'SG', 'HK', 'CH', 'NO', 'SE', 'DK', 'IS',
  ...EURO_COUNTRIES,
]);

const BANK_TRANSFER_MARKETS = new Set(['GB', 'CH', 'NO', 'SE', 'DK', ...EURO_COUNTRIES]);

function requestHeader(req, name) {
  const headers = req && req.headers;
  if (!headers) return '';
  if (typeof headers.get === 'function') return String(headers.get(name) || '');
  return String(headers[name] || headers[name.toLowerCase()] || '');
}

function normalizeLocale(value) {
  const supplied = String(value || '').trim().slice(0, 35);
  try { return Intl.getCanonicalLocales(supplied || 'en-US')[0] || 'en-US'; }
  catch (_) { return 'en-US'; }
}

function localeRegion(locale) {
  try { return String(new Intl.Locale(normalizeLocale(locale)).region || '').toUpperCase(); }
  catch (_) { return ''; }
}

function requestCountry(req, locale) {
  const country = requestHeader(req, 'x-vercel-ip-country').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(country)) return country;
  return localeRegion(locale) || 'US';
}

function currencyForCountry(country) {
  const code = String(country || '').toUpperCase();
  if (EURO_COUNTRIES.has(code)) return 'EUR';
  return COUNTRY_CURRENCY[code] || 'USD';
}

function formatCurrency(value, currency, locale) {
  try {
    return new Intl.NumberFormat(normalizeLocale(locale), {
      style: 'currency', currency, currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(value);
  } catch (_) {
    return `${currency} ${Number(value).toFixed(currency === 'JPY' ? 0 : 2)}`;
  }
}

async function fetchUsdFxRate(currency) {
  if (currency === 'USD') return { rate: 1, date: null };
  const cached = fxCache.get(currency);
  if (cached && Date.now() - cached.savedAt < FX_CACHE_TTL_MS) return cached;

  const response = await fetch(`https://api.frankfurter.dev/v2/rate/USD/${currency}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'NXT-LVL-Checkout/1.0' },
    signal: AbortSignal.timeout(4_000),
  });
  const data = await response.json().catch(() => ({}));
  const rate = Number(data && data.rate);
  if (!response.ok || !Number.isFinite(rate) || rate <= 0) throw new Error('Localized currency rate unavailable.');
  const value = { rate, date: String(data.date || ''), savedAt: Date.now() };
  fxCache.set(currency, value);
  return value;
}

function fundingGuidance(country) {
  const code = String(country || '').toUpperCase();
  const methods = [];
  if (APPLE_PAY_MARKETS.has(code)) methods.push('Apple Pay');
  methods.push('debit or credit card');
  if (BANK_TRANSFER_MARKETS.has(code)) methods.push('bank transfer');
  return {
    methods,
    title: `${methods.join(', ').replace(/, ([^,]*)$/, ' or $1')} may be available through Paybis for your location.`,
    detail: 'Paybis controls availability, fees, limits, and identity checks. Any Paybis account or wallet you create belongs to you, and NXT LVL does not receive or store the personal or payment information you enter there.',
  };
}

async function localizeOrderTotal(req, totalCents, requestedLocale) {
  const locale = normalizeLocale(requestedLocale);
  const country = requestCountry(req, locale);
  let currency = currencyForCountry(country);
  let fx = { rate: 1, date: null };
  if (currency !== 'USD') {
    try { fx = await fetchUsdFxRate(currency); }
    catch (_) { currency = 'USD'; }
  }
  const usdAmount = Number(totalCents) / 100;
  const localAmount = Math.round(usdAmount * fx.rate * 100) / 100;
  return {
    locale,
    currency,
    formattedTotal: formatCurrency(localAmount, currency, locale),
    usdFormattedTotal: formatCurrency(usdAmount, 'USD', 'en-US'),
    approximate: currency !== 'USD',
    rateDate: fx.date || null,
    funding: fundingGuidance(country),
  };
}

module.exports = {
  currencyForCountry,
  fetchUsdFxRate,
  formatCurrency,
  fundingGuidance,
  localizeOrderTotal,
  normalizeLocale,
  requestCountry,
};
