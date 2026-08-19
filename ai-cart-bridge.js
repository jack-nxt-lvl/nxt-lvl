(() => {
  if (window.__nxtAiCartBridgeLoaded) return;
  window.__nxtAiCartBridgeLoaded = true;

  const handled = new WeakSet();

  function norm(s) {
    return String(s || '').toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  }

  function parseAdded(text) {
    const t = String(text || '');
    if (!/\badded\b/i.test(t) || !/\bcart\b/i.test(t)) return null;
    const strength = (t.match(/\b(\d+(?:\.\d+)?)\s*(mg|mcg|iu)\b/i) || []);
    const clean = t
      .replace(/^(boom[.!]?|nice move[,.]?|got you[,.]?|done[.!]?|perfect[,.]?)/i, '')
      .replace(/\badded\b[\s\S]*$/i, '')
      .replace(/\bto your\b[\s\S]*$/i, '')
      .trim();
    let name = clean.replace(/^[\s:,-]+|[\s:,-]+$/g, '');
    if (!name) {
      const m = t.match(/added\s+(.+?)\s+to\s+(?:your\s+)?cart/i);
      if (m) name = m[1].trim();
    }
    if (!name) return null;
    name = name.replace(/\s*-\s*\d+(?:\.\d+)?\s*(mg|mcg|iu)\b.*$/i, '').trim();
    return { name, strength: strength[1] ? `${strength[1]}${strength[2]}`.toLowerCase() : '' };
  }

  function findAndAdd(action) {
    const name = norm(action.name);
    const strength = norm(action.strength);
    const buttons = [...document.querySelectorAll('.card-atc-btn[id^="atc-btn-"]')];
    let best = null;
    let bestScore = -1;

    for (const btn of buttons) {
      const card = btn.closest('.compound-card, .product-card, .compound-item, article, .card') || btn.parentElement?.parentElement;
      const text = norm(card?.innerText || '');
      if (!text) continue;
      let score = 0;
      const words = name.split(' ').filter(w => w.length > 2);
      const hitCount = words.filter(w => text.includes(w)).length;
      if (words.length && hitCount === words.length) score += 10;
      else if (hitCount) score += hitCount * 2;
      if (strength && text.includes(strength)) score += 8;
      if (score > bestScore) { bestScore = score; best = btn; }
    }

    if (!best || bestScore < 8) return false;
    const productId = best.id.replace(/^atc-btn-/, '');

    if (strength) {
      const select = document.getElementById('atc-select-' + productId);
      if (select) {
        const options = [...select.querySelectorAll('.custom-select-option')];
        const match = options.find(o => norm(o.innerText).includes(strength));
        if (match) {
          const idx = Number(match.dataset.value ?? match.dataset.index ?? options.indexOf(match));
          if (Number.isFinite(idx)) select.dataset.value = String(idx);
          try { match.click(); } catch (_) {}
        }
      }
    }

    if (typeof window.quickAddToCart === 'function') {
      window.quickAddToCart(productId);
    } else {
      best.click();
    }

    try {
      const cartPanel = document.getElementById('cartPanel');
      if (cartPanel && !cartPanel.classList.contains('open') && typeof window.toggleCart === 'function') window.toggleCart(true);
    } catch (_) {}
    return true;
  }

  function processMessage(el) {
    if (!el || handled.has(el) || !el.classList?.contains('assistant')) return;
    const text = el.textContent || '';
    if (/thinking\.\.\./i.test(text)) return;
    const action = parseAdded(text);
    if (!action) { handled.add(el); return; }
    if (findAndAdd(action)) {
      handled.add(el);
      el.dataset.cartVerified = '1';
    }
  }

  function scan() {
    document.querySelectorAll('#aiChatMessages .ai-chat-message.assistant').forEach(processMessage);
  }

  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  scan();
})();
