(function exposeSwapsFunding(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NxtSwapsFunding = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  'use strict';

  const CHECKOUT_ORIGIN = 'https://www.swaps.app/';
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

  function popupFeatures(screenInfo = {}, windowInfo = {}) {
    const availableWidth = Math.max(390, Number(screenInfo.availWidth) || Number(windowInfo.outerWidth) || 1280);
    const availableHeight = Math.max(640, Number(screenInfo.availHeight) || Number(windowInfo.outerHeight) || 800);
    const width = Math.min(540, Math.max(420, Math.round(availableWidth * 0.38)));
    const height = Math.min(880, Math.max(680, availableHeight - 28));
    const screenLeft = Number(screenInfo.availLeft) || Number(windowInfo.screenX) || 0;
    const screenTop = Number(screenInfo.availTop) || Number(windowInfo.screenY) || 0;
    const left = Math.max(screenLeft, screenLeft + availableWidth - width - 10);
    const top = Math.max(screenTop, screenTop + Math.round((availableHeight - height) / 2));
    return `popup=yes,resizable=yes,scrollbars=yes,width=${width},height=${height},left=${left},top=${top}`;
  }

  return Object.freeze({
    CHECKOUT_ORIGIN,
    buildCheckoutUrl,
    popupFeatures,
  });
});
