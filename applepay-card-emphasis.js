(() => {
  if (window.__nxtApplePayCardEmphasisLoaded) return;
  window.__nxtApplePayCardEmphasisLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .nxt-card-pay-hero{margin:10px 0 12px;padding:18px;border:1px solid rgba(147,197,253,.42);border-radius:16px;background:radial-gradient(circle at 100% 0%,rgba(59,130,246,.22),transparent 34%),linear-gradient(135deg,#101827,#171126 58%,#0d0f18);box-shadow:0 16px 40px rgba(37,99,235,.14)}
    .nxt-card-pay-hero .eyebrow{font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#bfdbfe;margin-bottom:6px}.nxt-card-pay-hero h3{margin:0!important;font-size:24px!important;line-height:1.12!important;color:#fff!important}.nxt-card-pay-hero h3 span{color:#c4b5fd}.nxt-card-pay-hero p{margin:8px 0 12px;color:#c4ccda;font-size:11px;line-height:1.5}.nxt-card-pay-hero .logos{display:flex;gap:8px;flex-wrap:wrap}.nxt-card-pay-hero .logo{display:inline-flex;align-items:center;gap:5px;padding:7px 10px;border-radius:8px;background:#fff;color:#0f172a;font-size:10px;font-weight:900;box-shadow:0 4px 14px rgba(0,0,0,.18)}.nxt-card-pay-hero .logo.apple:before{content:'';font-size:13px}
    .nxt-trust-bar{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 12px}.nxt-trust-item{padding:10px 9px;border:1px solid rgba(52,211,153,.18);border-radius:11px;background:rgba(16,185,129,.055);text-align:center}.nxt-trust-item b{display:block;color:#d1fae5;font-size:10px;margin-bottom:2px}.nxt-trust-item span{display:block;color:#8fa39d;font-size:8.5px;line-height:1.35}
    .nxt-how{margin:0 0 14px;padding:14px 15px;border:1px solid rgba(167,139,250,.20);border-radius:13px;background:rgba(124,58,237,.055)}.nxt-how-head{display:flex;align-items:center;gap:7px;color:#fff;font-size:11px;font-weight:900;margin-bottom:10px}.nxt-how-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.nxt-how-step{position:relative;padding:10px 10px 10px 36px;border-radius:9px;background:rgba(255,255,255,.025);color:#aaaabd;font-size:9px;line-height:1.4}.nxt-how-step b{display:block;color:#f4f4f5;font-size:9.5px;margin-bottom:2px}.nxt-how-num{position:absolute;left:9px;top:10px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;font-size:9px;font-weight:900}.nxt-safety-note{margin-top:9px;color:#8f8fa0;font-size:8.5px;line-height:1.45}.nxt-safety-note strong{color:#c4b5fd}
    .nxt-pay-panel.nxt-buy-card-panel{border-color:rgba(147,197,253,.30);box-shadow:0 10px 28px rgba(59,130,246,.08)}.nxt-pay-panel.nxt-buy-card-panel .nxt-panel-title{font-size:14px!important;color:#fff!important;text-transform:none!important;letter-spacing:0!important}.nxt-pay-panel.nxt-buy-card-panel .nxt-panel-sub{font-size:11px!important;color:#c4ccda!important}.nxt-pay-panel.nxt-buy-card-panel .nxt-pay-row{border-color:rgba(147,197,253,.22);background:linear-gradient(145deg,#171c28,#11131c)}.nxt-pay-panel.nxt-buy-card-panel .nxt-row-sub{font-size:11px!important;color:#e5e7eb!important;font-weight:700}.nxt-pay-panel.nxt-buy-card-panel .nxt-row-fast{font-size:10px!important;color:#93c5fd!important}.nxt-pay-panel.nxt-buy-card-panel .nxt-badges .nxt-badge{padding:6px 8px;font-size:10px}
    @media(max-width:650px){.nxt-card-pay-hero h3{font-size:20px!important}.nxt-card-pay-hero .logos{display:grid;grid-template-columns:repeat(3,1fr)}.nxt-card-pay-hero .logo{justify-content:center}.nxt-pay-panel.nxt-buy-card-panel .nxt-badges{display:flex!important;margin-top:8px}.nxt-trust-bar,.nxt-how-steps{grid-template-columns:1fr}.nxt-trust-item{text-align:left}.nxt-how-step{min-height:42px}}
  `;
  document.head.appendChild(style);

  function enhance(){
    const shell=document.querySelector('.nxt-pay-shell'); if(!shell)return false;
    const heading=[...shell.querySelectorAll('h2')].find(h=>/choose your payment method/i.test(h.textContent||''));
    if(!heading||shell.dataset.applePayEmphasis==='2')return false;
    shell.dataset.applePayEmphasis='2';
    shell.querySelectorAll('.nxt-card-pay-hero,.nxt-trust-bar,.nxt-how').forEach(x=>x.remove());

    const hero=document.createElement('div'); hero.className='nxt-card-pay-hero'; hero.innerHTML=`<div class="eyebrow">Fast & secure checkout</div><h3>Pay with <span>Apple Pay, Debit Card, or Credit Card</span></h3><p>No crypto account is required to start. Choose Bitcoin, Ethereum, or USDT below, then complete the purchase with an eligible payment method offered by the third-party purchase provider.</p><div class="logos"><span class="logo apple">Pay</span><span class="logo">VISA</span><span class="logo">Mastercard</span></div>`;
    const total=shell.querySelector('.nxt-order-total-pill'); (total||heading).insertAdjacentElement('afterend',hero);

    const trust=document.createElement('div'); trust.className='nxt-trust-bar'; trust.innerHTML=`<div class="nxt-trust-item"><b>🔒 Secure connection</b><span>Checkout uses an encrypted HTTPS connection</span></div><div class="nxt-trust-item"><b>🛡️ Provider checkout</b><span>Card details are entered with the third-party purchase provider</span></div><div class="nxt-trust-item"><b>✓ Payment confirmation</b><span>Return here to follow payment status</span></div>`; hero.insertAdjacentElement('afterend',trust);

    const how=document.createElement('div'); how.className='nxt-how'; how.innerHTML=`<div class="nxt-how-head">🔐 How secure checkout works</div><div class="nxt-how-steps"><div class="nxt-how-step"><span class="nxt-how-num">1</span><b>Choose a currency</b>Pick BTC, ETH, or USDT below.</div><div class="nxt-how-step"><span class="nxt-how-num">2</span><b>Complete payment</b>Use an eligible Apple Pay, debit, or credit card option offered by the provider.</div><div class="nxt-how-step"><span class="nxt-how-num">3</span><b>Confirm your order</b>Return to checkout and follow the payment confirmation status.</div></div><div class="nxt-safety-note"><strong>Security reminder:</strong> Never send payment to an address received by email, text, or DM. Use only the payment details displayed during this checkout.</div>`; trust.insertAdjacentElement('afterend',how);

    const panels=[...shell.querySelectorAll('.nxt-pay-panel')]; const buyPanel=panels.find(p=>/buy crypto instantly|apple pay \/ card/i.test(p.textContent||''));
    if(buyPanel){buyPanel.classList.add('nxt-buy-card-panel');const title=buyPanel.querySelector('.nxt-panel-title'),sub=buyPanel.querySelector('.nxt-panel-sub');if(title)title.textContent='Apple Pay / Card — Choose Which Crypto to Buy';if(sub)sub.textContent='Choose BTC, ETH, or USDT. The purchase provider will show the eligible Apple Pay or card methods available to you.';buyPanel.querySelectorAll('.nxt-row-fast').forEach(el=>el.textContent='Apple Pay • Debit Card • Credit Card');}
    return true;
  }
  const observer=new MutationObserver(()=>enhance()); observer.observe(document.body,{childList:true,subtree:true}); enhance();
})();
