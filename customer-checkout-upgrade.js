(() => {
  if (window.__nxtCustomerCheckoutDirectWallet) return;
  window.__nxtCustomerCheckoutDirectWallet = true;

  const SHIPPING_FEE = 10;
  const CHECKOUT_DRAFT_KEY = 'nxtCheckoutDraftV1';
  const CART_STORAGE_KEY = 'nxtCartV1';

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
    .nxt-checkout-actions{display:grid;grid-template-columns:1fr 1.7fr;gap:9px;margin-top:17px}.nxt-checkout-actions button{min-height:50px;border-radius:11px;border:0;font-weight:850;cursor:pointer}.nxt-checkout-cancel{background:#242431;color:#aaa}.nxt-checkout-continue{background:linear-gradient(100deg,#7c3aed,#9f55ff 55%,#6d28d9);color:#fff}.nxt-checkout-error{display:none;color:#fca5a5;font-size:10px;margin-top:10px}.nxt-checkout-error.show{display:block}
    @media(max-width:620px){.nxt-checkout-card{padding:22px 16px}.nxt-checkout-card h2{font-size:24px}.nxt-fulfillment-grid,.nxt-field-grid,.nxt-checkout-actions{grid-template-columns:1fr}.nxt-field-grid .wide{grid-column:auto}}
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

  function ensureDirectWallet(){
    return new Promise((resolve,reject)=>{
      if (typeof window.startDirectWalletCheckout === 'function') return resolve();
      const existing = document.querySelector('script[data-nxt-direct-wallet]');
      if (existing) {
        const timer=setInterval(()=>{if(typeof window.startDirectWalletCheckout==='function'){clearInterval(timer);resolve();}},50);
        setTimeout(()=>{clearInterval(timer);if(typeof window.startDirectWalletCheckout==='function')resolve();else reject(new Error('Direct-wallet checkout failed to load.'));},5000);
        return;
      }
      const script=document.createElement('script');
      script.src='/direct-wallet-checkout.js?v=20260820-frictionless-1';
      script.async=false;
      script.dataset.nxtDirectWallet='1';
      script.onload=()=>typeof window.startDirectWalletCheckout==='function'?resolve():reject(new Error('Direct-wallet checkout failed to initialize.'));
      script.onerror=()=>reject(new Error('Direct-wallet checkout failed to load.'));
      document.body.appendChild(script);
    });
  }

  function collectCheckoutDetails(){
    return new Promise(resolve=>{
      const draft=readCheckoutDraft();
      let fulfillment=draft.fulfillment==='pickup'?'pickup':'shipping';
      const base=subtotal();
      const overlay=document.createElement('div');
      overlay.className='nxt-checkout-overlay';
      overlay.innerHTML=`<div class="nxt-checkout-card">
        <div class="nxt-checkout-kicker">🔒 Secure Checkout</div>
        <h2>Shipping or Local Pickup</h2>
        <div class="nxt-checkout-intro">Enter your order information, then pay BTC, ETH, or USDT directly from your crypto wallet. The site verifies the payment on the blockchain before confirming the order.</div>
        <div class="nxt-fulfillment-grid">
          <button type="button" class="nxt-fulfillment active" data-mode="shipping"><strong>📦 Ship My Order</strong><span>Standard delivery</span><span class="price">$10 shipping</span></button>
          <button type="button" class="nxt-fulfillment" data-mode="pickup"><strong>📍 Local Pickup</strong><span>For local customers</span><span class="price">FREE — $0 shipping</span></button>
        </div>
        <div class="nxt-field-grid"><input id="nxtName" class="wide" autocomplete="name" placeholder="Full name *"><input id="nxtEmail" autocomplete="email" placeholder="Email *"><input id="nxtPhone" autocomplete="tel" placeholder="Phone number *"></div>
        <div class="nxt-address-fields"><div class="nxt-field-grid" style="margin-top:8px"><input id="nxtAddress" class="wide" autocomplete="street-address" placeholder="Street address *"><input id="nxtUnit" placeholder="Apt / Unit"><input id="nxtCity" placeholder="City *"><input id="nxtState" placeholder="State *"><input id="nxtZip" placeholder="ZIP code *"></div></div>
        <div class="nxt-pickup-note">Local pickup selected — shipping is $0. Pickup details will be coordinated after the order is confirmed.</div>
        <div class="nxt-order-summary"><div class="nxt-summary-row"><span>Subtotal</span><span>$${base.toFixed(2)}</span></div><div class="nxt-summary-row"><span id="nxtShippingLabel">Shipping</span><span id="nxtShipping">$10.00</span></div><div class="nxt-summary-row total"><span>Total</span><span id="nxtTotal">$${(base+SHIPPING_FEE).toFixed(2)}</span></div><div class="nxt-no-tax">Sales tax: $0.00</div></div>
        <div class="nxt-checkout-error"></div>
        <div class="nxt-checkout-actions"><button type="button" class="nxt-checkout-cancel">Cancel</button><button type="button" class="nxt-checkout-continue">Continue to Wallet Payment →</button></div>
      </div>`;

      const addressWrap=overlay.querySelector('.nxt-address-fields');
      const pickupNote=overlay.querySelector('.nxt-pickup-note');
      const shippingLabel=overlay.querySelector('#nxtShippingLabel');
      const shippingEl=overlay.querySelector('#nxtShipping');
      const totalEl=overlay.querySelector('#nxtTotal');
      const errorEl=overlay.querySelector('.nxt-checkout-error');
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
      };
      overlay.querySelectorAll('.nxt-fulfillment').forEach(btn=>btn.onclick=()=>{fulfillment=btn.dataset.mode;refresh();saveDraft();});
      overlay.querySelectorAll('input').forEach(input=>input.addEventListener('input',saveDraft));
      overlay.querySelector('.nxt-checkout-cancel').onclick=()=>{overlay.remove();resolve(null);};
      overlay.querySelector('.nxt-checkout-continue').onclick=()=>{
        const val=s=>(overlay.querySelector(s)?.value||'').trim();
        const customer={name:val('#nxtName'),email:val('#nxtEmail'),phone:val('#nxtPhone'),address:val('#nxtAddress'),unit:val('#nxtUnit'),city:val('#nxtCity'),state:val('#nxtState'),zip:val('#nxtZip')};
        const required=[customer.name,customer.email,customer.phone];if(fulfillment==='shipping')required.push(customer.address,customer.city,customer.state,customer.zip);
        if(required.some(v=>!v)){errorEl.textContent=fulfillment==='shipping'?'Please complete your contact and shipping information.':'Please enter your name, email and phone number.';errorEl.classList.add('show');return;}
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)){errorEl.textContent='Please enter a valid email address.';errorEl.classList.add('show');return;}
        const shipping=fulfillment==='pickup'?0:SHIPPING_FEE;
        writeCheckoutDraft({fulfillment,customer});
        overlay.remove();resolve({fulfillment,shipping,total:base+shipping,customer});
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
