(() => {
  if (window.__nxtCustomerCheckoutDirectWallet) return;
  window.__nxtCustomerCheckoutDirectWallet = true;

  const SHIPPING_FEE = 10;
  const CHECKOUT_DRAFT_KEY = 'nxtCheckoutDraftV1';
  const CART_STORAGE_KEY = 'nxtCartV1';
  let cardLinkConfigPromise;

  function readCheckoutDraft(){
    try{return JSON.parse(sessionStorage.getItem(CHECKOUT_DRAFT_KEY)||'null')||{};}catch(_){return {};}
  }

  function writeCheckoutDraft(value){
    try{sessionStorage.setItem(CHECKOUT_DRAFT_KEY,JSON.stringify(value));}catch(_){}
  }

  window.addEventListener('nxt:payment-confirmed',()=>{
    try{sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);}catch(_){}
  });

  const style = document.createElement('style');
  style.textContent = `
    .nxt-checkout-overlay{position:fixed;inset:0;z-index:1000000;background:rgba(0,0,0,.84);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-checkout-card{width:min(680px,96vw);max-height:94vh;overflow:auto;padding:28px;border-radius:22px;border:1px solid rgba(167,139,250,.34);background:radial-gradient(circle at 50% -15%,rgba(124,58,237,.18),transparent 42%),linear-gradient(155deg,#12121b,#090910);box-shadow:0 38px 110px rgba(0,0,0,.72);color:#fff;position:relative}
    .nxt-checkout-card:before{content:'';position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,#2563eb,#8b5cf6,#d946ef)}
    .nxt-checkout-kicker{color:#c4b5fd;font-size:10px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase;margin-bottom:7px}.nxt-checkout-card h2{font-size:28px;margin:0 0 7px}.nxt-checkout-intro{font-size:12px;line-height:1.55;color:#a5a5b5;margin-bottom:18px}
    .nxt-fulfillment-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}.nxt-fulfillment{border:1px solid rgba(255,255,255,.10);border-radius:14px;background:#15151f;padding:15px;cursor:pointer;color:#fff;text-align:left}.nxt-fulfillment.active{border-color:#8b5cf6;box-shadow:0 0 0 2px rgba(124,58,237,.14);background:rgba(124,58,237,.14)}.nxt-fulfillment strong{display:block;font-size:13px}.nxt-fulfillment span{display:block;color:#9999aa;font-size:10px;margin-top:4px}.nxt-fulfillment .price{color:#c4b5fd;font-weight:900;font-size:12px;margin-top:7px}
    .nxt-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nxt-field-grid .wide{grid-column:1/-1}.nxt-checkout-card input{width:100%;min-height:48px;padding:13px 14px;background:#15151f;border:1px solid rgba(255,255,255,.10);border-radius:10px;color:#fff;font-size:13px;outline:none}.nxt-checkout-card input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(124,58,237,.13)}
    .nxt-address-fields.hidden{display:none}.nxt-pickup-note{display:none;margin:10px 0 0;padding:12px 13px;border:1px solid rgba(52,211,153,.20);border-radius:10px;background:rgba(16,185,129,.07);color:#b7e9d2;font-size:10.5px}.nxt-pickup-note.show{display:block}
    .nxt-order-summary{margin-top:16px;padding:14px 15px;border:1px solid rgba(167,139,250,.20);border-radius:12px;background:rgba(124,58,237,.06)}.nxt-summary-row{display:flex;justify-content:space-between;gap:12px;color:#aaaabd;font-size:11px;padding:4px 0}.nxt-summary-row.total{border-top:1px solid rgba(255,255,255,.08);margin-top:5px;padding-top:10px;color:#fff;font-size:15px;font-weight:900}.nxt-summary-row.total span:last-child{color:#c4b5fd}.nxt-no-tax{color:#858598;font-size:9.5px;margin-top:7px}
    .nxt-payment-choice{margin-top:16px}.nxt-payment-choice>strong{display:block;margin-bottom:8px;color:#fff;font-size:12px}.nxt-payment-methods{display:grid;grid-template-columns:1fr 1fr;gap:9px}.nxt-payment-method{min-height:88px;padding:13px;border:1px solid rgba(255,255,255,.10);border-radius:13px;background:#15151f;color:#fff;text-align:left;cursor:pointer}.nxt-payment-method.active{border-color:#8b5cf6;box-shadow:0 0 0 2px rgba(124,58,237,.14);background:linear-gradient(145deg,rgba(124,58,237,.18),rgba(37,99,235,.10))}.nxt-payment-method b{display:block;font-size:12px}.nxt-payment-method span{display:block;margin-top:4px;color:#a5a5b5;font-size:9.5px;line-height:1.4}.nxt-payment-method em{display:inline-block;margin-top:7px;color:#86efac;font-size:8px;font-style:normal;font-weight:900;text-transform:uppercase;letter-spacing:.55px}
    .nxt-link-options{display:none;margin-top:9px;padding:12px;border:1px solid rgba(96,165,250,.25);border-radius:12px;background:rgba(37,99,235,.07)}.nxt-link-options.show{display:block}.nxt-link-options>span{display:block;color:#cbd5e1;font-size:9.5px;line-height:1.45}.nxt-link-channels{display:grid;grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:8px;margin-top:9px}.nxt-link-channel{min-height:46px;padding:8px 7px;border:1px solid rgba(255,255,255,.10);border-radius:9px;background:#171722;color:#c7c8d1;font-size:10px;font-weight:850;cursor:pointer}.nxt-link-channel.active{border-color:#60a5fa;background:rgba(37,99,235,.18);color:#fff;box-shadow:0 0 0 2px rgba(96,165,250,.10)}.nxt-link-channel.recommended:after{content:'RECOMMENDED';display:block;margin-top:3px;color:#86efac;font-size:6.5px;letter-spacing:.55px}.nxt-link-consent{display:none;align-items:flex-start;gap:8px;margin-top:10px;color:#aab3c2;font-size:8.5px;line-height:1.45}.nxt-link-consent.show{display:flex}.nxt-link-consent input{width:16px!important;min-height:16px!important;height:16px!important;margin-top:1px;padding:0!important;accent-color:#7c3aed}.nxt-link-provider{margin-top:9px;color:#7f8999;font-size:8px;line-height:1.45}.nxt-link-provider b{color:#b6c2d2}
    .nxt-checkout-actions{display:grid;grid-template-columns:1fr 1.7fr;gap:9px;margin-top:17px}.nxt-checkout-actions button{min-height:50px;border-radius:11px;border:0;font-weight:850;cursor:pointer}.nxt-checkout-cancel{background:#242431;color:#aaa}.nxt-checkout-continue{background:linear-gradient(100deg,#7c3aed,#9f55ff 55%,#6d28d9);color:#fff}.nxt-checkout-error{display:none;color:#fca5a5;font-size:10px;margin-top:10px}.nxt-checkout-error.show{display:block}
    .nxt-link-status-card{text-align:center}.nxt-link-status-icon{width:58px;height:58px;margin:0 auto 15px;display:grid;place-items:center;border-radius:18px;background:linear-gradient(145deg,#2563eb,#7c3aed);font-size:27px;box-shadow:0 15px 40px rgba(37,99,235,.28)}.nxt-link-status-card h2{margin-bottom:8px}.nxt-link-status-card p{color:#a9a9b7;font-size:12px;line-height:1.6}.nxt-link-status-card .nxt-link-order{margin:16px 0;padding:13px;border:1px solid rgba(167,139,250,.20);border-radius:11px;background:rgba(124,58,237,.07);color:#e9e2ff;font-size:11px}.nxt-link-status-card button{width:100%;min-height:50px;margin-top:15px;border:0;border-radius:11px;background:linear-gradient(100deg,#7c3aed,#9f55ff);color:#fff;font-weight:900;cursor:pointer}
    @media(max-width:620px){.nxt-checkout-card{padding:22px 16px}.nxt-checkout-card h2{font-size:24px}.nxt-field-grid{grid-template-columns:1fr}.nxt-field-grid .wide{grid-column:auto}.nxt-payment-methods{grid-template-columns:1fr 1fr}.nxt-payment-method{min-height:96px}.nxt-link-channels{grid-template-columns:repeat(3,1fr)}.nxt-link-channel{font-size:9px}}
  `;
  document.head.appendChild(style);

  function cartItems(){
    try { return Array.isArray(window.cart) ? window.cart : (typeof cart !== 'undefined' && Array.isArray(cart) ? cart : []); }
    catch (_) { return []; }
  }

  function subtotal(){
    return cartItems().reduce((sum,item)=>sum+(Number(item.price)||0)*(Number(item.qty)||0),0);
  }

  function persistCart(){
    try{
      const compact=cartItems().map(item=>({productId:item.productId,pricingIndex:Number(String(item.key).split('::').pop()),qty:item.qty}));
      localStorage.setItem(CART_STORAGE_KEY,JSON.stringify(compact));
    }catch(_){}
  }

  function setupCartPersistence(){
    try{
      const target=cartItems();
      if(!target.length){
        const saved=JSON.parse(localStorage.getItem(CART_STORAGE_KEY)||'[]');
        const catalog=typeof compounds!=='undefined'&&Array.isArray(compounds)?compounds:[];
        if(Array.isArray(saved))saved.slice(0,50).forEach(item=>{
          const product=catalog.find(entry=>entry.id===String(item.productId||''));
          const pricingIndex=Number(item.pricingIndex);
          const option=product&&Number.isInteger(pricingIndex)?product.pricing[pricingIndex]:null;
          const qty=Math.min(20,Math.max(1,Number(item.qty)||1));
          if(product&&option)target.push({key:product.id+'::'+pricingIndex,productId:product.id,name:product.name,label:option.label,price:option.price,qty});
        });
        if(target.length&&typeof renderCart==='function')renderCart();
      }
      const items=document.getElementById('cartItems');
      if(items)new MutationObserver(persistCart).observe(items,{childList:true,subtree:true});
      persistCart();
    }catch(_){}
  }

  function loadCheckoutDependency({src,selector,marker,ready,label}){
    return new Promise((resolve,reject)=>{
      if(ready())return resolve();
      const existing=document.querySelector(selector);
      const waitForReady=()=>{
        const timer=setInterval(()=>{if(ready()){clearInterval(timer);resolve();}},50);
        setTimeout(()=>{clearInterval(timer);if(ready())resolve();else reject(new Error(`${label} failed to load.`));},5000);
      };
      if(existing){waitForReady();return;}
      const script=document.createElement('script');
      script.src=src;
      script.async=false;
      script.setAttribute(marker,'1');
      script.onload=()=>ready()?resolve():reject(new Error(`${label} failed to initialize.`));
      script.onerror=()=>reject(new Error(`${label} failed to load.`));
      document.body.appendChild(script);
    });
  }

  async function ensureDirectWallet(){
    await loadCheckoutDependency({
      src:'/lib/paybis-funding.js?v=20260825-paybis-match-1',
      selector:'script[data-nxt-paybis-funding],script[src*="lib/paybis-funding.js"]',
      marker:'data-nxt-paybis-funding',
      ready:()=>Boolean(window.NxtPaybisFunding),
      label:'USDT funding checkout',
    });
    await loadCheckoutDependency({
      src:'/direct-wallet-checkout.js?v=20260825-paybis-match-1',
      selector:'script[data-nxt-direct-wallet],script[src*="direct-wallet-checkout.js"]',
      marker:'data-nxt-direct-wallet',
      ready:()=>typeof window.startDirectWalletCheckout==='function',
      label:'Direct-wallet checkout',
    });
  }

  function loadCardLinkConfig(){
    if(!cardLinkConfigPromise){
      cardLinkConfigPromise=fetch('/api/card-payment-link-config',{headers:{Accept:'application/json'}})
        .then(response=>response.ok?response.json():Promise.reject(new Error('Unavailable')))
        .then(data=>({available:Boolean(data.available),email:Boolean(data.email),sms:Boolean(data.sms),both:Boolean(data.both||data.email&&data.sms)}))
        .catch(()=>({available:false,email:false,sms:false,both:false}));
    }
    return cardLinkConfigPromise;
  }

  function requestId(){
    if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();
    const bytes=new Uint8Array(16);window.crypto?.getRandomValues?.(bytes);
    return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function compactCart(){
    return cartItems().map(item=>({key:item.key,productId:item.productId,pricingIndex:Number(String(item.key||'').split('::').pop()),qty:Number(item.qty)}));
  }

  function showCardLinkResult(data){
    const overlay=document.createElement('div');
    overlay.className='nxt-checkout-overlay';
    const destination=data.destination?` to <strong>${String(data.destination).replace(/[<>&]/g,'')}</strong>`:'';
    overlay.innerHTML=`<div class="nxt-checkout-card nxt-link-status-card" role="dialog" aria-modal="true" aria-label="Payment link sent"><div class="nxt-link-status-icon">✓</div><div class="nxt-checkout-kicker">Secure hosted checkout</div><h2>Payment link sent</h2><p>We sent your private card and Apple Pay checkout link${destination}. Open that message whenever you are ready. Your card information is entered only on the payment provider's secure website.</p><div class="nxt-link-order">Order <strong>${String(data.orderId||'').replace(/[<>&]/g,'')}</strong><br>Payment is not complete until the hosted checkout confirms it.</div><button type="button">Done</button></div>`;
    overlay.querySelector('button').onclick=()=>overlay.remove();
    document.body.appendChild(overlay);
  }

  function showCardLinkProgress(){
    const overlay=document.createElement('div');
    overlay.className='nxt-checkout-overlay';
    overlay.innerHTML='<div class="nxt-checkout-card nxt-link-status-card" role="dialog" aria-modal="true" aria-label="Sending payment link"><div class="nxt-link-status-icon">↗</div><div class="nxt-checkout-kicker">Secure hosted checkout</div><h2>Sending your link…</h2><p>We are creating an order-specific card and Apple Pay checkout on the payment provider\'s website.</p></div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function showCardLinkError(message){
    const overlay=document.createElement('div');
    overlay.className='nxt-checkout-overlay';
    overlay.innerHTML=`<div class="nxt-checkout-card nxt-link-status-card" role="dialog" aria-modal="true" aria-label="Payment link error"><div class="nxt-link-status-icon">!</div><div class="nxt-checkout-kicker">Payment link not sent</div><h2>Please try again</h2><p>${String(message||'Unable to send the secure payment link.').replace(/[<>&]/g,'')}</p><button type="button">Return to checkout</button></div>`;
    overlay.querySelector('button').onclick=()=>{overlay.remove();runCheckout();};
    document.body.appendChild(overlay);
  }

  async function requestCardLink(details){
    const id=requestId();
    const options={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId:id,items:compactCart(),fulfillment:details.fulfillment,customer:details.customer,channel:details.linkChannel,smsConsent:details.smsConsent===true})};
    let response;
    try{response=await fetch('/api/create-card-payment-link',options);}catch(_){response=await fetch('/api/create-card-payment-link',options);}
    let data=await response.json().catch(()=>({}));
    if(response.status>=500){
      await new Promise(resolve=>setTimeout(resolve,450));
      response=await fetch('/api/create-card-payment-link',options);
      data=await response.json().catch(()=>({}));
    }
    if(!response.ok&&!data.sent)throw new Error(data.error||'Unable to send the secure payment link.');
    if(!data.sent&&response.status===202)throw new Error(data.message||'Your payment link is still being prepared. Please wait a moment.');
    return data;
  }

  async function collectCheckoutDetails(){
    const cardConfig=await loadCardLinkConfig();
    return new Promise(resolve=>{
      const draft=readCheckoutDraft();
      let fulfillment=draft.fulfillment==='pickup'?'pickup':'shipping';
      let paymentMethod='crypto';
      let linkChannel=cardConfig.both?'both':cardConfig.email?'email':'sms';
      const base=subtotal();
      const overlay=document.createElement('div');
      overlay.className='nxt-checkout-overlay';
      overlay.innerHTML=`<div class="nxt-checkout-card">
        <div class="nxt-checkout-kicker">🔒 Secure Checkout</div>
        <h2>Shipping or Local Pickup</h2>
        <div class="nxt-checkout-intro">Enter your order information, then ${cardConfig.available?'choose direct crypto payment or have a separate secure card-payment link sent to you.':'pay BTC, ETH, or USDT directly from your crypto wallet.'} Card information is never entered or processed on NXT LVL.</div>
        <div class="nxt-fulfillment-grid">
          <button type="button" class="nxt-fulfillment active" data-mode="shipping"><strong>📦 Ship My Order</strong><span>Standard delivery</span><span class="price">$10 shipping</span></button>
          <button type="button" class="nxt-fulfillment" data-mode="pickup"><strong>📍 Local Pickup</strong><span>For local customers</span><span class="price">FREE — $0 shipping</span></button>
        </div>
        <div class="nxt-field-grid"><input id="nxtName" class="wide" autocomplete="name" placeholder="Full name *"><input id="nxtEmail" autocomplete="email" placeholder="Email *"><input id="nxtPhone" autocomplete="tel" placeholder="Phone number *"></div>
        <div class="nxt-address-fields"><div class="nxt-field-grid" style="margin-top:8px"><input id="nxtAddress" class="wide" autocomplete="street-address" placeholder="Street address *"><input id="nxtUnit" placeholder="Apt / Unit"><input id="nxtCity" placeholder="City *"><input id="nxtState" placeholder="State *"><input id="nxtZip" placeholder="ZIP code *"></div></div>
        <div class="nxt-pickup-note">Local pickup selected — shipping is $0. Pickup details will be coordinated after the order is confirmed.</div>
        <div class="nxt-order-summary"><div class="nxt-summary-row"><span>Subtotal</span><span>$${base.toFixed(2)}</span></div><div class="nxt-summary-row"><span id="nxtShippingLabel">Shipping</span><span id="nxtShipping">$10.00</span></div><div class="nxt-summary-row total"><span>Total</span><span id="nxtTotal">$${(base+SHIPPING_FEE).toFixed(2)}</span></div><div class="nxt-no-tax">Sales tax: $0.00</div></div>
        <div class="nxt-payment-choice"><strong>How would you like to pay?</strong><div class="nxt-payment-methods"><button type="button" class="nxt-payment-method active" data-payment="crypto"><b>₿ Pay with crypto now</b><span>Choose BTC, ETH, or USDT and pay directly from a wallet.</span><em>Blockchain verified</em></button>${cardConfig.available?`<button type="button" class="nxt-payment-method" data-payment="card-link"><b>💳 Send me a card link</b><span>Receive a separate hosted checkout link by email, text, or both.</span><em>Card details stay off-site</em></button>`:''}</div>${cardConfig.available?`<div class="nxt-link-options"><span>Where should we send your private hosted payment link?</span><div class="nxt-link-channels">${cardConfig.email?`<button type="button" class="nxt-link-channel ${cardConfig.both?'':'active'}" data-channel="email">✉ Email</button>`:''}${cardConfig.sms?`<button type="button" class="nxt-link-channel ${cardConfig.email||cardConfig.both?'':'active'}" data-channel="sms">▣ Text</button>`:''}${cardConfig.both?'<button type="button" class="nxt-link-channel recommended active" data-channel="both">✉ + ▣ Both</button>':''}</div><label class="nxt-link-consent"><input type="checkbox" id="nxtSmsConsent"><span>I agree to receive one transactional payment-link text. Message and data rates may apply.</span></label><div class="nxt-link-provider"><b>Completely separate card processing:</b> the link opens the payment provider's hosted page. NXT LVL does not receive or store card numbers.</div></div>`:''}</div>
        <div class="nxt-checkout-error"></div>
        <div class="nxt-checkout-actions"><button type="button" class="nxt-checkout-cancel">Cancel</button><button type="button" class="nxt-checkout-continue">Continue to Wallet Payment →</button></div>
      </div>`;

      const addressWrap=overlay.querySelector('.nxt-address-fields');
      const pickupNote=overlay.querySelector('.nxt-pickup-note');
      const shippingLabel=overlay.querySelector('#nxtShippingLabel');
      const shippingEl=overlay.querySelector('#nxtShipping');
      const totalEl=overlay.querySelector('#nxtTotal');
      const errorEl=overlay.querySelector('.nxt-checkout-error');
      const linkOptions=overlay.querySelector('.nxt-link-options');
      const smsConsent=overlay.querySelector('#nxtSmsConsent');
      const continueButton=overlay.querySelector('.nxt-checkout-continue');
      const fieldMap={name:'#nxtName',email:'#nxtEmail',phone:'#nxtPhone',address:'#nxtAddress',unit:'#nxtUnit',city:'#nxtCity',state:'#nxtState',zip:'#nxtZip'};
      Object.entries(fieldMap).forEach(([key,selector])=>{const input=overlay.querySelector(selector);if(input&&draft.customer&&draft.customer[key])input.value=draft.customer[key];});
      const saveDraft=()=>{
        const val=s=>(overlay.querySelector(s)?.value||'').trim();
        writeCheckoutDraft({fulfillment,customer:{name:val('#nxtName'),email:val('#nxtEmail'),phone:val('#nxtPhone'),address:val('#nxtAddress'),unit:val('#nxtUnit'),city:val('#nxtCity'),state:val('#nxtState'),zip:val('#nxtZip')}});
      };
      const refresh=()=>{
        const fee=fulfillment==='pickup'?0:SHIPPING_FEE;
        addressWrap.classList.toggle('hidden',fulfillment==='pickup');pickupNote.classList.toggle('show',fulfillment==='pickup');
        shippingLabel.textContent=fulfillment==='pickup'?'Local pickup':'Shipping';shippingEl.textContent='$'+fee.toFixed(2);totalEl.textContent='$'+(base+fee).toFixed(2);
        overlay.querySelectorAll('.nxt-fulfillment').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===fulfillment));
        overlay.querySelectorAll('.nxt-payment-method').forEach(btn=>btn.classList.toggle('active',btn.dataset.payment===paymentMethod));
        overlay.querySelectorAll('.nxt-link-channel').forEach(btn=>btn.classList.toggle('active',btn.dataset.channel===linkChannel));
        linkOptions?.classList.toggle('show',paymentMethod==='card-link');
        smsConsent?.closest('.nxt-link-consent')?.classList.toggle('show',paymentMethod==='card-link'&&(linkChannel==='sms'||linkChannel==='both'));
        continueButton.textContent=paymentMethod==='card-link'?'Send Secure Payment Link →':'Continue to Wallet Payment →';
      };
      overlay.querySelectorAll('.nxt-fulfillment').forEach(btn=>btn.onclick=()=>{fulfillment=btn.dataset.mode;refresh();saveDraft();});
      overlay.querySelectorAll('.nxt-payment-method').forEach(btn=>btn.onclick=()=>{paymentMethod=btn.dataset.payment;errorEl.classList.remove('show');refresh();});
      overlay.querySelectorAll('.nxt-link-channel').forEach(btn=>btn.onclick=()=>{linkChannel=btn.dataset.channel;errorEl.classList.remove('show');refresh();});
      overlay.querySelectorAll('input').forEach(input=>input.addEventListener('input',saveDraft));
      overlay.querySelector('.nxt-checkout-cancel').onclick=()=>{overlay.remove();resolve(null);};
      overlay.querySelector('.nxt-checkout-continue').onclick=()=>{
        const val=s=>(overlay.querySelector(s)?.value||'').trim();
        const customer={name:val('#nxtName'),email:val('#nxtEmail'),phone:val('#nxtPhone'),address:val('#nxtAddress'),unit:val('#nxtUnit'),city:val('#nxtCity'),state:val('#nxtState'),zip:val('#nxtZip')};
        const required=[customer.name,customer.email,customer.phone];if(fulfillment==='shipping')required.push(customer.address,customer.city,customer.state,customer.zip);
        if(required.some(v=>!v)){errorEl.textContent=fulfillment==='shipping'?'Please complete your contact and shipping information.':'Please enter your name, email and phone number.';errorEl.classList.add('show');return;}
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)){errorEl.textContent='Please enter a valid email address.';errorEl.classList.add('show');return;}
        if(paymentMethod==='card-link'&&(linkChannel==='sms'||linkChannel==='both')&&!smsConsent?.checked){errorEl.textContent='Please agree to receive the one-time payment-link text.';errorEl.classList.add('show');return;}
        const shipping=fulfillment==='pickup'?0:SHIPPING_FEE;
        writeCheckoutDraft({fulfillment,customer});
        overlay.remove();resolve({fulfillment,shipping,total:base+shipping,customer,paymentMethod,linkChannel,smsConsent:Boolean(smsConsent?.checked)});
      };
      document.body.appendChild(overlay);refresh();
    });
  }

  async function runCheckout(event){
    if(event){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();}
    if(!cartItems().length)return;
    try{if(typeof closeCart==='function')closeCart();}catch(_){}
    const details=await collectCheckoutDetails();if(!details)return;
    window.nxtCheckoutDetails=details;
    if(details.paymentMethod==='card-link'){
      const progress=showCardLinkProgress();
      try{
        const data=await requestCardLink(details);
        progress.remove();
        showCardLinkResult(data);
      }catch(err){
        progress.remove();
        showCardLinkError(err.message||'Unable to send the secure payment link.');
      }
      return;
    }
    try{await ensureDirectWallet();await window.startDirectWalletCheckout();}
    catch(err){alert(err.message||'Unable to open direct-wallet checkout. Please try again.');}
  }

  window.proceedToCheckout=runCheckout;

  function bind(){
    const btn=document.getElementById('cartCheckoutBtn');if(!btn||btn.dataset.nxtDirectWallet==='1')return;
    btn.dataset.nxtDirectWallet='1';btn.removeAttribute('onclick');btn.onclick=null;btn.addEventListener('click',runCheckout,true);
  }
  setupCartPersistence();bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();
