(function exposeSwapsFunding(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NxtSwapsFunding = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  'use strict';

  const CHECKOUT_ORIGIN = 'https://www.swaps.app/buy';
  const SUPPORTED_ASSETS = new Set(['BTC', 'ETH', 'USDT']);
  const FEE_RESERVE_PERCENT = 0.06;
  const FEE_RESERVE_FIXED_USD = 3.50;

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
    const grossedUp = (invoice + FEE_RESERVE_FIXED_USD) / (1 - FEE_RESERVE_PERCENT);
    return (Math.ceil(grossedUp * 100) / 100).toFixed(2);
  }

  function buildCheckoutUrl({ asset, invoiceUsd }) {
    const url = new URL(CHECKOUT_ORIGIN);
    url.searchParams.set('side', 'buy');
    url.searchParams.set('to', normalizeAsset(asset));
    // Swaps accepts a fiat-spend `amount`; it cannot lock a receive amount.
    // Gross up the invoice, open the bank-transfer rail explicitly, then require
    // the customer to confirm the live “You receive” value before paying.
    url.searchParams.set('amount', fundingAmountForInvoice(invoiceUsd));
    url.searchParams.set('method', 'ach');
    url.searchParams.set('input', 'send');
    return url.toString();
  }

  return Object.freeze({
    CHECKOUT_ORIGIN,
    buildCheckoutUrl,
    fundingAmountForInvoice,
  });
});
