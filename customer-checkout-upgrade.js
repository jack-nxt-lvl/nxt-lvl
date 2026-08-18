(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-customer-upgraded{width:min(680px,94vw)!important;padding:34px!important;border-radius:22px!important;border:1px solid rgba(167,139,250,.34)!important;background:radial-gradient(circle at 50% -15%,rgba(124,58,237,.18),transparent 42%),linear-gradient(155deg,#12121b,#090910)!important;box-shadow:0 38px 110px rgba(0,0,0,.72),0 0 0 1px rgba(255,255,255,.025) inset!important;position:relative!important;overflow:hidden!important}
    .nxt-customer-upgraded:before{content:'';position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,#2563eb,#8b5cf6,#d946ef);opacity:.95}
    .nxt-customer-upgraded .nxt-customer-steps{display:flex;align-items:center;justify-content:center;gap:11px;margin-bottom:24px;color:#818194;font-size:11px;font-weight:800}
    .nxt-customer-upgraded .nxt-customer-step{display:flex;align-items:center;gap:7px}.nxt-customer-upgraded .nxt-customer-step b{width:29px;height:29px;border-radius:50%;display:grid;place-items:center;background:#1a1a24;border:1px solid rgba(255,255,255,.12);color:#aaa}
    .nxt-customer-upgraded .nxt-customer-step.on{color:#fff}.nxt-customer-upgraded .nxt-customer-step.on b{background:linear-gradient(135deg,#9f67ff,#6d28d9);border-color:#a78bfa;color:#fff;box-shadow:0 0 22px rgba(124,58,237,.34)}
    .nxt-customer-upgraded .nxt-customer-line{width:42px;height:1px;background:rgba(255,255,255,.12)}
    .nxt-customer-upgraded .nxt-customer-kicker{display:flex;align-items:center;gap:8px;color:#c4b5fd;font-size:11px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;margin-bottom:8px}
    .nxt-customer-upgraded .nxt-customer-kicker:before{content:'🔒';font-size:12px}
    .nxt-customer-upgraded h2{font-size:30px!important;letter-spacing:-.5px!important;margin-bottom:8px!important}
    .nxt-customer-upgraded .nxt-customer-intro{font-size:13px!important;line-height:1.6!important;color:#a5a5b5!important;margin-bottom:20px!important;max-width:590px}
    .nxt-customer-upgraded .nxt-customer-trust{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 20px}
    .nxt-customer-upgraded .nxt-customer-trust div{padding:10px 11px;border-radius:10px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.025);text-align:center}
    .nxt-customer-upgraded .nxt-customer-trust strong{display:block;color:#fff;font-size:10px;margin-bottom:3px}.nxt-customer-upgraded .nxt-customer-trust span{display:block;color:#8f98a8;font-size:9px;line-height:1.4}
    .nxt-customer-upgraded input{min-height:50px!important;margin:5px 0!important;padding:14px 15px!important;background:linear-gradient(145deg,#181822,#12121b)!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:11px!important;font-size:14px!important;transition:border-color .16s ease,box-shadow .16s ease,background .16s ease!important}
    .nxt-customer-upgraded input:hover{border-color:rgba(167,139,250,.25)!important}.nxt-customer-upgraded input:focus{border-color:#8b5cf6!important;box-shadow:0 0 0 3px rgba(124,58,237,.13)!important;background:#191923!important}
    .nxt-customer-upgraded input::placeholder{color:#8f8fa0!important}
    .nxt-customer-upgraded #customerContinue{min-height:54px!important;margin-top:19px!important;border-radius:12px!important;background:linear-gradient(100deg,#7c3aed,#9f55ff 55%,#6d28d9)!important;box-shadow:0 12px 34px rgba(124,58,237,.26)!important;font-size:14px!important;letter-spacing:.1px!important;transition:transform .16s ease,filter .16s ease!important}
    .nxt-customer-upgraded #customerContinue:hover{transform:translateY(-1px);filter:brightness(1.10)}
    .nxt-customer-upgraded #customerContinue:after{content:'  →'}
    .nxt-customer-upgraded #customerCancel{min-height:45px!important;background:#1a1a23!important;color:#aaa!important;border-radius:11px!important}
    .nxt-customer-upgraded .nxt-customer-foot{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:12px;color:#757585;font-size:9.5px;line-height:1.4;text-align:center}
    .nxt-customer-upgraded .nxt-customer-foot b{color:#a4a4b3}
    @media(max-width:620px){.nxt-customer-upgraded{padding:24px 18px!important}.nxt-customer-upgraded h2{font-size:25px!important}.nxt-customer-upgraded .nxt-customer-trust{grid-template-columns:1fr}.nxt-customer-upgraded .nxt-customer-line{width:20px}.nxt-customer-upgraded .nxt-customer-steps{font-size:9px;gap:7px}.nxt-customer-upgraded .nxt-customer-step b{width:26px;height:26px}}
  `;
  document.head.appendChild(style);

  function findModal(){
    const btn=document.getElementById('customerContinue');
    if(!btn) return null;
    let card=btn.parentElement;
    while(card && card.parentElement && card.querySelectorAll('input').length < 7) card=card.parentElement;
    return card;
  }

  function upgrade(){
    const card=findModal();
    if(!card || card.dataset.nxtCustomerUpgrade==='1') return false;
    card.dataset.nxtCustomerUpgrade='1';
    card.classList.add('nxt-customer-upgraded');

    const oldKicker=[...card.querySelectorAll('div')].find(d=>(d.textContent||'').trim()==='Secure Checkout' && d.children.length===0);
    if(oldKicker){oldKicker.className='nxt-customer-kicker';oldKicker.textContent='Secure Checkout';}

    const heading=card.querySelector('h2');
    const intro=heading?.nextElementSibling;
    if(intro) intro.classList.add('nxt-customer-intro');

    const steps=document.createElement('div');
    steps.className='nxt-customer-steps';
    steps.innerHTML='<span class="nxt-customer-step on"><b>1</b>Information</span><i class="nxt-customer-line"></i><span class="nxt-customer-step"><b>2</b>Payment</span><i class="nxt-customer-line"></i><span class="nxt-customer-step"><b>3</b>Confirmation</span>';
    card.insertBefore(steps,card.firstChild);

    const trust=document.createElement('div');
    trust.className='nxt-customer-trust';
    trust.innerHTML='<div><strong>Secure checkout</strong><span>Your order details stay connected to this payment.</span></div><div><strong>Payment confirmation</strong><span>Your email is used for order and payment updates.</span></div><div><strong>Shipping details</strong><span>Enter the address where the order should be delivered.</span></div>';
    if(intro) intro.insertAdjacentElement('afterend',trust);

    const foot=document.createElement('div');
    foot.className='nxt-customer-foot';
    foot.innerHTML='🔒 <span><b>Next:</b> choose your payment method. You can review payment details before sending crypto.</span>';
    const cancel=card.querySelector('#customerCancel');
    if(cancel) cancel.insertAdjacentElement('afterend',foot);
    return true;
  }

  if(!upgrade()){
    const observer=new MutationObserver(()=>{if(upgrade()) observer.disconnect();});
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),120000);
  }
})();
