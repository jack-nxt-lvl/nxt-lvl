(function () {
  'use strict';

  if (typeof document === 'undefined' || document.documentElement.dataset.nxtCatalogQuantityV1 === '1') return;
  document.documentElement.dataset.nxtCatalogQuantityV1 = '1';

  const pricingApi = window.NxtQuantityPricing;
  if (!pricingApi || typeof compounds === 'undefined' || !Array.isArray(compounds)) return;

  pricingApi.applyQuantityPricing(compounds);

  const activeFilter = document.querySelector('#filterBar .filter-btn.active');
  const activeCall = activeFilter && activeFilter.getAttribute('onclick') || '';
  const activeMatch = activeCall.match(/filterByCategory\('([^']+)'/);
  if (typeof renderGrid === 'function') renderGrid(activeMatch ? activeMatch[1] : 'all');

  const style = document.createElement('style');
  style.id = 'nxt-catalog-search-quantity-styles';
  style.textContent = `
    .nxt-product-search {
      max-width: 820px !important;
      margin: 22px auto 30px !important;
      position: relative;
    }
    .nxt-search-shell {
      display: grid;
      grid-template-columns: 46px minmax(0, 1fr) 42px;
      align-items: center;
      min-height: 58px;
      padding: 0 8px 0 4px;
      border: 1px solid rgba(85, 245, 138, .34);
      border-radius: 16px;
      background: linear-gradient(145deg, rgba(10, 24, 17, .97), rgba(5, 13, 9, .98));
      box-shadow: 0 16px 44px rgba(0, 0, 0, .34), inset 0 1px rgba(255, 255, 255, .04), 0 0 28px rgba(85, 245, 138, .055);
      transition: border-color .2s, box-shadow .2s, transform .2s;
    }
    .nxt-search-shell:focus-within {
      border-color: rgba(167, 255, 95, .72);
      box-shadow: 0 0 0 3px rgba(85, 245, 138, .11), 0 18px 48px rgba(0, 0, 0, .4);
      transform: translateY(-1px);
    }
    .nxt-search-icon {
      width: 22px;
      height: 22px;
      justify-self: center;
      color: #55f58a;
    }
    #nxtProductSearch {
      width: 100%;
      min-width: 0;
      border: 0 !important;
      outline: 0 !important;
      padding: 16px 6px !important;
      color: #f4fff8 !important;
      background: transparent !important;
      box-shadow: none !important;
      font: 600 15px/1.4 Inter, sans-serif !important;
    }
    #nxtProductSearch::placeholder { color: #8fa99a; opacity: 1; }
    .nxt-search-clear {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 10px;
      color: #c0cdc5;
      background: rgba(255, 255, 255, .055);
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      opacity: 0;
      pointer-events: none;
      transition: opacity .2s, color .2s, background .2s;
    }
    .nxt-product-search.has-query .nxt-search-clear { opacity: 1; pointer-events: auto; }
    .nxt-search-clear:hover { color: #031008; background: #55f58a; }
    .nxt-search-meta {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin: 9px 3px 0;
      color: #91a399;
      font: 600 11px/1.4 Inter, sans-serif;
      letter-spacing: .25px;
    }
    .nxt-search-meta strong { color: #c8ff75; font-weight: 800; }
    .nxt-search-empty {
      display: none;
      grid-column: 1 / -1;
      padding: 34px 18px;
      border: 1px dashed rgba(85, 245, 138, .25);
      border-radius: 16px;
      color: #b7c8bd;
      background: rgba(6, 17, 11, .72);
      text-align: center;
      font: 600 14px/1.5 Inter, sans-serif;
    }
    .nxt-search-empty.show { display: block; }
    .custom-select-option span { line-height: 1.25; }
    @media (max-width: 700px) {
      .nxt-product-search { margin: 16px 0 22px !important; }
      .nxt-search-shell { min-height: 54px; border-radius: 14px; }
      #nxtProductSearch { font-size: 16px !important; }
      .nxt-search-meta { align-items: flex-start; font-size: 10px; }
      .custom-select-menu { max-height: min(380px, 52vh) !important; overflow-y: auto !important; }
    }
  `;
  document.body.appendChild(style);

  const menuHeader = document.querySelector('#menu .section-header');
  let wrap = document.querySelector('.premium-search, .nxt-product-search');
  if (!wrap && menuHeader) {
    wrap = document.createElement('div');
    menuHeader.insertAdjacentElement('afterend', wrap);
  }
  if (!wrap) return;

  wrap.className = 'nxt-product-search';
  wrap.innerHTML = `
    <div class="nxt-search-shell">
      <svg class="nxt-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"></circle>
        <path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      </svg>
      <input id="nxtProductSearch" type="search" autocomplete="off"
        placeholder="Search BPC-157, Retatrutide, Test C, strength…"
        aria-label="Search research products">
      <button class="nxt-search-clear" type="button" aria-label="Clear product search">×</button>
    </div>
    <div class="nxt-search-meta">
      <span class="nxt-search-status"><strong>All products</strong> shown</span>
      <span>Freeze-dried: 1–10 · Injectables: 1–5</span>
    </div>
  `;

  const grid = document.getElementById('compoundGrid');
  const input = wrap.querySelector('#nxtProductSearch');
  const clear = wrap.querySelector('.nxt-search-clear');
  const status = wrap.querySelector('.nxt-search-status');
  const empty = document.createElement('div');
  empty.className = 'nxt-search-empty';
  empty.textContent = 'No products match that search. Try a product name, strength, or category.';
  if (grid) grid.appendChild(empty);

  function normalize(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/gi, ' ')
      .trim()
      .toLowerCase();
  }

  function productForCard(card) {
    const call = card.getAttribute('onclick') || '';
    const match = call.match(/openModal\('([^']+)'\)/);
    return match ? compounds.find((product) => product.id === match[1]) : null;
  }

  let applying = false;
  function applySearch() {
    if (applying || !grid) return;
    applying = true;
    const query = normalize(input.value);
    const cards = Array.from(grid.querySelectorAll('.compound-card'));
    let visible = 0;

    cards.forEach((card) => {
      const product = productForCard(card);
      const haystack = normalize(product ? [
        product.name,
        product.aka,
        product.category,
        product.amount,
        product.shortDesc,
        ...(product.tags || []),
      ].join(' ') : card.textContent);
      const matches = !query || haystack.includes(query);
      card.hidden = !matches;
      card.style.display = matches ? '' : 'none';
      if (matches) visible += 1;
    });

    wrap.classList.toggle('has-query', Boolean(query));
    empty.classList.toggle('show', Boolean(query) && visible === 0);
    if (!empty.isConnected) grid.appendChild(empty);
    status.innerHTML = query
      ? `<strong>${visible}</strong> product${visible === 1 ? '' : 's'} found`
      : `<strong>${visible}</strong> products shown`;
    applying = false;
  }

  input.addEventListener('input', applySearch);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value) {
      input.value = '';
      applySearch();
    }
  });
  clear.addEventListener('click', () => {
    input.value = '';
    applySearch();
    input.focus();
  });

  if (grid) {
    let queued = false;
    new MutationObserver(() => {
      if (applying || queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        applySearch();
      });
    }).observe(grid, { childList: true });
  }

  applySearch();
})();