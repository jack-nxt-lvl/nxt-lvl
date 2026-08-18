(() => {
  if (window.__nxtMoonpayAssistedLoaded) return;
  window.__nxtMoonpayAssistedLoaded = true;

  const STORE_KEY = 'nxtMoonpayPaymentV2';
  const MAX_SAVE_MS = 60 * 60 * 1000;
  const MAP = {
    btc: { label:'Bitcoin', symbol:'BTC', url:'https://www.moonpay.com/buy/btc', network:'Bitcoin' },
    eth: { label:'Ethereum', symbol:'ETH', url:'https://www.moonpay.com/buy/eth', network:'Ethereum' },
    usdttrc20: { label:'Tether', symbol:'USDT', url:'https://www.moonpay.com/buy/usdt', network:'TRON (TRC20)' }
  };

  const css=document.createElement('style');
  css.textContent=`
    .nxt-moon-assist{position:fixed;inset:0;z-index:1000004;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-moon-assist-card{width:min(680px,95vw);max-height:94vh;overflow:auto;padding:26px;border-radius:20px;border:1px solid rgba(167,139,250,.34);background:radial-gradient(circle at 100% 0%,rgba(124,58,237,.2),transparent 34%),linear-gradient(155deg,#12121b,#090910);box-shadow:0 34px 100px rgba(0,0,0,.8);color:#fff}
    .nxt-moon-assist-kicker{font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#c4b5fd}.nxt-moon-assist-card h2{margin:7px 0;font-size:27px;line-height:1.12}.nxt-moon-assist-card p{margin:0 0 13px;color:#adb5c2;font-size:11px;line-height:1.55}
    .nxt-moon-safe{display:flex;gap:9px;align-items:flex-start;padding:11px 12px;margin:12px 0;border:1px solid rgba(52,211,153,.25);border-radius:10px;background:rgba(16,185,129,.07);color:#d1fae5;font-size:10px;line-height:1.5}.nxt-moon-safe b{color:#fff}
    .nxt-moon-assist-summary{padding:15px;border:1px solid rgba(167,139,250,.22);border-radius:13px;background:#11111a;margin:13px 0}.nxt-moon-assist-row{display:flex;justify-content:space-between;gap:14px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:11px}.nxt-moon-assist-row:last-child{border-bottom:0}.nxt-moon-assist-row span{color:#9090a1}.nxt-moon-assist-row b{color:#fff;text-align:right;word-break:break-all}.nxt-moon-critical b{color:#fde68a}
    .nxt-moon-assist-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:13px 0}.nxt-moon-assist-step{padding:11px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.025);font-size:9.5px;line-height:1.45;color:#a8afbc}.nxt-moon-assist-step b{display:block;color:#c4b5fd;margin-bottom:3px}
    .nxt-moon-warning{padding:11px 12px;border:1px solid rgba(245,158,11,.27);border-radius:10px;background:rgba(120,53,15,.10);color:#fde68a;font-size:10px;line-height:1.5;margin:12px 0}.nxt-moon-warning b{color:#fff}
    .nxt-moon-status{padding:13px;border:1px solid rgba(167,139,250,.2);border-radius:11px;background:rgba(124,58,237,.06);margin:12px 0}.nxt-moon-status-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.nxt-moon-status-copy strong{display:block;font-size:11px}.nxt-moon-status-copy span{display:block;margin-top:3px;color:#9ca3af;font-size:9.5px}.nxt-moon-status.success{border-color:rgba(52,211,153,.35);background:rgba(16,185,129,.09)}.nxt-moon-status.warning{border-color:rgba(245,158,11,.3);background:rgba(120,53,15,.09)}.nxt-moon-status.error{border-color:rgba(239,68,68,.3);background:rgba(127,29,29,.09)}
    .nxt-moon-status button{border:1px solid rgba(255,255,255,.1);border-radius:8px;background:#252531;color:#fff;padding:8px 10px;font-size:9px;font-weight:800;cursor:pointer}
    .nxt-moon-assist-actions{display:grid;grid-template-columns:1.35fr 1fr 1fr;gap:8px}.nxt-moon-assist-actions button{min-height:46px;border-radius:10px;font-weight:850;cursor:pointer}.nxt-moon-open{border:0;background:linear-gradient(100deg,#2563eb,#7c3aed,#9333ea);color:#fff}.nxt-moon-copy,.nxt-moon-copy-amount{border:1px solid rgba(255,255,255,.1);background:#242431;color:#ddd}.nxt-moon-close{width:100%;min-height:44px;margin-top:8px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#191922;color:#aaa;font-weight:800;cursor:pointer}
    .nxt-moon-expiry{margin-top:9px;text-align:center;color:#777b87;font-size:9px;line-height:1.45}
    @media(max-width:650px){.nxt-moon-assist-card{padding:21px 16px}.nxt-moon-assist-steps,.nxt-moon-assist-actions{grid-template-columns:1fr}.nxt-moon-status-head{align-items:flex-start;flex-direction:column}.nxt-moon-status button{width:100%}}
  `;
  document.head.appendChild(css);

  function details(){const d=window.nxtCheckoutDetails||{};return{total:Number(d.total||0),customer:d.customer||{},fulfillment:d.fulfillment||'',shipping:Number(d.shipping||0)}}
  function moonCodeFromHref(href){const h=String(href||'').toLowerCase();if(h.includes('/buy/btc'))return'btc';if(h.includes('/buy/eth'))return'eth';if(h.includes('/buy/usdt'))return'usdttrc20';return''}
  function save(p){try{sessionStorage.setItem(STORE_KEY,JSON.stringify(p))}catch(_){}}
  function load(){try{return JSON.parse(sessionStorage.getItem(STORE_KEY)||'null')}catch(_){return null}}
  function clear(){try{sessionStorage.removeItem(STORE_KEY)}catch(_){}}
  async function copy(text){try{if(navigator.clipboard){await navigator.clipboard.writeText(String(text||''));return true}}catch(_){}return false}
  function validSaved(p){return !!(p&&p.paymentId&&p.payAddress&&p.payAmount&&Date.now()-Number(p.savedAt||0)<MAX_SAVE_MS)}

  async function getStatus(p){
    if(!p.paymentId)return null;
    try{const r=await fetch('/api/payment-status?payment_id='+encodeURIComponent(p.paymentId),{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d?.error||'Status unavailable');return d}catch(_){return null}
  }

  function applyStatus(box,data){
    const copyEl=box.querySelector('.nxt-moon-status-copy');
    box.classList.remove('success','warning','error');
    if(!data){copyEl.innerHTML='<strong>Payment not detected yet</strong><span>You can keep this page open and check again after completing MoonPay.</span>';return false}
    const s=String(data.payment_status||'waiting').toLowerCase();
    if(['finished','confirmed','sending'].includes(s)){box.classList.add('success');copyEl.innerHTML='<strong>✓ Payment confirmed</strong><span>Your order payment has been detected and confirmed.</span>';clear();return true}
    if(['confirming','partially_paid'].includes(s)||Number(data.actually_paid||0)>0){box.classList.add('warning');copyEl.innerHTML='<strong>Payment detected — confirming</strong><span>Your transaction was found. Blockchain confirmation is still in progress.</span>';return false}
    if(['failed','expired','refunded'].includes(s)){box.classList.add('error');copyEl.innerHTML='<strong>Payment '+s+'</strong><span>Do not send more funds to this payment request. Return to checkout and create a new payment if needed.</span>';return true}
    copyEl.innerHTML='<strong>Waiting for payment</strong><span>Complete the purchase in MoonPay, then return here. We will keep checking.</span>';return false
  }

  function overlayFor(p){
    document.querySelector('.nxt-moon-assist')?.remove();
    const cfg=MAP[p.payCurrency]||{label:String(p.payCurrency).toUpperCase(),symbol:String(p.payCurrency).toUpperCase(),network:'the checkout network',url:'#'};
    const o=document.createElement('div');o.className='nxt-moon-assist';
    o.innerHTML=`<div class="nxt-moon-assist-card">
      <div class="nxt-moon-assist-kicker">Order payment prepared</div>
      <h2>Finish your ${cfg.label} purchase</h2>
      <p>Your checkout details are saved in this browser. Keep this tab open while MoonPay opens in a separate tab.</p>
      <div class="nxt-moon-safe">🔒 <div><b>Use only the details below for this order.</b> The checkout generated a unique payment request and will automatically check its status when you return.</div></div>
      <div class="nxt-moon-assist-summary">
        <div class="nxt-moon-assist-row"><span>Order total</span><b>$${Number(p.orderTotal).toFixed(2)}</b></div>
        <div class="nxt-moon-assist-row nxt-moon-critical"><span>Exact crypto to receive</span><b>${p.payAmount} ${cfg.symbol}</b></div>
        <div class="nxt-moon-assist-row nxt-moon-critical"><span>Required network</span><b>${cfg.network}</b></div>
        <div class="nxt-moon-assist-row"><span>Receiving address</span><b>${p.payAddress}</b></div>
        <div class="nxt-moon-assist-row"><span>Payment ID</span><b>${p.paymentId}</b></div>
      </div>
      <div class="nxt-moon-assist-steps">
        <div class="nxt-moon-assist-step"><b>1. Open MoonPay</b>Buy ${cfg.symbol} using an eligible Apple Pay, debit card, or credit card option offered by MoonPay.</div>
        <div class="nxt-moon-assist-step"><b>2. Send to this address</b>If MoonPay asks for a destination wallet, paste the saved receiving address and verify the network.</div>
        <div class="nxt-moon-assist-step"><b>3. Return to this tab</b>The payment ID stays saved and checkout will check for blockchain confirmation.</div>
      </div>
      <div class="nxt-moon-warning"><b>Important:</b> MoonPay fees and exchange rates may change the dollar amount you need to spend. The checkout target is the exact <b>${p.payAmount} ${cfg.symbol}</b> received on <b>${cfg.network}</b>. Do not send a different coin or network.</div>
      <div class="nxt-moon-status"><div class="nxt-moon-status-head"><div class="nxt-moon-status-copy"><strong>Waiting for payment</strong><span>Complete MoonPay, then return here.</span></div><button type="button" class="nxt-moon-check">Check Payment</button></div></div>
      <div class="nxt-moon-assist-actions"><button type="button" class="nxt-moon-open">Open MoonPay →</button><button type="button" class="nxt-moon-copy">Copy Address</button><button type="button" class="nxt-moon-copy-amount">Copy Exact Amount</button></div>
      <button type="button" class="nxt-moon-close">Keep Checkout Open</button>
      <div class="nxt-moon-expiry">These saved handoff details are kept in this browser for up to 60 minutes. The payment provider may impose its own payment window.</div>
    </div>`;
    document.body.appendChild(o);
    const statusBox=o.querySelector('.nxt-moon-status');
    let stopped=false;
    const check=async()=>{const btn=o.querySelector('.nxt-moon-check');if(btn)btn.textContent='Checking…';const data=await getStatus(p);stopped=applyStatus(statusBox,data);if(btn)btn.textContent='Check Payment'};
    o.querySelector('.nxt-moon-open').onclick=async()=>{await copy(p.payAddress);window.open(cfg.url,'_blank','noopener,noreferrer')};
    o.querySelector('.nxt-moon-copy').onclick=async e=>{e.currentTarget.textContent=await copy(p.payAddress)?'Address Copied ✓':'Copy unavailable'};
    o.querySelector('.nxt-moon-copy-amount').onclick=async e=>{e.currentTarget.textContent=await copy(p.payAmount)?'Amount Copied ✓':'Copy unavailable'};
    o.querySelector('.nxt-moon-check').onclick=check;
    o.querySelector('.nxt-moon-close').onclick=()=>o.remove();
    check();
    const timer=setInterval(()=>{if(stopped||!document.body.contains(o)){clearInterval(timer);return}check()},7000);
    return o
  }

  async function prepare(payCurrency){
    const d=details(),cfg=MAP[payCurrency];
    if(!d.total){alert('Unable to read the order total. Please return to checkout and try again.');return}
    if(!cfg)return;
    const old=load();
    if(validSaved(old)&&old.payCurrency===payCurrency&&Math.abs(Number(old.orderTotal)-d.total)<0.01){overlayFor(old);return}
    const loading=document.createElement('div');loading.className='nxt-moon-assist';loading.innerHTML='<div class="nxt-moon-assist-card" style="text-align:center"><h2>Preparing secure payment…</h2><p>Creating the exact crypto amount, network, and receiving address for this order.</p></div>';document.body.appendChild(loading);
    try{
      const res=await fetch('/api/create-nowpayment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:d.total,payCurrency,orderId:'NXT-'+Date.now(),description:'NXT LVL Research order'})});let data={};try{data=await res.json()}catch(_){}loading.remove();
      if(!res.ok||!data.pay_address||!data.pay_amount){alert(data.message||data.error||'Unable to prepare payment. Please try again.');return}
      const p={savedAt:Date.now(),payCurrency,orderTotal:d.total,payAmount:data.pay_amount,payAddress:data.pay_address,paymentId:data.payment_id||'',customer:d.customer,fulfillment:d.fulfillment,shipping:d.shipping};
      save(p);await copy(p.payAddress);overlayFor(p)
    }catch(err){loading.remove();console.error('MoonPay assisted handoff:',err);alert('Unable to prepare the MoonPay handoff. Please try again.')}
  }

  document.addEventListener('click',e=>{const link=e.target.closest('a.nxt-pay-row[href*="moonpay.com/buy/"]');if(!link)return;const code=moonCodeFromHref(link.href);if(!code)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();prepare(code)},true);
  function restore(){const p=load();if(validSaved(p)&&!document.querySelector('.nxt-moon-assist'))overlayFor(p);else if(p&&!validSaved(p))clear()}
  window.addEventListener('focus',restore);
  window.addEventListener('pageshow',()=>setTimeout(restore,250));
})();