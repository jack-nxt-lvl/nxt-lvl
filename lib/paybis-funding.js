(function exposePaybisFunding(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NxtPaybisFunding = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  'use strict';

  const CHECKOUT_ORIGINS = Object.freeze({
    BTC: 'https://paybis.com/',
    ETH: 'https://paybis.com/buy-ethereum/',
    USDT: 'https://paybis.com/buy-tether/',
  });
  const SUPPORTED_ASSETS = new Set(Object.keys(CHECKOUT_ORIGINS));
  const FEE_RESERVE_PERCENT = 0.06;
  const FEE_RESERVE_FIXED_USD = 3.50;

  function normalizeAsset(asset) {
    const normalized = String(asset || '').trim().toUpperCase();
    if (!SUPPORTED_ASSETS.has(normalized)) throw new Error('Unsupported Paybis funding asset.');
    return normalized;
  }

  function normalizeUsdAmount(amount) {
    const normalized = String(amount || '').trim();
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized) || Number(normalized) <= 0) {
      throw new Error('Invalid Paybis funding amount.');
    }
    return Number(normalized);
  }

  function fundingAmountForInvoice(invoiceUsd) {
    const invoice = normalizeUsdAmount(invoiceUsd);
    const grossedUp = (invoice + FEE_RESERVE_FIXED_USD) / (1 - FEE_RESERVE_PERCENT);
    return (Math.ceil(grossedUp * 100) / 100).toFixed(2);
  }

  function buildCheckoutUrl({ asset, invoiceUsd }) {
    const normalizedAsset = normalizeAsset(asset);
    normalizeUsdAmount(invoiceUsd);
    // Public Paybis product pages keep the customer inside Paybis and do not
    // expose a provider marketplace that can substitute Transak. A signed
    // partner widget is required to prefill amount/address, so the checkout UI
    // copies and displays the fee-buffered spend amount beside this direct link.
    return CHECKOUT_ORIGINS[normalizedAsset];
  }

  return Object.freeze({
    CHECKOUT_ORIGINS,
    buildCheckoutUrl,
    fundingAmountForInvoice,
  });
});
