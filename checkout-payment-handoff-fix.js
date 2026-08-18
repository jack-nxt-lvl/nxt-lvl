(() => {
  if (window.__nxtPaymentHandoffFixLoaded) return;
  window.__nxtPaymentHandoffFixLoaded = true;

  const MOONPAY = { btc:'https://www.moonpay.com/buy/btc', eth:'https://www.moonpay.com/buy/eth', usdttrc20:'https://www.moonpay.com/buy/usdt' };
  const COINBASE = 'https://www.coinbase.com/';
  const CASHAPP = 'https://cash.app/bitcoin';
  const esc = value => String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

  const style = document.createElement('style');
  style.textContent = `
    .nxt-pay-overlay{position:fixed;inset:0;z-index:1000002;background:rgba(0,0,0,.86);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-pay-shell{width:min(780px,95vw);max-height:94vh;overflow:auto;padding:30px;border-radius:22px;border:1px solid rgba(167,139,250,.30);background:radial-gradient(circle at 92% 0%,rgba(124,58,237,.20),transparent 32%),linear-gradient(155deg,#12121b,#090910);box-shadow:0 36px 110px rgba(0,0,0,.76);color:#fff}
    .nxt-flow-steps{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:24px;color:#77778a;font-size:11px;font-weight:850}.nxt-flow-steps span{display:flex;align-items:center;gap:7px}.nxt-flow-steps b{width:29px;height:29px;border-radius:50%;display:grid;place-items:center;background:#191923;border:1px solid rgba(255,255,255,.13);color:#aaa}.nxt-flow-steps .on{color:#fff}.nxt-flow-steps .on b{background:linear-gradient(135deg,#a855f7,#6d28d9);border-color:#a78bfa;box-shadow:0 0 22px rgba(124,58,237,.34)}.nxt-flow-steps i{width:42px;height:1px;background:rgba(255,255,255,.12)}
    .nxt-pay-kicker{color:#c084fc;font-size:11px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase}.nxt-pay-shell h2{margin:7px 0 4px;font-size:31px;line-height:1.08}.nxt-pay-lead{color:#aaaabd;font-size:12px;margin-bottom:16px}.nxt-order-total-pill{display:inline-flex;margin:2px 0 16px;padding:7px 10px;border-radius:999px;background:rgba(124,58,237,.13);border:1px solid rgba(167,139,250,.22);color:#ddd6fe;font-size:10px;font-weight:850}
    .nxt-secure-strip{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 14px;border:1px solid rgba(167,139,250,.24);border-radius:12px;background:rgba(124,58,237,.07);color:#d7d7e4;font-size:11px;margin-bottom:16px}.nxt-secure-strip strong{color:#fff}
    .nxt-pay-panel{padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:linear-gradient(145deg,#15151f,#0e0e15);margin-top:12px}.nxt-panel-title{color:#c084fc;font-size:12px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;margin-bottom:3px}.nxt-panel-sub{color:#8e8ea0;font-size:10px;line-height:1.45;margin-bottom:11px}
    .nxt-pay-row{width:100%;min-height:72px;display:flex;align-items:center;gap:12px;padding:11px 13px;margin-top:8px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:linear-gradient(145deg,#1a1a25,#101017);color:#fff;text-align:left;text-decoration:none;cursor:pointer;transition:.18s ease}.nxt-pay-row:hover{border-color:rgba(167,139,250,.50);transform:translateY(-1px);box-shadow:0 12px 28px rgba(0,0,0,.25)}
    .nxt-coin{width:44px;height:44px;flex:0 0 44px;border-radius:50%;display:grid;place-items:center;font-size:21px;font-weight:900}.btc{background:#f7931a}.eth{background:linear-gradient(145deg,#697dff,#4155cc)}.usdt{background:#26a17b}.ltc{background:#64748b}.cash{background:#00d64f;border-radius:11px}.wallet{background:linear-gradient(145deg,#8b5cf6,#5b21b6);border-radius:11px}.coinbase{background:#1652f0;border-radius:11px}
    .nxt-row-copy{min-width:0;flex:1}.nxt-row-title{display:block;font-size:13px;font-weight:850}.nxt-row-sub{display:block;color:#a1a1b2;font-size:10px;margin-top:3px;line-height:1.35}.nxt-row-fast{display:block;color:#c084fc;font-size:9px;font-weight:850;margin-top:3px}.nxt-badges{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.nxt-badge{padding:5px 7px;background:#fff;color:#111;border-radius:6px;font-size:9px;font-weight:900}.nxt-arrow{width:28px;height:28px;border-radius:50%;border:1px solid rgba(167,139,250,.38);display:grid;place-items:center;color:#c084fc;font-size:18px}
    .nxt-network{display:none;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:9px}.nxt-network.show{display:grid}.nxt-network button{min-height:40px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:#1d1d29;color:#fff;font-weight:800;cursor:pointer}.nxt-network button:hover{border-color:#8b5cf6;background:rgba(124,58,237,.14)}
    .nxt-pay-footer{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}.nxt-back,.nxt-cancel-pay{min-height:46px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#242431;color:#aaa;font-weight:850;cursor:pointer}
    .nxt-loading{text-align:center;padding:42px 12px}.nxt-spinner{width:42px;height:42px;margin:0 auto 16px;border-radius:50%;border:3px solid rgba(255,255,255,.12);border-top-color:#a78bfa;animation:nxtSpin .8s linear infinite}@keyframes nxtSpin{to{transform:rotate(360deg)}}
    .nxt-confirm-box{padding:18px;border:1px solid rgba(52,211,153,.28);border-radius:14px;background:rgba(16,185,129,.07);margin:14px 0}.nxt-confirm-head{display:flex;align-items:center;gap:10px}.nxt-status-dot{width:12px;height:12px;border-radius:50%;background:#a78bfa;box-shadow:0 0 0 6px rgba(139,92,246,.12),0 0 20px rgba(139,92,246,.48);animation:nxtPulse 1.4s ease-in-out infinite}.nxt-confirm-box.success{border-color:rgba(52,211,153,.45);background:rgba(16,185,129,.12)}.nxt-confirm-box.success .nxt-status-dot{background:#22c55e;animation:none}.nxt-confirm-box.warning .nxt-status-dot{background:#f59e0b}.nxt-confirm-box.error .nxt-status-dot{background:#ef4444;animation:none}@keyframes nxtPulse{50%{opacity:.55;transform:scale(.9)}}
    .nxt-payment-card{padding:18px;border:1px solid rgba(167,139,250,.23);border-radius:14px;background:#11111a;margin-top:12px}.nxt-pay-amount{font-size:25px;font-weight:900;color:#c4b5fd;margin:5px 0 15px}.nxt-address{padding:13px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#1b1b25;word-break:break-all;font-size:12px;color:#f4f4f5}.nxt-copy-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.nxt-copy-grid button,.nxt-check-now{min-height:44px;border:0;border-radius:9px;background:linear-gradient(100deg,#7c3aed,#9f55ff);color:#fff;font-weight:850;cursor:pointer}.nxt-check-now{padding:0 14px;background:#252531;border:1px solid rgba(255,255,255,.10)}
    .nxt-status-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:13px}.nxt-status-step{padding:10px;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(255,255,255,.025);color:#9292a4;font-size:9px;line-height:1.35}.nxt-status-step b{display:block;color:#c4b5fd;font-size:9.5px;margin-bottom:2px}.nxt-status-step.done{border-color:rgba(52,211,153,.22);background:rgba(16,185,129,.06)}.nxt-status-step.done b{color:#6ee7b7}.nxt-confirm-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.nxt-confirm-actions button{min-height:46px;border-radius:10px;font-weight:850;cursor:pointer}.nxt-done{border:0;background:linear-gradient(100deg,#7c3aed,#9f55ff);color:#fff}.nxt-back-methods{border:1px solid rgba(255,255,255,.09);background:#242431;color:#bbb}
    @media(max-width:650px){.nxt-pay-shell{padding:21px 16px}.nxt-pay-shell h2{font-size:25px}.nxt-flow-steps{font-size:9px;gap:6px}.nxt-flow-steps i{width:20px}.nxt-badges{display:none}.nxt-network,.nxt-status-steps,.nxt-copy-grid,.nxt-confirm-actions,.nxt-pay-footer{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function items(){ try{return Array.isArray(cart)?cart:[]}catch(_){return[]} }
  function subtotal(){ return items().reduce((s,i)=>s+(Number(i.price)||0)*(Number(i.qty)||0),0); }
  function steps(stage){ return `<div class="nxt-flow-steps"><span class="on"><b>1</b>Information</span><i></i><span class="${stage>=2?'on':''}"><b>2</b>Payment</span><i></i><span class="${stage>=3?'on':''}"><b>3</b>Confirmation</span></div>`; }
  function createOverlay(){ const o=document.createElement('div');o.className='nxt-pay-overlay';o.innerHTML='<div class="nxt-pay-shell"></div>';document.body.appendChild(o);return o; }
  function row(icon, cls, title, sub, code, fast=''){ return `<button class="nxt-pay-row" type="button" data-pay-code="${code}"><span class="nxt-coin ${cls}">${icon}</span><span class="nxt-row-copy"><span class="nxt-row-title">${title}</span><span class="nxt-row-sub">${sub}</span>${fast?`<span class="nxt-row-fast">${fast}</span>`:''}</span><span class="nxt-arrow">›</span></button>`; }
  function buyRow(icon,cls,title,sub,url){return `<a class="nxt-pay-row" target="_blank" rel="noopener noreferrer" href="${url}"><span class="nxt-coin ${cls}">${icon}</span><span class="nxt-row-copy"><span class="nxt-row-title">${title}</span><span class="nxt-row-sub">${sub}</span><span class="nxt-row-fast">Fast • Secure • Easy</span></span><span class="nxt-badges"><span class="nxt-badge"> Pay</span><span class="nxt-badge">VISA</span><span class="nxt-badge">MC</span></span><span class="nxt-arrow">›</span></a>`;}

  function paymentMethods(overlay, details){
    const shell=overlay.querySelector('.nxt-pay-shell');
    shell.innerHTML=`${steps(2)}<div class="nxt-pay-kicker">Crypto Checkout</div><h2>Choose Your Payment Method</h2><div class="nxt-pay-lead">Select the fastest and easiest way to pay.</div><div class="nxt-order-total-pill">Order total: $${Number(details.total).toFixed(2)}</div><div class="nxt-secure-strip">🛡️ <strong>Secure Checkout</strong> — choose a payment route below.</div>
      <div class="nxt-pay-panel"><div class="nxt-panel-title">⚡ Buy Crypto Instantly</div><div class="nxt-panel-sub">Choose the crypto you want to use. Apple Pay, debit and credit card options are available through the purchase provider on the next step.</div>${buyRow('₿','btc','Buy Bitcoin (BTC)','Apple Pay, Debit/Credit Card',MOONPAY.btc)}${buyRow('♦','eth','Buy Ethereum (ETH)','Apple Pay, Debit/Credit Card',MOONPAY.eth)}${buyRow('₮','usdt','Buy Tether (USDT)','Apple Pay, Debit/Credit Card',MOONPAY.usdttrc20)}</div>
      <div class="nxt-pay-panel"><div class="nxt-panel-title">▣ Other Payment Options</div><div class="nxt-panel-sub">Pay from Cash App, Coinbase, or your own private wallet.</div>${row('$','cash','Cash App','Pay with Bitcoin using Cash App','btc')}${row('▣','wallet','Pay with Crypto Wallet','Send from your private wallet','network')}${row('C','coinbase','Open Coinbase','Choose a network, then use Coinbase to send','coinbase')}<div class="nxt-network" id="nxtNetwork"><button data-direct="btc">BTC</button><button data-direct="eth">ETH</button><button data-direct="ltc">LTC</button><button data-direct="usdttrc20">USDT</button></div></div>
      <div class="nxt-pay-footer"><button class="nxt-back" type="button">Back</button><button class="nxt-cancel-pay" type="button">Cancel Checkout</button></div>`;

    shell.querySelectorAll('[data-pay-code]').forEach(btn=>btn.onclick=()=>{
      const code=btn.dataset.payCode;
      if(code==='network'){shell.querySelector('#nxtNetwork').classList.toggle('show');return;}
      if(code==='coinbase'){window.open(COINBASE,'_blank','noopener,noreferrer');shell.querySelector('#nxtNetwork').classList.add('show');return;}
      createPayment(overlay,details,code);
    });
    shell.querySelectorAll('[data-direct]').forEach(btn=>btn.onclick=()=>createPayment(overlay,details,btn.dataset.direct));
    shell.querySelector('.nxt-back').onclick=()=>{overlay.remove();try{window.proceedToCheckout()}catch(_){}};
    shell.querySelector('.nxt-cancel-pay').onclick=()=>overlay.remove();
  }

  async function createPayment(overlay,details,payCurrency){
    const shell=overlay.querySelector('.nxt-pay-shell');
    shell.innerHTML=`${steps(2)}<div class="nxt-loading"><div class="nxt-spinner"></div><h2>Creating Your Payment</h2><div class="nxt-pay-lead">Please keep this page open.</div></div>`;
    try{
      const res=await fetch('/api/create-nowpayment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:Number(details.total),payCurrency,orderId:'NXT-'+Date.now(),customer:details.customer||{},items:items()})});
      let data={};try{data=await res.json()}catch(_){}
      if(!res.ok||!data.pay_address||!data.pay_amount) throw new Error(data.message||data.error||'Unable to create payment');
      confirmation(overlay,details,data);
    }catch(err){
      shell.innerHTML=`${steps(2)}<div class="nxt-pay-kicker">Payment Setup</div><h2>We couldn’t create that payment</h2><div class="nxt-pay-lead">${esc(err.message||'Please try again.')}</div><div class="nxt-confirm-actions"><button class="nxt-back-methods" type="button">Back to Payment Methods</button><button class="nxt-done" type="button">Close</button></div>`;
      shell.querySelector('.nxt-back-methods').onclick=()=>paymentMethods(overlay,details);shell.querySelector('.nxt-done').onclick=()=>overlay.remove();
    }
  }

  function confirmation(overlay,details,data){
    const shell=overlay.querySelector('.nxt-pay-shell');
    const currency=String(data.pay_currency||'').toUpperCase();
    shell.innerHTML=`${steps(3)}<div class="nxt-pay-kicker">Payment & Confirmation</div><h2>Complete Your Payment</h2><div class="nxt-pay-lead">Send the exact amount below. This screen will automatically check for payment confirmation.</div>
      <div class="nxt-confirm-box" id="nxtConfirmBox"><div class="nxt-confirm-head"><span class="nxt-status-dot"></span><div style="flex:1"><strong id="nxtStatusTitle">Waiting for your payment</strong><div id="nxtStatusText" style="color:#aaaabd;font-size:10.5px;margin-top:3px;line-height:1.45">After you send, we’ll detect the transaction and update this order automatically.</div></div><button class="nxt-check-now" type="button">Check now</button></div><div class="nxt-status-steps"><div class="nxt-status-step done" id="nxtS1"><b>1. Payment created ✓</b>Payment details are ready.</div><div class="nxt-status-step" id="nxtS2"><b>2. Payment detected</b>Waiting for the blockchain transaction.</div><div class="nxt-status-step" id="nxtS3"><b>3. Order confirmed</b>Confirmation will appear here.</div></div></div>
      <div class="nxt-payment-card"><div style="color:#9999aa;font-size:10px">Send exactly</div><div class="nxt-pay-amount">${esc(data.pay_amount)} ${esc(currency)}</div><div style="color:#9999aa;font-size:10px;margin-bottom:6px">Payment address</div><div class="nxt-address" id="nxtPayAddress">${esc(data.pay_address)}</div><div class="nxt-copy-grid"><button type="button" id="nxtCopyAmount">Copy Amount</button><button type="button" id="nxtCopyAddress">Copy Address</button></div><div style="margin-top:12px;color:#777;font-size:9.5px">Payment ID: ${esc(data.payment_id||'')}</div></div>
      <div class="nxt-confirm-actions"><button class="nxt-back-methods" type="button">Back to Payment Methods</button><button class="nxt-done" type="button">Done</button></div>`;

    const copy=(text,btn)=>navigator.clipboard?.writeText(String(text)).then(()=>{btn.textContent='Copied ✓'}).catch(()=>{});
    shell.querySelector('#nxtCopyAmount').onclick=e=>copy(data.pay_amount,e.currentTarget);
    shell.querySelector('#nxtCopyAddress').onclick=e=>copy(data.pay_address,e.currentTarget);
    shell.querySelector('.nxt-back-methods').onclick=()=>paymentMethods(overlay,details);
    shell.querySelector('.nxt-done').onclick=()=>overlay.remove();

    const box=shell.querySelector('#nxtConfirmBox'), title=shell.querySelector('#nxtStatusTitle'), text=shell.querySelector('#nxtStatusText'), s2=shell.querySelector('#nxtS2'), s3=shell.querySelector('#nxtS3');
    let stopped=false;
    async function check(){
      if(stopped||!document.body.contains(overlay)||!data.payment_id)return;
      const btn=shell.querySelector('.nxt-check-now');if(btn)btn.textContent='Checking…';
      try{
        const r=await fetch('/api/payment-status?payment_id='+encodeURIComponent(data.payment_id),{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error('status');
        const status=String(d.payment_status||'waiting').toLowerCase();const paid=Number(d.actually_paid||0);
        box.classList.remove('success','warning','error');
        if(['finished','confirmed','sending'].includes(status)){
          box.classList.add('success');title.textContent='✓ Payment Confirmed — Order Received';text.textContent='Payment is confirmed. Your order is now in processing.';s2.classList.add('done');s3.classList.add('done');s2.innerHTML='<b>2. Payment detected ✓</b>Your transaction was received.';s3.innerHTML='<b>3. Order confirmed ✓</b>Payment is complete and the order is processing.';stopped=true;
        } else if(['confirming','partially_paid'].includes(status)||paid>0){
          box.classList.add('warning');title.textContent='Payment detected — confirming';text.textContent='Your transaction was found. Keep this page open while confirmations finish.';s2.classList.add('done');s2.innerHTML='<b>2. Payment detected ✓</b>Your blockchain transaction was found.';
        } else if(['failed','expired','refunded'].includes(status)){
          box.classList.add('error');title.textContent=status==='expired'?'Payment window expired':'Payment could not be completed';text.textContent='Create a new payment before sending any additional crypto.';stopped=true;
        } else { title.textContent='Waiting for your payment';text.textContent='After you send, we’ll detect the transaction and update this order automatically.'; }
      }catch(_){ text.textContent='Still waiting. Automatic checking will try again shortly.'; }
      finally{const btn=shell.querySelector('.nxt-check-now');if(btn)btn.textContent='Check now';}
    }
    shell.querySelector('.nxt-check-now').onclick=()=>{stopped=false;check()};check();const timer=setInterval(()=>{if(stopped||!document.body.contains(overlay)){clearInterval(timer);return}check()},7000);
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
