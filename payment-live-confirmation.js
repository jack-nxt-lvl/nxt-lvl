(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-live-confirm{margin:14px 0;padding:16px 17px;border:1px solid rgba(167,139,250,.30);border-radius:14px;background:linear-gradient(145deg,rgba(28,22,44,.98),rgba(13,14,23,.99));box-shadow:0 16px 42px rgba(0,0,0,.22);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-live-confirm-head{display:flex;align-items:center;gap:11px}.nxt-live-confirm-dot{width:13px;height:13px;border-radius:50%;background:#a78bfa;box-shadow:0 0 0 6px rgba(139,92,246,.12),0 0 22px rgba(139,92,246,.55);flex:0 0 13px;animation:nxtLivePulse 1.5s ease-in-out infinite}.nxt-live-confirm-copy{min-width:0;flex:1}.nxt-live-confirm-copy strong{display:block;color:#fff;font-size:14px;line-height:1.25}.nxt-live-confirm-copy span{display:block;color:#a9b0bf;font-size:10.5px;line-height:1.45;margin-top:3px}.nxt-live-confirm-check{border:1px solid rgba(255,255,255,.10);background:#20202c;color:#fff;border-radius:9px;padding:8px 10px;font-size:9.5px;font-weight:800;cursor:pointer;white-space:nowrap}
    .nxt-live-confirm-progress{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:13px}.nxt-live-confirm-step{padding:9px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);color:#8f98a8;font-size:9px;line-height:1.35}.nxt-live-confirm-step b{display:block;color:#c4b5fd;font-size:9.5px;margin-bottom:2px}.nxt-live-confirm-step.done{border-color:rgba(52,211,153,.24);background:rgba(16,185,129,.07)}.nxt-live-confirm-step.done b{color:#6ee7b7}.nxt-live-confirm.success{border-color:rgba(52,211,153,.42);background:linear-gradient(145deg,rgba(6,78,59,.28),rgba(10,25,24,.98));box-shadow:0 18px 48px rgba(16,185,129,.12)}.nxt-live-confirm.success .nxt-live-confirm-dot{background:#22c55e;box-shadow:0 0 0 6px rgba(34,197,94,.12),0 0 26px rgba(34,197,94,.55);animation:none}.nxt-live-confirm.success .nxt-live-confirm-copy strong{color:#d1fae5;font-size:15px}.nxt-live-confirm.success .nxt-live-confirm-copy span{color:#a7f3d0}.nxt-live-confirm.warning .nxt-live-confirm-dot{background:#f59e0b;box-shadow:0 0 0 6px rgba(245,158,11,.10),0 0 22px rgba(245,158,11,.42)}.nxt-live-confirm.error .nxt-live-confirm-dot{background:#ef4444;box-shadow:0 0 0 6px rgba(239,68,68,.10),0 0 22px rgba(239,68,68,.42);animation:none}@keyframes nxtLivePulse{0%,100%{opacity:.62;transform:scale(.94)}50%{opacity:1;transform:scale(1)}}
    @media(max-width:620px){.nxt-live-confirm-head{align-items:flex-start;flex-wrap:wrap}.nxt-live-confirm-check{margin-left:24px}.nxt-live-confirm-progress{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function findRoot(){
    const heading=[...document.querySelectorAll('h1,h2,h3')].find(h=>/complete your payment|crypto payment/i.test(h.textContent||''));
    if(!heading) return null;
    let root=heading.parentElement;
    for(let i=0;i<8&&root?.parentElement;i++){
      const text=root.textContent||'';
      if(/payment id\s*:\s*\d+/i.test(text) && /payment address/i.test(text)) break;
      root=root.parentElement;
    }
    return root;
  }

  function paymentId(root){
    const match=(root.textContent||'').match(/Payment\s*ID\s*:\s*(\d+)/i);
    return match ? match[1] : '';
  }

  function insertStatus(root,id){
    if(root.querySelector('.nxt-live-confirm')) return root.querySelector('.nxt-live-confirm');
    const box=document.createElement('div');
    box.className='nxt-live-confirm';
    box.innerHTML=`
      <div class="nxt-live-confirm-head">
        <span class="nxt-live-confirm-dot"></span>
        <div class="nxt-live-confirm-copy"><strong>Waiting for your payment</strong><span>After you send, this page will automatically detect the transaction and tell you when the order is confirmed.</span></div>
        <button class="nxt-live-confirm-check" type="button">Check now</button>
      </div>
      <div class="nxt-live-confirm-progress">
        <div class="nxt-live-confirm-step done" data-stage="1"><b>1. Payment created</b>Your order payment details are ready.</div>
        <div class="nxt-live-confirm-step" data-stage="2"><b>2. Payment detected</b>We are watching for your blockchain transaction.</div>
        <div class="nxt-live-confirm-step" data-stage="3"><b>3. Order confirmed</b>You will see a clear confirmation here when complete.</div>
      </div>`;
    const banner=root.querySelector('.nxt-pay-banner');
    if(banner) banner.insertAdjacentElement('afterend',box);
    else {
      const heading=[...root.querySelectorAll('h1,h2,h3')].find(h=>/complete your payment|crypto payment/i.test(h.textContent||''));
      (heading?.parentElement||heading)?.insertAdjacentElement('afterend',box);
    }
    box.dataset.paymentId=id;
    return box;
  }

  function setState(box,status,data){
    const strong=box.querySelector('.nxt-live-confirm-copy strong');
    const detail=box.querySelector('.nxt-live-confirm-copy span');
    const step2=box.querySelector('[data-stage="2"]');
    const step3=box.querySelector('[data-stage="3"]');
    box.classList.remove('success','warning','error');
    const s=String(status||'waiting').toLowerCase();
    const paid=Number(data?.actually_paid||0);
    const currency=String(data?.pay_currency||'').toUpperCase();

    if(['finished','confirmed','sending'].includes(s)){
      box.classList.add('success');
      strong.textContent='✓ Payment Confirmed — Order Received';
      detail.textContent='Your payment has been confirmed. Your order is now in processing and you can safely close this page.';
      step2.classList.add('done'); step3.classList.add('done');
      step2.innerHTML='<b>2. Payment detected ✓</b>Your transaction was received by the payment processor.';
      step3.innerHTML='<b>3. Order confirmed ✓</b>Payment is complete and the order has moved into processing.';
      return true;
    }
    if(['confirming','partially_paid'].includes(s) || paid>0){
      box.classList.add('warning');
      strong.textContent=s==='partially_paid' ? 'Payment detected — checking amount' : 'Payment detected — confirming';
      detail.textContent=paid>0 ? `We detected ${paid} ${currency}. Keep this page open while the network finishes confirming it.` : 'Your transaction has been detected. Keep this page open while blockchain confirmations finish.';
      step2.classList.add('done');
      step2.innerHTML='<b>2. Payment detected ✓</b>Your blockchain transaction has been found.';
      return false;
    }
    if(['failed','expired','refunded'].includes(s)){
      box.classList.add('error');
      strong.textContent=s==='expired' ? 'Payment window expired' : s==='refunded' ? 'Payment refunded' : 'Payment could not be completed';
      detail.textContent='Please do not send another payment to this address until you create or confirm a valid payment request.';
      return true;
    }
    strong.textContent='Waiting for your payment';
    detail.textContent='After you send, this page will automatically detect the transaction and tell you when the order is confirmed.';
    return false;
  }

  function activate(root){
    if(!root || root.dataset.nxtLiveConfirmation==='1') return false;
    const id=paymentId(root); if(!id) return false;
    root.dataset.nxtLiveConfirmation='1';
    const box=insertStatus(root,id);
    let stopped=false, failures=0;

    async function check(){
      if(stopped || !document.body.contains(root)) return;
      const btn=box.querySelector('.nxt-live-confirm-check');
      if(btn) btn.textContent='Checking…';
      try{
        const response=await fetch(`/api/payment-status?payment_id=${encodeURIComponent(id)}`,{cache:'no-store'});
        const data=await response.json();
        if(!response.ok) throw new Error(data?.error||'Unable to check payment');
        failures=0;
        stopped=setState(box,data.payment_status,data);
      }catch(error){
        failures++;
        if(failures>=3){
          box.querySelector('.nxt-live-confirm-copy span').textContent='Automatic status checking is temporarily unavailable. Your payment can still complete normally; use “Check now” again in a moment.';
        }
      }finally{
        if(btn) btn.textContent='Check now';
      }
    }

    box.querySelector('.nxt-live-confirm-check').onclick=()=>{stopped=false;check();};
    check();
    const timer=setInterval(()=>{
      if(stopped || !document.body.contains(root)){clearInterval(timer);return;}
      check();
    },7000);
    return true;
  }

  function run(){return activate(findRoot());}
  if(!run()){
    let tries=0;
    const timer=setInterval(()=>{tries++;if(run()||tries>150)clearInterval(timer);},400);
  }
})();
