(() => {
  if (window.__nxtPaymentHandoffFixLoaded) return;
  window.__nxtPaymentHandoffFixLoaded = true;

  try { sessionStorage.removeItem('nxtMoonpayPaymentV2'); } catch (_) {}
  document.querySelectorAll('.nxt-moon-assist').forEach(el => el.remove());

  const esc = value => String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const style = document.createElement('style');
  style.textContent = `
    .nxt-pay-overlay{position:fixed;inset:0;z-index:1000002;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-pay-shell{width:min(760px,95vw);max-height:94vh;overflow:auto;padding:30px;border-radius:22px;border:1px solid rgba(167,139,250,.32);background:radial-gradient(circle at 92% 0%,rgba(124,58,237,.22),transparent 34%),linear-gradient(155deg,#12121b,#090910);box-shadow:0 36px 110px rgba(0,0,0,.78);color:#fff}
    .nxt-flow-steps{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:24px;color:#77778a;font-size:11px;font-weight:850}.nxt-flow-steps span{display:flex;align-items:center;gap:7px}.nxt-flow-steps b{width:29px;height:29px;border-radius:50%;display:grid;place-items:center;background:#191923;border:1px solid rgba(255,255,255,.13);color:#aaa}.nxt-flow-steps .on{color:#fff}.nxt-flow-steps .on b{background:linear-gradient(135deg,#a855f7,#6d28d9);border-color:#a78bfa;box-shadow:0 0 22px rgba(124,58,237,.34)}.nxt-flow-steps i{width:42px;height:1px;background:rgba(255,255,255,.12)}
    .nxt-pay-kicker{color:#c084fc;font-size:11px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase}.nxt-pay-shell h2{margin:7px 0 4px;font-size:31px;line-height:1.08}.nxt-pay-lead{color:#aaaabd;font-size:12px;margin-bottom:16px}.nxt-order-total-pill{display:inline-flex;margin:2px 0 16px;padding:7px 10px;border-radius:999px;background:rgba(124,58,237,.13);border:1px solid rgba(167,139,250,.22);color:#ddd6fe;font-size:10px;font-weight:850}
    .nxt-secure-strip{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 14px;border:1px solid rgba(52,211,153,.23);border-radius:12px;background:rgba(16,185,129,.07);color:#d7d7e4;font-size:11px;margin-bottom:16px}.nxt-secure-strip strong{color:#fff}.nxt-transak-label{display:inline-flex;margin-left:7px;padding:3px 7px;border:1px solid rgba(96,165,250,.28);border-radius:999px;background:rgba(37,99,235,.14);color:#93c5fd;font-size:8px;font-weight:900;letter-spacing:.5px}
    .nxt-pay-panel{padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:linear-gradient(145deg,#15151f,#0e0e15);margin-top:12px}.nxt-panel-title{color:#c084fc;font-size:12px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;margin-bottom:3px}.nxt-panel-sub{color:#8e8ea0;font-size:10px;line-height:1.45;margin-bottom:11px}.nxt-pay-row{width:100%;min-height:76px;display:flex;align-items:center;gap:12px;padding:12px 13px;margin-top:8px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:linear-gradient(145deg,#1a1a25,#101017);color:#fff;text-align:left;cursor:pointer;transition:.18s ease}.nxt-pay-row:hover{border-color:rgba(167,139,250,.55);transform:translateY(-1px);box-shadow:0 12px 28px rgba(0,0,0,.25)}.nxt-coin{width:44px;height:44px;flex:0 0 44px;border-radius:50%;display:grid;place-items:center;font-size:21px;font-weight:900}.btc{background:#f7931a}.eth{background:linear-gradient(145deg,#697dff,#4155cc)}.usdt{background:#26a17b}.nxt-row-copy{min-width:0;flex:1}.nxt-row-title{display:block;font-size:13px;font-weight:850}.nxt-row-sub{display:block;color:#a1a1b2;font-size:10px;margin-top:3px}.nxt-row-fast{display:block;color:#6ee7b7;font-size:9px;font-weight:850;margin-top:3px}.nxt-arrow{width:28px;height:28px;border-radius:50%;border:1px solid rgba(167,139,250,.38);display:grid;place-items:center;color:#c084fc;font-size:18px}
    .nxt-pay-footer{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}.nxt-back,.nxt-cancel-pay{min-height:46px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#242431;color:#aaa;font-weight:850;cursor:pointer}.nxt-loading{text-align:center;padding:48px 12px}.nxt-spinner{width:44px;height:44px;margin:0 auto 16px;border-radius:50%;border:3px solid rgba(255,255,255,.12);border-top-color:#a78bfa;animation:nxtSpin .8s linear infinite}@keyframes nxtSpin{to{transform:rotate(360deg)}}
    .nxt-transak-frame-wrap{height:min(760px,78vh);margin-top:14px;border:1px solid rgba(167,139,250,.22);border-radius:16px;overflow:hidden;background:#fff}.nxt-transak-frame{display:block;width:100%;height:100%;border:0;background:#fff}.nxt-transak-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.nxt-close-transak{padding:9px 12px;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:#242431;color:#ddd;font-weight:800;cursor:pointer}.nxt-error-box{padding:18px;border:1px solid rgba(239,68,68,.28);border-radius:12px;background:rgba(127,29,29,.10);color:#fecaca;margin-top:14px;font-size:11px;line-height:1.5}
    @media(max-width:650px){.nxt-pay-shell{padding:21px 16px}.nxt-pay-shell h2{font-size:25px}.nxt-flow-steps{font-size:9px;gap:6px}.nxt-flow-steps i{width:20px}.nxt-pay-footer{grid-template-columns:1fr}.nxt-transak-frame-wrap{height:74vh}}
  `;
  document.head.appendChild(style);

  function items(){ try{return Array.isArray(cart)?cart:[]}catch(_){return[]} }
  function subtotal(){ return items().reduce((s,i)=>s+(Number(i.price)||0)*(Number(i.qty)||0),0); }
  function steps(stage){ return `<div class="nxt-flow-steps"><span class="on"><b>1</b>Information</span><i></i><span class="${stage>=2?'on':''}"><b>2</b>Payment</span><i></i><span class="${stage>=3?'on':''}"><b>3</b>Confirmation</span></div>`; }
  function createOverlay(){ const o=document.createElement('div');o.className='nxt-pay-overlay';o.innerHTML='<div class="nxt-pay-shell"></div>';document.body.appendChild(o);return o; }
  function row(icon, cls, title, sub, crypto, fast){return `<button class="nxt-pay-row" type="button" data-transak-crypto="${crypto}"><span class="nxt-coin ${cls}">${icon}</span><span class="nxt-row-copy"><span class="nxt-row-title">${title}</span><span class="nxt-row-sub">${sub}</span><span class="nxt-row-fast">${fast}</span></span><span class="nxt-arrow">›</span></button>`;}

  function paymentMethods(overlay, details){
    const shell=overlay.querySelector('.nxt-pay-shell');
    shell.innerHTML=`${steps(2)}<div class="nxt-pay-kicker">Secure Checkout</div><h2>Choose Your Crypto <span class="nxt-transak-label">TRANSAK</span></h2><div class="nxt-pay-lead">Pay with an eligible Apple Pay, debit card, or credit card option directly through Transak.</div><div class="nxt-order-total-pill">Order total: $${Number(details.total).toFixed(2)}</div><div class="nxt-secure-strip">🔒 <strong>Transak secure checkout</strong> — your wallet destination is pre-filled.</div><div class="nxt-pay-panel"><div class="nxt-panel-title">Apple Pay / Card</div><div class="nxt-panel-sub">Choose BTC, ETH, or USDT. No MoonPay handoff and no separate payment provider page.</div>${row('₿','btc','Bitcoin (BTC)','Bitcoin network','BTC','Apple Pay • Debit/Credit Card')}${row('♦','eth','Ethereum (ETH)','Ethereum network','ETH','Apple Pay • Debit/Credit Card')}${row('₮','usdt','Tether (USDT)','Ethereum ERC-20','USDT','Apple Pay • Debit/Credit Card')}</div><div class="nxt-pay-footer"><button class="nxt-back" type="button">Back</button><button class="nxt-cancel-pay" type="button">Cancel Checkout</button></div>`;
    shell.querySelectorAll('[data-transak-crypto]').forEach(btn=>btn.onclick=()=>openTransak(overlay,details,btn.dataset.transakCrypto));
    shell.querySelector('.nxt-back').onclick=()=>{overlay.remove();try{window.proceedToCheckout()}catch(_){}};
    shell.querySelector('.nxt-cancel-pay').onclick=()=>overlay.remove();
  }

  async function openTransak(overlay,details,crypto){
    const shell=overlay.querySelector('.nxt-pay-shell');
    shell.innerHTML=`${steps(2)}<div class="nxt-loading"><div class="nxt-spinner"></div><h2>Opening Transak</h2><div class="nxt-pay-lead">Preparing ${esc(crypto)} Apple Pay and card options…</div></div>`;
    try{
      const res=await fetch('/api/create-transak-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:Number(details.total),crypto,orderId:'NXT-'+Date.now(),email:details.customer?.email||''})});
      let data={};try{data=await res.json()}catch(_){}
      if(!res.ok||!data.widgetUrl) throw new Error(data.error||'Unable to start Transak checkout.');
      shell.innerHTML=`${steps(2)}<div class="nxt-transak-top"><div><div class="nxt-pay-kicker">Transak Checkout</div><h2 style="font-size:24px;margin-bottom:0">Buy ${esc(data.crypto||crypto)}</h2></div><button class="nxt-close-transak" type="button">Back</button></div><div class="nxt-secure-strip">🔒 Secure provider checkout • ${esc(data.network||'')} • Order $${Number(details.total).toFixed(2)}</div><div class="nxt-transak-frame-wrap"><iframe class="nxt-transak-frame" title="Transak secure checkout" src="${esc(data.widgetUrl)}" allow="camera; microphone; payment; clipboard-write" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
      shell.querySelector('.nxt-close-transak').onclick=()=>paymentMethods(overlay,details);
    }catch(err){
      shell.innerHTML=`${steps(2)}<div class="nxt-pay-kicker">Transak Checkout</div><h2>Checkout couldn't open</h2><div class="nxt-error-box">${esc(err.message||'Please try again.')}</div><div class="nxt-pay-footer"><button class="nxt-back" type="button">Back to Payment Methods</button><button class="nxt-cancel-pay" type="button">Close</button></div>`;
      shell.querySelector('.nxt-back').onclick=()=>paymentMethods(overlay,details);shell.querySelector('.nxt-cancel-pay').onclick=()=>overlay.remove();
    }
  }

  function readDetails(overlay){
    const val=s=>(overlay.querySelector(s)?.value||'').trim();const pickup=overlay.querySelector('.nxt-fulfillment[data-mode="pickup"]')?.classList.contains('active');const fulfillment=pickup?'pickup':'shipping';
    const customer={name:val('#nxtName'),email:val('#nxtEmail'),phone:val('#nxtPhone'),address:val('#nxtAddress'),unit:val('#nxtUnit'),city:val('#nxtCity'),state:val('#nxtState'),zip:val('#nxtZip')};
    const required=[customer.name,customer.email,customer.phone];if(fulfillment==='shipping')required.push(customer.address,customer.city,customer.state,customer.zip);const err=overlay.querySelector('.nxt-checkout-error');
    if(required.some(v=>!v)){if(err){err.textContent=fulfillment==='shipping'?'Please complete your contact and shipping information.':'Please enter your name, email and phone number.';err.classList.add('show')}return null}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)){if(err){err.textContent='Please enter a valid email address.';err.classList.add('show')}return null}
    if(fulfillment==='pickup')Object.assign(customer,{address:'LOCAL PICKUP',unit:'',city:'',state:'',zip:''});const shipping=fulfillment==='pickup'?0:10;return{fulfillment,shipping,total:subtotal()+shipping,customer};
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('.nxt-checkout-continue');if(!button)return;const infoOverlay=button.closest('.nxt-checkout-overlay');if(!infoOverlay)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();const details=readDetails(infoOverlay);if(!details)return;
    window.nxtCheckoutDetails=details;fetch('/api/checkout-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer:{...details.customer,fulfillment:details.fulfillment},items:items(),amount:details.total,fulfillment:details.fulfillment,shipping:details.shipping})}).catch(()=>{});
    infoOverlay.remove();const payOverlay=createOverlay();paymentMethods(payOverlay,details);
  },true);
})();