(function () {
  'use strict';

  const CATEGORY_LIMITS = Object.freeze({
    'freeze-dried': 10,
    supplies: 10,
    injectables: 5,
  });

  function discountPercentForQuantity(quantity) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 1) return 0;
    return qty === 2 ? 2 : qty < 5 ? 5 : qty < 10 ? 8 : 12;
  }

  function money(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  const SALE_PERCENT = 25;

  function saleCents(regularCents) {
    return Math.round(regularCents * (100 - SALE_PERCENT) / 100);
  }

  // Automatic single-vial sale prices in cents, before quantity or package savings.
  const SINGLE_VIAL_MARKDOWNS = Object.freeze({
    'bpc157-10': 5500,
    'tb500-10': 6900,
    'tesamorelin-10': 6400,
    sermorelin: 5900,
    ipamorelin: 5400,
    'mela1-10': 3700,
    'mela2-10': 3600,
    'nad-500': 5200,
    'mots-c': 5400,
    'retatrutide-10': 7500,
    'retatrutide-20': 11900,
    semaglutide: 6800,
    tirzepatide: 6800,
    selank: 3900,
    semax: 4500,
    'aod-9604': 6500,
    'igf1-lr3': 7400,
    'kpv-10': 4400,
    'cjc1295-dac-10': 5900,
    'cjc1295-no-dac-10': 6400,
    'pt141-10': 3900,
  });

  function saleProduct(product, { applyMarkdowns = true } = {}) {
    const singlePrices = applyMarkdowns ? SINGLE_VIAL_MARKDOWNS : {};
    const components = product.components?.map(component => {
      const regularCents = component.regularCents ?? component.unitCents;
      const unitCents = Math.min(saleCents(regularCents), singlePrices[component.productId] ?? Infinity);
      return { ...component, regularCents, unitCents };
    });
    const singlesCents = components?.reduce((sum, c) => sum + c.unitCents * c.quantity, 0);
    const singleCents = singlePrices[product.id];
    const pricing = product.pricing.map(option => {
      const regularPrice = option.regularPrice ?? option.price;
      let cents = saleCents(Math.round(regularPrice * 100));
      if (components && applyMarkdowns) {
        const packageCents = Math.round(singlesCents * (100 - product.discountPercent) / 100);
        cents = Math.min(cents, packageCents);
      } else if (singleCents !== undefined) {
        const quantity = option.quantity ?? parseInt(option.label, 10);
        const tierCents = Math.round(singleCents * quantity * (100 - discountPercentForQuantity(quantity)) / 100);
        cents = Math.min(cents, tierCents);
      }
      return { ...option, regularPrice, price: cents / 100 };
    });
    if (!components) return { ...product, pricing };

    const packageCents = Math.round(pricing[0].price * 100);
    return { ...product, pricing, components, singlesCents, packageCents, savingsCents: singlesCents - packageCents };
  }

  // Compare the first purchasable option at its regular and current price.
  function compareDeals(a, b) {
    const [left] = a.pricing;
    const [right] = b.pricing;
    const leftRatio = left.price / (left.regularPrice ?? left.price);
    const rightRatio = right.price / (right.regularPrice ?? right.price);
    return leftRatio - rightRatio || a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
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
    const basePrice = Number(first && (first.regularPrice ?? first.price));
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
      Object.assign(product, saleProduct({ ...product, pricing: buildQuantityPricing(product, category) }));
    });
    return products;
  }

  const api = Object.freeze({
    CATEGORY_LIMITS,
    SALE_PERCENT,
    saleProduct,
    compareDeals,
    applyQuantityPricing,
    buildQuantityPricing,
    discountPercentForQuantity,
  });

  if (typeof window !== 'undefined') window.NxtQuantityPricing = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();