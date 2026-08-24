(function exposeSwapsFunding(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NxtSwapsFunding = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  'use strict';

  const CHECKOUT_ORIGIN = 'https://www.swaps.app/buy';
  const SUPPORTED_ASSETS = new Set(['BTC', 'ETH', 'USDT']);
  const FALLBACK_PERCENT_RESERVE = 0.06;
  const FALLBACK_FIXED_RESERVE_USD = 3.50;

  function normalizeAsset(asset) {
    const normalized = String(asset || '').trim().toUpperCase();
    if (!SUPPORTED_ASSETS.has(normalized)) throw new Error('Unsupported Swaps funding asset.');
    return normalized;
  }

  function normalizeUsdAmount(amount) {
    const normalized = String(amount || '').trim();
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized) || Number(normalized) <= 0) {
      throw new Error('Invalid Swaps funding amount.');
    }
    return Number(normalized);
  }

  function fundingAmountForInvoice(invoiceUsd) {
    const invoice = normalizeUsdAmount(invoiceUsd);
    const grossedUp = (invoice + FALLBACK_FIXED_RESERVE_USD) / (1 - FALLBACK_PERCENT_RESERVE);
    return (Math.ceil(grossedUp * 100) / 100).toFixed(2);
  }

  function buildCheckoutUrl({ asset, invoiceUsd }) {
    const url = new URL(CHECKOUT_ORIGIN);
    url.searchParams.set('side', 'buy');
    url.searchParams.set('to', normalizeAsset(asset));
    // Swaps' public link only supports a fiat-spend `amount`; it cannot lock a
    // receive amount. This is a conservative backup if the exact-amount Transak
    // session is unavailable, not the primary card checkout.
    url.searchParams.set('amount', fundingAmountForInvoice(invoiceUsd));
    return url.toString();
  }

  return Object.freeze({
    CHECKOUT_ORIGIN,
    buildCheckoutUrl,
    fundingAmountForInvoice,
  });
});
