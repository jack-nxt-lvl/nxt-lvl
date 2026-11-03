(function (root) {
  'use strict';
  const KEY = 'nxtCartV1';
  function normalize(items) {
    if (!Array.isArray(items)) return [];
    const result = [];
    for (const item of items.slice(0, 50)) {
      if (!item || !/^[a-z0-9-]+$/.test(item.productId || '')) continue;
      const pricingIndex = Number(item.pricingIndex), qty = Number(item.qty);
      if (!Number.isInteger(pricingIndex) || pricingIndex < 0 || pricingIndex > 9 || !Number.isInteger(qty) || qty < 1) continue;
      const previous = result.find(p => p.productId === item.productId && p.pricingIndex === pricingIndex);
      if (previous) previous.qty = Math.min(20, previous.qty + qty);
      else result.push({productId:item.productId, pricingIndex, qty:Math.min(20, qty)});
    }
    return result;
  }
  function add(storage, productId, pricingIndex) {
    let saved;
    try { saved = JSON.parse(storage.getItem(KEY) || '[]'); } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      saved = [];
    }
    const items = normalize(saved);
    const candidate = normalize([{productId, pricingIndex, qty:1}])[0];
    if (!candidate) throw new Error('Invalid product selection.');
    const previous = items.find(p => p.productId === productId && p.pricingIndex === pricingIndex);
    if (previous) previous.qty = Math.min(20, previous.qty + 1);
    else {
      if (items.length >= 50) throw new Error('Please review your cart before adding another product.');
      items.push(candidate);
    }
    // Only product identity and quantities persist; checkout resolves trusted prices.
    storage.setItem(KEY, JSON.stringify(items));
    return items;
  }
  const api = Object.freeze({KEY, normalize, add});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.NxtCartStorage = api;
})(typeof window !== 'undefined' ? window : null);
