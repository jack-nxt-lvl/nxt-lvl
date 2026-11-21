(function () {
  'use strict';
  const savedKey='nxtPlaidOrderV1';
  const labels={
    awaiting_authorization:'Awaiting bank authorization', processing:'Bank payment processing',
    pending:'Bank payment pending', posted:'Bank payment submitted', settled:'Settled · awaiting funds availability',
    funds_available:'Funds available', returned:'Bank payment returned', failed:'Bank payment failed', cancelled:'Bank payment cancelled'
  };
  async function post(path,body) {
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error || 'Unable to check your bank payment.');
    return data;
  }
  function panel(title,message) {
    const overlay=document.createElement('div');
    overlay.className='nxt-checkout-overlay';
    overlay.innerHTML='<div class="nxt-checkout-card" role="dialog" aria-modal="true" aria-label="Bank payment"><h2></h2><p role="status"></p><div class="nxt-checkout-actions"><button type="button">Close</button></div></div>';
    overlay.querySelector('h2').textContent=title;
    overlay.querySelector('p').textContent=message;
    const close=overlay.querySelector('button');
    close.onclick=()=>overlay.remove();
    document.body.appendChild(overlay);
    close.focus();
    return overlay;
  }
  async function showStatus() {
    let saved;
    try {saved=JSON.parse(sessionStorage.getItem(savedKey));}catch{}
    if(!saved){panel('Bank payment status','For your payment status, check your email or contact NXT LVL with your order number.');return;}
    const view=panel('Checking bank payment','Order '+saved.orderId);
    const message=view.querySelector('p');
    const refresh=document.createElement('button');
    refresh.type='button';refresh.textContent='Refresh status';
    view.querySelector('.nxt-checkout-actions').prepend(refresh);
    async function check(){
      refresh.disabled=true;
      try{
        const data=await post('/api/plaid-ach',{action:'status',...saved});
        view.querySelector('h2').textContent=labels[data.status] || 'Payment under review';
        message.textContent='Order '+data.orderId+' · $'+(data.totalCents/100).toFixed(2)+'. '+(
          data.status==='awaiting_authorization'?'Return to checkout with your approval code to resume this order.':
          data.status==='funds_available'?'We will email your payment confirmation.':
          ['returned','failed','cancelled'].includes(data.status)?'Contact support with this order number before retrying.':'Your bank is processing this order. Please keep this order number.');
      }catch{view.querySelector('h2').textContent='Status temporarily unavailable';message.textContent='Order '+saved.orderId+'. Check again before retrying your payment.';}
      finally{refresh.disabled=false;}
    }
    refresh.onclick=check;
    await check();
  }
  async function start(details,items) {
    const common={items,fulfillment:details.fulfillment,customer:details.customer,promoCode:details.promoCode};
    if(details.achReview) {
      const result=await post('/api/research-application',{...common,research:details.achReview});
      panel('Research review requested',result.message+' Reference '+result.reference+'.');
      return;
    }
    // Retain the receipt before leaving for Plaid. Verify browser storage is usable first.
    sessionStorage.setItem('nxtAchStorageCheck','1');sessionStorage.removeItem('nxtAchStorageCheck');
    const data=await post('/api/plaid-ach',{...common,action:'start',researchApprovalCode:details.researchApprovalCode,
      accountClass:details.accountClass,researchConsent:details.researchConsent,confirmedTotalCents:Math.round(details.total*100)});
    sessionStorage.setItem(savedKey,JSON.stringify({orderId:data.orderId,receipt:data.receipt}));
    if(data.url){window.location.assign(data.url);return;}
    await showStatus();
  }
  window.NxtPlaidCheckout={start,showStatus};
})();
