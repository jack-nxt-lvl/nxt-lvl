(function () {
  'use strict';
  const dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') return;
  dialog.className = 'nxt-email-offer';
  dialog.setAttribute('aria-labelledby','nxt-offer-title');
  dialog.innerHTML = `<button class="offer-close" type="button" aria-label="Close discount offer">×</button>
    <p class="offer-brand">NXT LVL RESEARCH</p><h2 id="nxt-offer-title">Take 10% off your order.</h2>
    <p>Get a personal code by email. Use it for seven days on merchandise, including pack prices.</p>
    <form><label for="offer-email">Email address</label><input type="email" name="email" id="offer-email" autocomplete="email" inputmode="email" maxlength="254" required placeholder="you@yourlab.com">
    <button class="offer-submit" type="submit">Email my 10% code</button>
    <small>By requesting a code, you agree that we can save your email and send it to you. <a href="/privacy.html">Privacy notice</a></small></form>
    <p class="offer-status" role="status" aria-live="polite"></p>`;
  const storageKey = 'nxt-email-offer-v1';
  const week = 7*24*60*60*1000;
  const status = dialog.querySelector('.offer-status');
  const form = dialog.querySelector('form');
  const submit = dialog.querySelector('button[type="submit"]');
  let succeeded = false;
  function remember(until) {
    try { localStorage.setItem(storageKey,String(until)); } catch (_) {}
  }
  function deferred() {
    try { return Number(localStorage.getItem(storageKey))>Date.now(); } catch (_) { return false; }
  }
  function open() {
    if (dialog.open) return;
    if (!dialog.isConnected) document.body.appendChild(dialog);
    dialog.showModal();
  }
  dialog.querySelector('.offer-close').onclick = () => dialog.close();
  dialog.addEventListener('close',()=>remember(succeeded ? Number.MAX_SAFE_INTEGER : Date.now()+week));
  dialog.addEventListener('click',event=>{
    if (event.target !== dialog) return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if (submit.disabled) return;
    submit.disabled=true; status.textContent='Sending your code…';
    try {
      const response=await fetch('/api/email-offer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'signup',email:form.elements.email.value.trim(),consent:true}),signal:AbortSignal.timeout(18000)});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Please try again.');
      succeeded=true;remember(Number.MAX_SAFE_INTEGER);form.hidden=true;
      dialog.querySelector('h2').textContent='Check your inbox.';
      dialog.querySelector('h2 + p').hidden=true;
      status.textContent=data.message;
      dialog.querySelector('.offer-close').focus();
    } catch (error) {
      status.textContent=error.name==='TypeError'||error.name==='TimeoutError'?'Could not reach the store. Please try again.':error.message;
    } finally {submit.disabled=false;}
  });
  const trigger=document.createElement('button');
  trigger.type='button';trigger.className='offer-trigger';trigger.textContent='Get a 10% email code';
  trigger.addEventListener('click',open);
  document.querySelector('footer')?.prepend(trigger);
  const params=new URLSearchParams(location.search);
  if (params.has('cart')||params.has('product')||params.has('card_payment')||location.hash||deferred()) return;
  setTimeout(()=>{
    if (deferred()||document.hidden||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]')) return;
    if (document.querySelector('dialog[open],#cartOverlay.active,#modalOverlay.active,.nxt-checkout-overlay,.nxt-wallet-overlay,[role="dialog"][aria-modal="true"]:not([hidden])') || document.body.style.overflow==='hidden') return;
    open();
  },8000);
})();
