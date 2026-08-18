(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-coin-row[data-nxt-coin="usdt"],
    .nxt-payment-link[data-nxt-pay="usdt"]{
      border-color:rgba(38,161,123,.75)!important;
      background:radial-gradient(circle at 0 0,rgba(38,161,123,.20),transparent 48%),linear-gradient(145deg,#13211d,#0d1513)!important;
      box-shadow:0 12px 34px rgba(38,161,123,.12)!important;
    }
    .nxt-usdt-rec{
      display:inline-flex;align-items:center;gap:5px;margin-left:7px;padding:3px 7px;
      border-radius:999px;background:rgba(38,161,123,.18);color:#86efac;
      border:1px solid rgba(38,161,123,.35);font-size:8px;font-weight:900;
      letter-spacing:.45px;text-transform:uppercase;vertical-align:middle;
    }
    .nxt-usdt-callout{
      display:flex;align-items:center;gap:10px;margin:8px 0 12px;padding:11px 13px;
      border:1px solid rgba(38,161,123,.38);border-radius:11px;
      background:linear-gradient(135deg,rgba(38,161,123,.14),rgba(12,24,20,.88));
      color:#d1fae5;font-size:10px;line-height:1.4;
    }
    .nxt-usdt-callout b{color:#fff;font-size:11px}
    .nxt-usdt-callout-icon{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#26a17b;color:#fff;font-weight:900;flex:0 0 30px}
  `;
  document.head.appendChild(style);

  function markAndReorderChooser(modal){
    const panel=[...modal.querySelectorAll('.nxt-panel')].find(p=>(p.textContent||'').includes('Buy Crypto Instantly'));
    if(!panel) return;
    panel.querySelectorAll('.nxt-coin-row').forEach(row=>{
      const t=(row.textContent||'').toLowerCase();
      if(t.includes('bitcoin')) row.dataset.nxtCoin='btc';
      else if(t.includes('ethereum')) row.dataset.nxtCoin='eth';
      else if(t.includes('litecoin')) row.dataset.nxtCoin='ltc';
      else if(t.includes('tether') || t.includes('usdt')) row.dataset.nxtCoin='usdt';
    });
    const usdt=panel.querySelector('[data-nxt-coin="usdt"]');
    if(!usdt) return;

    const title=usdt.querySelector('.nxt-row-title');
    if(title && !title.querySelector('.nxt-usdt-rec')){
      const badge=document.createElement('span'); badge.className='nxt-usdt-rec'; badge.textContent='Recommended'; title.appendChild(badge);
    }
    const fast=usdt.querySelector('.nxt-row-fast');
    if(fast) fast.textContent='Recommended • Stable-value option • Easy';

    const banner=panel.querySelector('.nxt-moonpay-banner');
    if(banner){
      const b=banner.querySelector('b'); if(b) b.textContent='Recommended route: MoonPay — use USDT';
      const span=banner.querySelector('span:last-child');
      if(span) span.innerHTML='<b>Recommended route: MoonPay — use USDT</b><br>USDT is pre-highlighted for a clear, stable-value checkout. Bitcoin, Ethereum and Litecoin remain available.';
    }

    if(!panel.querySelector('.nxt-usdt-callout')){
      const c=document.createElement('div'); c.className='nxt-usdt-callout';
      c.innerHTML='<span class="nxt-usdt-callout-icon">₮</span><span><b>USDT recommended</b><br>Choose Tether (USDT) for the simplest dollar-value comparison. Always send on the exact network shown by checkout.</span>';
      const bannerEl=panel.querySelector('.nxt-moonpay-banner');
      if(bannerEl) bannerEl.insertAdjacentElement('afterend',c);
    }

    const firstCoin=panel.querySelector('.nxt-coin-row');
    if(firstCoin && firstCoin!==usdt) panel.insertBefore(usdt, firstCoin);
  }

  function reorderPayment(modal){
    const moon=[...modal.querySelectorAll('.nxt-panel')].find(p=>/MoonPay|APPLE PAY/i.test(p.textContent||''));
    if(!moon) return;
    const grid=moon.querySelector('.nxt-payment-grid'); if(!grid) return;
    [...grid.children].forEach(x=>{
      const t=(x.textContent||'').toLowerCase();
      if(t.includes('bitcoin'))x.dataset.nxtPay='btc';
      else if(t.includes('ethereum'))x.dataset.nxtPay='eth';
      else if(t.includes('litecoin'))x.dataset.nxtPay='ltc';
      else if(t.includes('tether')||t.includes('usdt'))x.dataset.nxtPay='usdt';
    });
    const usdt=grid.querySelector('[data-nxt-pay="usdt"]');
    if(usdt){
      const strong=usdt.querySelector('strong');
      if(strong && !strong.querySelector('.nxt-usdt-rec')){
        strong.insertAdjacentHTML('beforeend',' <span class="nxt-usdt-rec">Recommended</span>');
      }
      grid.prepend(usdt);
    }
    const title=moon.querySelector('.nxt-panel-title');
    if(title) title.textContent='⚡ MOONPAY — RECOMMENDED: USDT • APPLE PAY • DEBIT • CREDIT';
  }

  const run=()=>document.querySelectorAll('body > div').forEach(m=>{markAndReorderChooser(m);reorderPayment(m);});
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
  run();
})();