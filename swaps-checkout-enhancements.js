(() => {
  const SWAPS_BUY_BTC = 'https://www.swaps.app/buy-crypto/buy-btc';

  const style = document.createElement('style');
  style.textContent = `
    .nxt-swaps-featured{width:100%;margin:10px 0 12px;padding:14px;border:1px solid rgba(167,139,250,.5);border-radius:13px;background:linear-gradient(135deg,rgba(91,33,182,.25),rgba(14,14,22,.96));display:flex;align-items:center;gap:12px;color:#fff;cursor:pointer;text-align:left;box-shadow:0 12px 34px rgba(76,29,149,.17)}
    .nxt-swaps-featured:hover{border-color:#b783ff;transform:translateY(-1px)}
    .nxt-swaps-logo{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#9f67ff,#6d28d9);font-weight:900;font-size:18px;flex:0 0 44px}
    .nxt-swaps-copy{min-width:0;flex:1}.nxt-swaps-copy strong{display:block;font-size:13px}.nxt-swaps-copy small{display:block;color:#b7b7c7;font-size:10px;margin-top:3px;line-height:1.4}.nxt-swaps-tag{display:inline-block;margin-top:5px;padding:3px 7px;border-radius:99px;background:rgba(34,197,94,.14);color:#86efac;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.5px}
    .nxt-swaps-arrow{width:30px;height:30px;border-radius:50%;border:1px solid rgba(167,139,250,.45);display:grid;place-items:center;color:#c4b5fd;font-size:18px;flex:0 0 30px}
    .nxt-swaps-paybox{margin-top:14px;padding:16px;border:1px solid rgba(167,139,250,.42);border-radius:14px;background:radial-gradient(circle at 0 0,rgba(124,58,237,.18),transparent 48%),linear-gradient(145deg,#171722,#0e0e16);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:left}
    .nxt-swaps-payhead{display:flex;align-items:center;gap:10px}.nxt-swaps-payhead .logo{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,#9f67ff,#6d28d9);font-weight:900;color:#fff}.nxt-swaps-payhead strong{display:block;color:#fff;font-size:13px}.nxt-swaps-payhead small{display:block;color:#9b9bad;font-size:9px;margin-top:2px}
    .nxt-swaps-steps{margin:12px 0 0;padding:0;list-style:none;counter-reset:swaps}.nxt-swaps-steps li{counter-increment:swaps;display:flex;gap:9px;align-items:flex-start;color:#b8b8c6;font-size:10px;line-height:1.45;margin:8px 0}.nxt-swaps-steps li:before{content:counter(swaps);width:20px;height:20px;flex:0 0 20px;border-radius:50%;display:grid;place-items:center;background:rgba(124,58,237,.2);color:#c4b5fd;font-size:9px;font-weight:900}
    .nxt-swaps-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.nxt-swaps-actions button,.nxt-swaps-actions a{min-height:42px;border-radius:9px;border:1px solid rgba(255,255,255,.1);background:#222231;color:#fff;font:800 10px Inter,sans-serif;display:flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer;padding:9px;text-align:center}.nxt-swaps-actions .primary{border-color:#8b5cf6;background:linear-gradient(135deg,#8b5cf6,#6d28d9)}
    .nxt-swaps-note{margin-top:9px;color:#77778a;font-size:8px;line-height:1.45;text-align:center}
    @media(max-width:620px){.nxt-swaps-actions{grid-template-columns:1fr}.nxt-swaps-featured{align-items:flex-start}.nxt-swaps-arrow{margin-top:7px}}
  `;
  document.head.appendChild(style);

  function copyText(text){
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy')}catch(_){} ta.remove(); return Promise.resolve();
  }

  function findNativeBtc(modal){
    return modal.querySelector('[data-crypto="btc"], [data-crypto="BTC"]');
  }

  function addChooserOption(modal){
    if(modal.dataset.swapsChooser==='1') return;
    const text=modal.textContent||'';
    if(!text.includes('Choose Your Payment Method') && !text.includes('Choose Cryptocurrency')) return;
    const btc=findNativeBtc(modal);
    if(!btc) return;
    const panel=[...modal.querySelectorAll('.nxt-panel')].find(p=>(p.textContent||'').includes('Buy Crypto Instantly'));
    if(!panel) return;
    modal.dataset.swapsChooser='1';
    const btn=document.createElement('button');
    btn.type='button'; btn.className='nxt-swaps-featured';
    btn.innerHTML='<span class="nxt-swaps-logo">S</span><span class="nxt-swaps-copy"><strong>Apple Pay / Card via Swaps</strong><small>Recommended if you do not already own crypto. We will create the BTC payment first, then guide you through buying and sending it.</small><span class="nxt-swaps-tag">Fastest for new crypto users</span></span><span class="nxt-swaps-arrow">›</span>';
    btn.onclick=()=>btc.click();
    const title=panel.querySelector('.nxt-panel-title');
    if(title) title.insertAdjacentElement('afterend',btn); else panel.prepend(btn);
  }

  function paymentDetails(modal){
    const text=modal.textContent||'';
    const m=text.match(/([0-9]+(?:\.[0-9]+)?)\s+(BTC|LTC|ETH|USDTTRC20|USDT)/i);
    const copyBtn=modal.querySelector('#copyCryptoAddress');
    const address=copyBtn?.previousElementSibling?.textContent?.trim()||'';
    if(!m||!address) return null;
    return {amount:m[1],currency:m[2].toUpperCase(),address,copyBtn};
  }

  function addPaymentGuide(modal){
    if(modal.dataset.swapsGuide==='1') return;
    const d=paymentDetails(modal); if(!d||d.currency!=='BTC') return;
    modal.dataset.swapsGuide='1';
    const box=document.createElement('div'); box.className='nxt-swaps-paybox';
    box.innerHTML=`<div class="nxt-swaps-payhead"><span class="logo">S</span><span><strong>New to crypto? Use Apple Pay / Card with Swaps</strong><small>Your BTC payment details are ready. Keep this page open.</small></span></div>
      <ol class="nxt-swaps-steps">
        <li>Tap <b>Copy payment details & open Swaps</b>. Your BTC payment address will be copied automatically.</li>
        <li>On Swaps, buy Bitcoin using Apple Pay or an eligible debit/credit card. Complete any verification Swaps requires.</li>
        <li>Use the copied BTC address as the destination and send the amount shown on this checkout: <b>${d.amount} BTC</b>.</li>
        <li>Return here. You do not need to press anything — this checkout will automatically watch for your payment.</li>
      </ol>
      <div class="nxt-swaps-actions"><button type="button" class="primary" data-swaps-open>Copy payment details & open Swaps</button><button type="button" data-swaps-copy>Copy BTC address</button></div>
      <div class="nxt-swaps-note">Swaps is a third-party crypto purchase provider. Apple Pay/card availability, KYC, fees and timing depend on the customer, device, region and Swaps/provider availability.</div>`;
    box.querySelector('[data-swaps-open]').onclick=async()=>{await copyText(d.address); window.open(SWAPS_BUY_BTC,'_blank','noopener,noreferrer');};
    box.querySelector('[data-swaps-copy]').onclick=async(e)=>{await copyText(d.address); e.currentTarget.textContent='Address copied ✓'; setTimeout(()=>e.currentTarget.textContent='Copy BTC address',1800);};
    const anchor=modal.querySelector('.nxt-payment-layout')||d.copyBtn;
    if(anchor.classList?.contains('nxt-payment-layout')) anchor.prepend(box); else anchor.insertAdjacentElement('afterend',box);
  }

  const observer=new MutationObserver(()=>{
    document.querySelectorAll('body > div').forEach(modal=>{
      addChooserOption(modal);
      addPaymentGuide(modal);
    });
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
