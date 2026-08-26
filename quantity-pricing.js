(function () {
  'use strict';

  const CATEGORY_LIMITS = Object.freeze({
    'freeze-dried': 10,
    injectables: 5,
  });

  function discountPercentForQuantity(quantity) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 1) return 0;
    return qty === 2 ? 2 : Math.min(qty, 10);
  }

  function money(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function unitNameForProduct(product) {
    const firstLabel = String(product && product.pricing && product.pricing[0] && product.pricing[0].label || '');
    const match = firstLabel.match(/^\s*1\s+([a-z]+)/i);
    let unit = match ? match[1].replace(/s$/i, '') : 'Vial';
    const allowed = ['vial', 'kit', 'bottle', 'pack', 'set'];
    if (!allowed.includes(unit.toLowerCase())) unit = 'Vial';
    return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
  }

  function buildQuantityPricing(product, categoryOverride) {
    const category = String(categoryOverride || product && product.category || '');
    const limit = CATEGORY_LIMITS[category];
    if (!limit || !product || !Array.isArray(product.pricing) || !product.pricing.length) {
      return product && Array.isArray(product.pricing) ? product.pricing.slice() : [];
    }

    const first = product.pricing.find((option) => /^\s*1\b/.test(String(option && option.label || ''))) || product.pricing[0];
    const basePrice = Number(first && first.price);
    if (!Number.isFinite(basePrice) || basePrice <= 0) return product.pricing.slice();

    const unit = unitNameForProduct(product);
    return Array.from({ length: limit }, (_, index) => {
      const quantity = index + 1;
      const discountPercent = discountPercentForQuantity(quantity);
      const price = money(basePrice * quantity * (1 - discountPercent / 100));
      const label = quantity === 1
        ? `1 ${unit}`
        : `${quantity} ${unit}s · Save ${discountPercent}%`;
      return { label, price, quantity, discountPercent };
    });
  }

  function applyQuantityPricing(products, categoryResolver) {
    if (!Array.isArray(products)) return products;
    products.forEach((product) => {
      const category = typeof categoryResolver === 'function'
        ? categoryResolver(product)
        : product && product.category;
      if (CATEGORY_LIMITS[category]) product.pricing = buildQuantityPricing(product, category);
    });
    return products;
  }

  const api = Object.freeze({
    CATEGORY_LIMITS,
    applyQuantityPricing,
    buildQuantityPricing,
    discountPercentForQuantity,
  });

  if (typeof window !== 'undefined') window.NxtQuantityPricing = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();