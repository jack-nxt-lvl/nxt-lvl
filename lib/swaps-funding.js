(function exposeSwapsFunding(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NxtSwapsFunding = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  'use strict';

  const CHECKOUT_ORIGIN = 'https://www.swaps.app/buy';
  const SUPPORTED_ASSETS = new Set(['BTC', 'ETH', 'USDT']);

  function normalizeAsset(asset) {
    const normalized = String(asset || '').trim().toUpperCase();
    if (!SUPPORTED_ASSETS.has(normalized)) throw new Error('Unsupported Swaps funding asset.');
    return normalized;
  }

  function normalizeAmount(amount) {
    const normalized = String(amount || '').trim();
    if (!/^\d+(?:\.\d{1,18})?$/.test(normalized) || Number(normalized) <= 0) {
      throw new Error('Invalid Swaps funding amount.');
    }
    return normalized;
  }

  function buildCheckoutUrl({ asset, amount }) {
    const url = new URL(CHECKOUT_ORIGIN);
    url.searchParams.set('side', 'buy');
    url.searchParams.set('to', normalizeAsset(asset));
    url.searchParams.set('amount', normalizeAmount(amount));
    // Swaps defaults `amount` to the fiat "You pay" field. Receive mode makes
    // the same value the requested crypto amount, which is what an invoice needs.
    url.searchParams.set('input', 'receive');
    return url.toString();
  }

  return Object.freeze({
    CHECKOUT_ORIGIN,
    buildCheckoutUrl,
  });
});
