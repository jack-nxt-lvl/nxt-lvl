(() => {
  const MOONPAY_LTC = 'https://www.moonpay.com/buy/ltc';

  const style = document.createElement('style');
  style.textContent = `
    .nxt-method-shell{border-color:rgba(56,189,248,.24)!important;background:radial-gradient(circle at 10% 0,rgba(247,147,26,.10),transparent 30%),radial-gradient(circle at 90% 8%,rgba(38,161,123,.10),transparent 32%),linear-gradient(180deg,#10141b,#080b10)!important}
    .nxt-security{border-color:rgba(56,189,248,.25)!important;background:linear-gradient(135deg,rgba(14,165,233,.12),rgba(13,18,25,.9))!important}
    .nxt-panel-title{color:#7dd3fc!important}.nxt-row-fast{color:#67e8f9!important}
    .nxt-coin-row[data-nxt-coin="btc"]{border-color:rgba(247,147,26,.38)!important;background:linear-gradient(135deg,rgba(247,147,26,.10),#11151c 38%)!important}
    .nxt-coin-row[data-nxt-coin="eth"]{border-color:rgba(99,102,241,.38)!important;background:linear-gradient(135deg,rgba(99,102,241,.10),#11151c 38%)!important}
    .nxt-coin-row[data-nxt-coin="ltc"]{border-color:rgba(125,211,252,.38)!important;background:linear-gradient(135deg,rgba(56,189,248,.10),#11151c 38%)!important}
    .nxt-coin-row[data-nxt-coin="usdt"]{border-color:rgba(38,161,123,.38)!important;background:linear-gradient(135deg,rgba(38,161,123,.10),#11151c 38%)!important}
    .nxt-ltc{background:linear-gradient(145deg,#7dd3fc,#475569)!important;color:#fff}
    .nxt-moonpay-banner{display:flex;align-items:center;gap:10px;margin:8px 0 12px;padding:11px 13px;border:1px solid rgba(56,189,248,.28);border-radius:11px;background:linear-gradient(135deg,rgba(14,165,233,.13),rgba(15,23,42,.82));color:#e0f2fe;font-size:10px;line-height:1.4}.nxt-moonpay-banner b{color:#fff;font-size:11px}.nxt-moonpay-dot{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#2563eb);display:grid;place-items:center;font-weight:900;color:#fff;flex:0 0 30px}
    .nxt-swaps-featured{border-color:rgba(255,255,255,.12)!important;background:linear-gradient(145deg,#171b22,#101319)!important;box-shadow:none!important;margin-top:13px!important}.nxt-swaps-featured .nxt-swaps-tag{background:rgba(148,163,184,.12)!important;color:#cbd5e1!important}.nxt-swaps-logo{background:linear-gradient(135deg,#64748b,#334155)!important}
    .nxt-swaps-paybox{border-color:rgba(148,163,184,.22)!important;background:linear-gradient(145deg,#151a21,#0d1117)!important}.nxt-swaps-payhead .logo{background:linear-gradient(135deg,#64748b,#334155)!important}
    .nxt-moon-primary{border-color:rgba(56,189,248,.42)!important;background:radial-gradient(circle at 0 0,rgba(14,165,233,.14),transparent 45%),linear-gradient(145deg,#141a22,#0d1117)!important;box-shadow:0 14px 38px rgba(2,132,199,.08)}
    .nxt-payment-link[data-nxt-pay="btc"]{border-color:rgba(247,147,26,.35)!important}.nxt-payment-link[data-nxt-pay="eth"]{border-color:rgba(99,102,241,.35)!important}.nxt-payment-link[data-nxt-pay="ltc"]{border-color:rgba(56,189,248,.35)!important}.nxt-payment-link[data-nxt-pay="usdt"]{border-color:rgba(38,161,123,.35)!important}
  `;
  document.head.appendChild(style);

  function markRows(root){
    root.querySelectorAll('.nxt-coin-row').forEach(row=>{
      const t=(row.textContent||'').toLowerCase();
      if(t.includes('bitcoin')) row.dataset.nxtCoin='btc';
      else if(t.includes('ethereum')) row.dataset.nxtCoin='eth';
      else if(t.includes('litecoin')) row.dataset.nxtCoin='ltc';
      else if(t.includes('tether')) row.dataset.nxtCoin='usdt';
    });
  }

  function upgradeChooser(modal){
    const shell=modal.querySelector('.nxt-method-shell'); if(!shell) return;
    const panel=[...shell.querySelectorAll('.nxt-panel')].find(p=>(p.textContent||'').includes('Buy Crypto Instantly'));
    if(!panel) return;
    markRows(panel);

    if(!panel.querySelector('.nxt-moonpay-banner')){
      const banner=document.createElement('div'); banner.className='nxt-moonpay-banner';
      banner.innerHTML='<span class="nxt-moonpay-dot">M</span><span><b>Recommended: Apple Pay / Card with MoonPay</b><br>Choose a coin below. We’ll create the exact payment first, then you can buy with an eligible card or Apple Pay.</span>';
      const sub=panel.querySelector('.nxt-panel-sub'); (sub||panel.firstElementChild)?.insertAdjacentElement('afterend',banner);
    }

    const nativeLtc=modal.querySelector('[data-crypto="ltc"],[data-crypto="LTC"]');
    if(nativeLtc && !panel.querySelector('[data-nxt-coin="ltc"]')){
      const row=document.createElement('button'); row.type='button'; row.className='nxt-coin-row'; row.dataset.nxtCoin='ltc';
      row.innerHTML='<span class="nxt-coin-icon nxt-ltc">Ł</span><span class="nxt-row-copy"><span class="nxt-row-title">Buy Litecoin (LTC)</span><span class="nxt-row-sub">Apple Pay, Debit/Credit Card</span><span class="nxt-row-fast">Fast • Low-fee option • Easy</span></span><span class="nxt-badges"><span class="nxt-badge apple">Pay</span><span class="nxt-badge">VISA</span><span class="nxt-badge">MC</span></span><span class="nxt-arrow">›</span>';
      row.onclick=()=>nativeLtc.click();
      const usdt=panel.querySelector('[data-nxt-coin="usdt"]'); usdt ? panel.insertBefore(row,usdt) : panel.appendChild(row);
    }

    const swaps=panel.querySelector('.nxt-swaps-featured');
    if(swaps){
      swaps.querySelector('strong') && (swaps.querySelector('strong').textContent='Swaps — alternate Apple Pay / Card option');
      const small=swaps.querySelector('small'); if(small) small.textContent='Use Swaps if you prefer it or if your primary purchase route is unavailable.';
      const tag=swaps.querySelector('.nxt-swaps-tag'); if(tag) tag.textContent='Alternative provider';
      panel.appendChild(swaps);
    }
  }

  function upgradePayment(modal){
    const layout=modal.querySelector('.nxt-payment-layout'); if(!layout) return;
    const panels=[...layout.querySelectorAll(':scope > .nxt-panel')];
    const moon=panels.find(p=>/APPLE PAY|MoonPay/i.test(p.textContent||''));
    const swaps=layout.querySelector('.nxt-swaps-paybox');
    if(moon){
      moon.classList.add('nxt-moon-primary');
      const title=moon.querySelector('.nxt-panel-title'); if(title) title.textContent='⚡ RECOMMENDED — APPLE PAY • DEBIT • CREDIT CARD';
      layout.prepend(moon);
      if(swaps) moon.insertAdjacentElement('afterend',swaps);
      const grid=moon.querySelector('.nxt-payment-grid');
      if(grid && ![...grid.children].some(x=>/Litecoin|LTC/i.test(x.textContent||''))){
        const a=document.createElement('a'); a.className='nxt-payment-link'; a.dataset.nxtPay='ltc'; a.href=MOONPAY_LTC; a.target='_blank'; a.rel='noopener noreferrer';
        a.innerHTML='<span class="nxt-coin-icon nxt-ltc">Ł</span><span><strong>Buy Litecoin (LTC)</strong><small>Apple Pay / Debit / Credit</small></span>';
        grid.appendChild(a);
      }
      [...grid?.children||[]].forEach(x=>{const t=(x.textContent||'').toLowerCase(); if(t.includes('bitcoin'))x.dataset.nxtPay='btc'; else if(t.includes('ethereum'))x.dataset.nxtPay='eth'; else if(t.includes('litecoin'))x.dataset.nxtPay='ltc'; else if(t.includes('tether'))x.dataset.nxtPay='usdt';});
    }
  }

  const run=()=>document.querySelectorAll('body > div').forEach(m=>{upgradeChooser(m);upgradePayment(m);});
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true}); run();
})();
