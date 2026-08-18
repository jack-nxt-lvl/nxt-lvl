(() => {
  if (window.__nxtApplePayCardEmphasisLoaded) return;
  window.__nxtApplePayCardEmphasisLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .nxt-card-pay-hero{margin:10px 0 16px;padding:18px;border:1px solid rgba(147,197,253,.42);border-radius:16px;background:radial-gradient(circle at 100% 0%,rgba(59,130,246,.22),transparent 34%),linear-gradient(135deg,#101827,#171126 58%,#0d0f18);box-shadow:0 16px 40px rgba(37,99,235,.14)}
    .nxt-card-pay-hero .eyebrow{font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#bfdbfe;margin-bottom:6px}
    .nxt-card-pay-hero h3{margin:0!important;font-size:24px!important;line-height:1.12!important;color:#fff!important}
    .nxt-card-pay-hero h3 span{color:#c4b5fd}
    .nxt-card-pay-hero p{margin:8px 0 12px;color:#c4ccda;font-size:11px;line-height:1.5}
    .nxt-card-pay-hero .logos{display:flex;gap:8px;flex-wrap:wrap}
    .nxt-card-pay-hero .logo{display:inline-flex;align-items:center;gap:5px;padding:7px 10px;border-radius:8px;background:#fff;color:#0f172a;font-size:10px;font-weight:900;letter-spacing:0;box-shadow:0 4px 14px rgba(0,0,0,.18)}
    .nxt-card-pay-hero .logo.apple:before{content:'';font-size:13px}
    .nxt-pay-panel.nxt-buy-card-panel{border-color:rgba(147,197,253,.30);box-shadow:0 10px 28px rgba(59,130,246,.08)}
    .nxt-pay-panel.nxt-buy-card-panel .nxt-panel-title{font-size:14px!important;color:#fff!important;text-transform:none!important;letter-spacing:0!important}
    .nxt-pay-panel.nxt-buy-card-panel .nxt-panel-sub{font-size:11px!important;color:#c4ccda!important}
    .nxt-pay-panel.nxt-buy-card-panel .nxt-pay-row{border-color:rgba(147,197,253,.22);background:linear-gradient(145deg,#171c28,#11131c)}
    .nxt-pay-panel.nxt-buy-card-panel .nxt-row-sub{font-size:11px!important;color:#e5e7eb!important;font-weight:700}
    .nxt-pay-panel.nxt-buy-card-panel .nxt-row-fast{font-size:10px!important;color:#93c5fd!important}
    .nxt-pay-panel.nxt-buy-card-panel .nxt-badges .nxt-badge{padding:6px 8px;font-size:10px}
    @media(max-width:650px){.nxt-card-pay-hero h3{font-size:20px!important}.nxt-card-pay-hero .logos{display:grid;grid-template-columns:repeat(3,1fr)}.nxt-card-pay-hero .logo{justify-content:center}.nxt-pay-panel.nxt-buy-card-panel .nxt-badges{display:flex!important;margin-top:8px}}
  `;
  document.head.appendChild(style);

  function enhance() {
    const shell = document.querySelector('.nxt-pay-shell');
    if (!shell) return false;
    const heading = [...shell.querySelectorAll('h2')].find(h => /choose your payment method/i.test(h.textContent || ''));
    if (!heading || shell.dataset.applePayEmphasis === '1') return false;
    shell.dataset.applePayEmphasis = '1';

    const hero = document.createElement('div');
    hero.className = 'nxt-card-pay-hero';
    hero.innerHTML = `
      <div class="eyebrow">Fastest checkout option</div>
      <h3>Pay with <span>Apple Pay, Debit Card, or Credit Card</span></h3>
      <p>You can check out even if you do not already own crypto. Choose Bitcoin, Ethereum, or USDT below, then use Apple Pay or an eligible debit/credit card with the purchase provider.</p>
      <div class="logos"><span class="logo apple">Pay</span><span class="logo">VISA</span><span class="logo">Mastercard</span></div>`;

    const totalPill = shell.querySelector('.nxt-order-total-pill');
    (totalPill || heading).insertAdjacentElement('afterend', hero);

    const panels = [...shell.querySelectorAll('.nxt-pay-panel')];
    const buyPanel = panels.find(p => /buy crypto instantly/i.test(p.textContent || ''));
    if (buyPanel) {
      buyPanel.classList.add('nxt-buy-card-panel');
      const title = buyPanel.querySelector('.nxt-panel-title');
      const sub = buyPanel.querySelector('.nxt-panel-sub');
      if (title) title.textContent = 'Apple Pay / Card — Choose Which Crypto to Buy';
      if (sub) sub.textContent = 'Tap Bitcoin, Ethereum, or USDT. On the next step, use Apple Pay, debit card, or credit card when available.';
      buyPanel.querySelectorAll('.nxt-row-fast').forEach(el => el.textContent = 'Apple Pay • Debit Card • Credit Card');
    }
    return true;
  }

  if (!enhance()) {
    const observer = new MutationObserver(() => enhance());
    observer.observe(document.body, { childList:true, subtree:true });
  }
})();
