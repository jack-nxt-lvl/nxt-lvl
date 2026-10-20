(function (root) {
  'use strict';
  const ids = new Set(['bpc157-10','tb500-10','tb500-bpc157','tesamorelin-10','sermorelin','ipamorelin','mela2-10','mela1-10','nad-500','ghk-cu-50','ghk-cu-100','glow-70','mots-c','retatrutide-10','retatrutide-20','hcg-5000','hcg-10000','semaglutide','tirzepatide','selank','semax','dsip','aod-9604','igf1-lr3','slu-pp-332-10','cjc1295-dac-10','cjc1295-no-dac-10','pt141-10','bac-water-10ml','glutathione-1500']);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function url(id, size = 480) { return ids.has(id) ? '/assets/products/' + id + '-' + size + '-v1.webp' : ''; }
  function image(product, options = {}) {
    if (product.components) return '<div class="product-pair">' + product.components.map(c => image({id:c.productId,name:c.name}, options)).join('') + '</div>';
    if (!ids.has(product.id)) return '<div class="product-material-tile"><span>NXT LVL · Research</span><strong>' + escape(product.name) + '</strong><span>' + escape(product.amount || 'Laboratory material') + '</span></div>';
    const alt = 'NXT LVL ' + product.name + ' box and vial — product mockup';
    return '<img class="product-packshot" src="' + url(product.id) + '" srcset="' + url(product.id) + ' 480w, ' + url(product.id,960) + ' 960w" sizes="' + (options.sizes || '(max-width:600px) 45vw, (max-width:1000px) 45vw, 380px') + '" width="960" height="960" alt="' + escape(alt) + '" loading="' + (options.eager ? 'eager' : 'lazy') + '" decoding="async"' + (options.eager ? ' fetchpriority="high"' : '') + '>';
  }
  const api = Object.freeze({url,image,ids:Array.from(ids)});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.NxtProductImages = api;
})(typeof window !== 'undefined' ? window : null);
