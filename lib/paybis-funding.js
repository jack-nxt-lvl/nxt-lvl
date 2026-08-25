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

  function normalizeAsset(asset) {
    const normalized = String(asset || '').trim().toUpperCase();
    if (!SUPPORTED_ASSETS.has(normalized)) throw new Error('Unsupported Paybis funding asset.');
    return normalized;
  }

  function buildCheckoutUrl({ asset }) {
    const normalizedAsset = normalizeAsset(asset);
    // The public Paybis product page lets the customer choose their own payment
    // method and purchase enough crypto to cover the order and applicable fees.
    return CHECKOUT_ORIGINS[normalizedAsset];
  }

  return Object.freeze({
    CHECKOUT_ORIGINS,
    buildCheckoutUrl,
  });
});
