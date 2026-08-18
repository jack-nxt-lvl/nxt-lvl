(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-final-pay{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    .nxt-final-pay .nxt-pay-banner{margin:16px 0 12px;padding:16px 18px;border:1px solid rgba(52,211,153,.34);border-radius:14px;background:linear-gradient(135deg,rgba(16,185,129,.14),rgba(15,23,42,.78));display:flex;align-items:flex-start;gap:12px;color:#d1fae5;font-size:13px;line-height:1.55;box-shadow:0 12px 34px rgba(0,0,0,.18)}
    .nxt-final-pay .nxt-pay-banner b{color:#fff;display:block;font-size:14px;margin-bottom:3px}
    .nxt-final-pay .nxt-pay-guide{margin:0 0 14px;padding:17px;border:1px solid rgba(167,139,250,.28);border-radius:15px;background:linear-gradient(145deg,rgba(24,19,38,.98),rgba(11,12,20,.99));box-shadow:0 18px 50px rgba(0,0,0,.23)}
    .nxt-final-pay .nxt-pay-guide-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}
    .nxt-final-pay .nxt-pay-guide-title strong{font-size:15px;color:#fff}.nxt-final-pay .nxt-pay-guide-title span{font-size:10px;font-weight:900;color:#e9ddff;border:1px solid rgba(167,139,250,.34);border-radius:999px;padding:5px 10px;background:rgba(124,58,237,.16)}
    .nxt-final-pay .nxt-pay-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
    .nxt-final-pay .nxt-pay-step{padding:13px 12px;border:1px solid rgba(255,255,255,.09);border-radius:11px;background:linear-gradient(145deg,#141723,#0f121b);min-height:113px}
    .nxt-final-pay .nxt-pay-step b{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;margin-bottom:8px;background:linear-gradient(135deg,#a66cff,#6d28d9);color:#fff;font-size:11px;box-shadow:0 0 18px rgba(124,58,237,.28)}
    .nxt-final-pay .nxt-pay-step strong{display:block;color:#fff;font-size:11px;margin-bottom:4px}.nxt-final-pay .nxt-pay-step p{margin:0;color:#adb5c2;font-size:9.7px;line-height:1.48}
    .nxt-final-pay .nxt-pay-confidence{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:11px}
    .nxt-final-pay .nxt-confidence-item{padding:10px;border-radius:10px;text-align:center;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.026)}
    .nxt-final-pay .nxt-confidence-item strong{display:block;color:#fff;font-size:10px;margin-bottom:3px}.nxt-final-pay .nxt-confidence-item span{display:block;color:#949dac;font-size:9px;line-height:1.4}
    .nxt-final-pay .nxt-pay-reminder{margin-top:11px;padding:11px 12px;border-radius:10px;border:1px solid rgba(251,191,36,.22);background:rgba(120,53,15,.09);color:#fde68a;font-size:9.5px;line-height:1.5}
    .nxt-final-pay .nxt-highlight-payment{border-color:rgba(167,139,250,.30)!important;box-shadow:0 0 0 1px rgba(124,58,237,.06),0 18px 46px rgba(0,0,0,.19)!important;background:linear-gradient(145deg,rgba(21,21,32,.98),rgba(13,13,21,.99))!important}
    .nxt-final-pay #copyCryptoAmount,.nxt-final-pay #copyCryptoAddress{transition:.18s ease!important}.nxt-final-pay #copyCryptoAmount:hover,.nxt-final-pay #copyCryptoAddress:hover{transform:translateY(-1px)!important;filter:brightness(1.12)}
    .nxt-final-pay .nxt-payment-id-note{margin-top:12px!important;padding:10px 12px!important;border:1px solid rgba(255,255,255,.07)!important;border-radius:9px!important;background:rgba(255,255,255,.025)!important;color:#8f98a7!important}
    @media(max-width:900px){.nxt-final-pay .nxt-pay-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:620px){.nxt-final-pay .nxt-pay-steps,.nxt-final-pay .nxt-pay-confidence{grid-template-columns:1fr}.nxt-final-pay .nxt-pay-step{min-height:0}.nxt-final-pay .nxt-pay-guide-title{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);

  function findRoot(){
    const heading=[...document.querySelectorAll('h1,h2,h3')].find(h=>/complete your payment|crypto payment/i.test(h.textContent||''));
    if(!heading) return null;
    let root=heading.parentElement;
    for(let i=0;i<7 && root?.parentElement;i++){
      const t=root.textContent||'';
      if(/payment address/i.test(t) && /payment id/i.test(t) && [...root.querySelectorAll('button')].some(b=>/copy address/i.test(b.textContent||''))) break;
      root=root.parentElement;
    }
    return root;
  }

  function getCore(root){
    const text=root.textContent||'';
    const m=text.match(/([0-9]+(?:\.[0-9]+)?)\s*(BTC|ETH|LTC|USDT(?:\s*\(TRC20\)|TRC20)?)/i);
    const copyAddress=root.querySelector('#copyCryptoAddress')||[...root.querySelectorAll('button')].find(b=>/copy address/i.test(b.textContent||''));
    if(!m||!copyAddress) return null;
    const copyAmount=root.querySelector('#copyCryptoAmount')||[...root.querySelectorAll('button')].find(b=>/copy amount/i.test(b.textContent||''));
    return {currency:m[2].replace(/\s+/g,' ').toUpperCase(),copyAddress,copyAmount};
  }

  function hideOldConfidence(root){
    const labels=['Secure Payment','Auto Confirmation','Fast Shipping'];
    const hits=[...root.querySelectorAll('div')].filter(d=>labels.some(x=>(d.textContent||'').trim().startsWith(x)));
    if(hits.length>=3){
      let parent=hits[0].parentElement;
      if(parent && hits.every(x=>x.parentElement===parent)) parent.style.display='none';
    }
    [...root.querySelectorAll('div')].forEach(d=>{
      const t=(d.textContent||'').trim();
      if(/Your order will be processed after payment confirmation/i.test(t) && /tracking/i.test(t) && d.children.length<4) d.style.display='none';
    });
  }

  function enhance(root){
    if(!root||root.dataset.nxtFinalPay==='2') return false;
    const core=getCore(root); if(!core) return false;
    root.dataset.nxtFinalPay='2'; root.classList.add('nxt-final-pay');
    hideOldConfidence(root);

    const heading=[...root.querySelectorAll('h1,h2,h3')].find(h=>/complete your payment|crypto payment/i.test(h.textContent||''));
    const headingWrap=heading?.parentElement||heading;

    const banner=document.createElement('div');
    banner.className='nxt-pay-banner';
    banner.innerHTML='<span style="font-size:20px">✓</span><div><b>Your payment is ready to send</b>The amount and receiving address below were created specifically for this order. Follow the four steps and keep this checkout open until the network sees the transaction.</div>';
    headingWrap?.insertAdjacentElement('afterend',banner);

    const guide=document.createElement('div'); guide.className='nxt-pay-guide';
    guide.innerHTML=`<div class="nxt-pay-guide-title"><strong>Complete Payment — 4 Quick Steps</strong><span>${core.currency} PAYMENT</span></div>
      <div class="nxt-pay-steps">
        <div class="nxt-pay-step"><b>1</b><strong>Copy the amount</strong><p>Use Copy Amount so the crypto amount matches this order.</p></div>
        <div class="nxt-pay-step"><b>2</b><strong>Copy the address</strong><p>Use Copy Address and paste it into your wallet or exchange.</p></div>
        <div class="nxt-pay-step"><b>3</b><strong>Send the same coin/network</strong><p>Send only ${core.currency} using the network shown by checkout. Verify the address before sending.</p></div>
        <div class="nxt-pay-step"><b>4</b><strong>Keep checkout open</strong><p>After sending, return here. Confirmation can update after the blockchain and processor detect it.</p></div>
      </div>
      <div class="nxt-pay-confidence">
        <div class="nxt-confidence-item"><strong>Order-specific details</strong><span>This payment address and payment ID are tied to this checkout.</span></div>
        <div class="nxt-confidence-item"><strong>Automatic confirmation</strong><span>No receipt upload is normally needed; status updates after network confirmation.</span></div>
        <div class="nxt-confidence-item"><strong>Processing after confirmation</strong><span>Confirmed orders move into fulfillment and tracking preparation.</span></div>
      </div>
      <div class="nxt-pay-reminder"><strong>Important:</strong> Crypto transfers are generally irreversible. Confirm the coin, network, amount, and receiving address before sending.</div>`;
    banner.insertAdjacentElement('afterend',guide);

    const amountSection=core.copyAmount?.closest('div');
    if(amountSection){amountSection.classList.add('nxt-highlight-payment');amountSection.style.borderRadius='13px';amountSection.style.padding='20px';}
    const addressSection=core.copyAddress?.closest('div')?.parentElement;
    if(addressSection){addressSection.classList.add('nxt-highlight-payment');}

    const pid=[...root.querySelectorAll('div')].find(d=>/^Payment ID\s*:/i.test((d.textContent||'').trim()) && d.children.length===0);
    if(pid) pid.classList.add('nxt-payment-id-note');
    return true;
  }

  function run(){return enhance(findRoot());}
  if(!run()){
    let n=0; const timer=setInterval(()=>{n++; if(run()||n>120) clearInterval(timer);},400);
  }
})();