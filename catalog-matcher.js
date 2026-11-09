(function (root, factory) {
  const search = factory();
  if (typeof module === 'object' && module.exports) module.exports = search;
  else root.NxtCatalogMatcher = search;
})(typeof window === 'undefined' ? this : window, function () {
  function normalizeCatalogSearch(value) {
    return String(value || '').normalize('NFKD').toLowerCase()
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/(\d),(?=\d{3}\b)/g, '$1')
      .replace(/\+/g, ' plus ')
      .replace(/\bno\s+dac\b/g, 'without dac')
      .replace(/(\d)\s+(mcg|mg|ml|iu|g)\b/g, '$1$2')
      .trim();
  }

  function terms(text) {
    return text.match(/\d+(?:\.\d+)?(?:mcg|mg|ml|iu|g)\b|\d+(?:\.\d+)?|[a-z]+/g) || [];
  }

  function indexText(text) {
    const normalized = normalizeCatalogSearch(text);
    const words = new Set(terms(normalized));
    // Some labels are routinely typed without their hyphens, e.g. GHKCu.
    for (const joined of normalized.match(/[a-z]+(?:-[a-z]+)+/g) || []) {
      words.add(joined.replace(/-/g, ''));
    }
    return Array.from(words);
  }

  function matchesTerms(words, query) {
    const requested = terms(normalizeCatalogSearch(query));
    if (!requested.length) return !String(query || '').trim();
    return requested.every(term => {
      if (/^\d+(?:\.\d+)?$/.test(term)) {
        return words.some(word => word.replace(/(?:mcg|mg|ml|iu|g)$/, '') === term);
      }
      if (/^(?:mcg|mg|ml|iu|g)$/.test(term)) {
        return words.includes(term) || words.some(word => word.match(/[a-z]+$/)?.[0] === term);
      }
      if (/^\d/.test(term) || term === 'with') return words.includes(term);
      return words.some(word => word.startsWith(term) || (term.length >= 3 && word.includes(term)));
    });
  }

  function productText(product) {
    return [product.name, product.amount, product.form, product.aka, product.category, product.shortDesc, ...(product.tags || [])].join(' ');
  }

  function matchesCatalogProduct(product, query, requestedId) {
    if (!product) return false;
    if (requestedId) return product.id === requestedId;
    return matchesTerms(indexText(productText(product)), query);
  }

  return { normalizeCatalogSearch, indexText, matchesTerms, productText, matchesCatalogProduct };
});
