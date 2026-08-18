// NXT LVL data loader + checkout override
// Load the original product database synchronously so index.html can use compounds/categories/stacks immediately.
document.write('<script src="/products-data-original.js?v=1"><\/script>');

window.addEventListener('DOMContentLoaded', () => {
  const SHIPPING_FEE = 10;
  const SALES_TAX_RATE = 0.07;

  function money(value) { return '$' + Number(value || 0).toFixed(2); }
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function makeOverlay(innerHTML) {
    const overlay = document.createElement('div');
    overlay.innerHTML = innerHTML;
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,8,.94);display:flex;align-items:center;justify-content:center;padding:24px;z-index:999999;overflow:auto;backdrop-filter:blur(12px);';
    document.body.appendChild(overlay);
    return overlay;
  }

  async function collectCustomerInfo() {
    return new Promise((resolve) => {
      const overlay = makeOverlay(`
        <div style="background:linear-gradient(145deg,#111118,#0b0b12);color:#fff;width:580px;max-width:94vw;padding:30px;border:1px solid rgba(167,139,250,.28);border-radius:18px;box-shadow:0 28px 90px rgba(0,0,0,.75);font-family:Inter,-apple-system,sans-serif;margin:auto;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a78bfa;margin-bottom:8px;font-weight:700;">Secure Checkout</div>
          <h2 style="margin:0 0 7px;font-size:25px;">Customer Information</h2>
          <p style="margin:0 0 20px;color:#9999aa;font-size:13px;">Enter your contact and shipping information. Your email is used for payment confirmation. By continuing, your contact information and cart details are submitted with your checkout request.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><input id="checkoutName" autocomplete="name" placeholder="Full name"><input id="checkoutPhone" autocomplete="tel" placeholder="Phone number"></div>
          <input id="checkoutEmail" type="email" autocomplete="email" placeholder="Email address"><input id="checkoutAddress" autocomplete="street-address" placeholder="Street address"><input id="checkoutUnit" autocomplete="address-line2" placeholder="Apt / Unit (optional)">
          <div style="display:grid;grid-template-columns:1.3fr .8fr .8fr;gap:12px;"><input id="checkoutCity" autocomplete="address-level2" placeholder="City"><input id="checkoutState" autocomplete="address-level1" placeholder="State"><input id="checkoutZip" autocomplete="postal-code" placeholder="ZIP code"></div>
          <div id="checkoutCustomerError" style="display:none;margin:8px 0 0;color:#fca5a5;font-size:13px;">Please complete all required fields with a valid email.</div>
          <button id="customerContinue" style="width:100%;margin-top:18px;padding:14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;border:0;border-radius:10px;cursor:pointer;font-weight:800;">Continue to Payment</button>
          <button id="customerCancel" style="width:100%;margin-top:10px;padding:12px;background:#20202a;color:#fff;border:1px solid rgba(255,255,255,.08);border-radius:10px;cursor:pointer;">Cancel</button>
        </div>`);
      overlay.querySelectorAll('input').forEach(input => input.style.cssText='width:100%;margin:6px 0;padding:13px 14px;background:#171721;color:#fff;border:1px solid rgba(255,255,255,.10);border-radius:10px;outline:none;font-size:14px;box-sizing:border-box;');
      overlay.querySelector('#customerContinue').onclick=()=>{ const customer={name:overlay.querySelector('#checkoutName').value.trim(),phone:overlay.querySelector('#checkoutPhone').value.trim(),email:overlay.querySelector('#checkoutEmail').value.trim(),address:overlay.querySelector('#checkoutAddress').value.trim(),unit:overlay.querySelector('#checkoutUnit').value.trim(),city:overlay.querySelector('#checkoutCity').value.trim(),state:overlay.querySelector('#checkoutState').value.trim(),zip:overlay.querySelector('#checkoutZip').value.trim()}; const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email); if(!customer.name||!customer.phone||!validEmail||!customer.address||!customer.city||!customer.state||!customer.zip){overlay.querySelector('#checkoutCustomerError').style.display='block';return;} sessionStorage.setItem('nxtlvlCustomerInfo',JSON.stringify(customer)); overlay.remove(); resolve(customer); };
      overlay.querySelector('#customerCancel').onclick=()=>{overlay.remove();resolve(null);}; overlay.onclick=e=>{if(e.target===overlay){overlay.remove();resolve(null);}};
    });
  }

  async function chooseCrypto() {
    return new Promise(resolve=>{
      const overlay=makeOverlay(`<div style="background:linear-gradient(145deg,#111118,#0b0b12);color:#fff;width:440px;max-width:92vw;padding:28px;border:1px solid rgba(167,139,250,.28);border-radius:18px;box-shadow:0 28px 90px rgba(0,0,0,.75);font-family:Inter,-apple-system,sans-serif;"><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a78bfa;margin-bottom:8px;font-weight:700;">Crypto Checkout</div><h2 style="margin:0 0 6px;font-size:24px;">Choose Cryptocurrency</h2><p style="margin:0 0 20px;color:#9999aa;font-size:14px;">Select the network you want to use.</p><button data-crypto="btc">₿ Bitcoin <span>BTC</span></button><button data-crypto="eth">◆ Ethereum <span>ETH</span></button><button data-crypto="ltc">Ł Litecoin <span>LTC</span></button><button data-crypto="usdttrc20">₮ Tether <span>USDT (TRC20)</span></button><button id="cancelCrypto">Cancel</button></div>`);
      overlay.querySelectorAll('button').forEach(b=>b.style.cssText='width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:7px 0;padding:14px 16px;background:#171721;color:#fff;border:1px solid rgba(255,255,255,.09);border-radius:10px;cursor:pointer;font-size:15px;font-weight:650;text-align:left;'); overlay.querySelector('#cancelCrypto').style.background='#25252f'; overlay.querySelectorAll('[data-crypto]').forEach(b=>b.onclick=()=>{const c=b.dataset.crypto;overlay.remove();resolve(c);}); overlay.querySelector('#cancelCrypto').onclick=()=>{overlay.remove();resolve(null);}; overlay.onclick=e=>{if(e.target===overlay){overlay.remove();resolve(null);}};
    });
  }

  function showPayment(data, customer, items, subtotal, tax, total) {
    const currency=String(data.pay_currency||'').toUpperCase();
    const itemRows=items.map(i=>`<div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05);"><div><strong>${escapeHtml(i.name)}</strong><div style="color:#88889a;font-size:12px;">${escapeHtml(i.label||'')} · Qty ${i.qty}</div></div><div style="white-space:nowrap;">${money(i.price*i.qty)}</div></div>`).join('');
    const overlay=makeOverlay(`
      <div style="width:1120px;max-width:96vw;font-family:Inter,-apple-system,sans-serif;color:#fff;margin:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin:0 2px 16px;"><div><div style="font-size:11px;letter-spacing:2px;color:#a78bfa;text-transform:uppercase;font-weight:800;">Payment Created</div><div style="font-size:13px;color:#858598;margin-top:4px;">Secure crypto checkout</div></div><div style="font-size:12px;color:#b9b9c8;">🔒 Secure Checkout</div></div>
        <div style="display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.9fr);gap:16px;">
          <section style="background:linear-gradient(145deg,#111118,#0b0b12);border:1px solid rgba(167,139,250,.22);border-radius:18px;padding:30px;box-shadow:0 28px 90px rgba(0,0,0,.6);">
            <div style="text-align:center;margin-bottom:22px;"><div style="width:42px;height:42px;border:2px solid #a78bfa;border-radius:50%;display:grid;place-items:center;margin:0 auto 10px;color:#a78bfa;font-size:22px;">✓</div><h2 style="margin:0;font-size:27px;">Complete Your Payment</h2><p style="margin:7px 0 0;color:#9999aa;font-size:13px;">Send the exact amount below to the address provided.</p></div>
            <div style="background:#101019;border:1px solid rgba(255,255,255,.07);border-radius:13px;overflow:hidden;">
              <div style="padding:20px;"><div style="font-size:12px;color:#aaaabb;">Send Exactly</div><div style="font-size:27px;font-weight:850;color:#a78bfa;margin:4px 0 12px;word-break:break-word;">${escapeHtml(data.pay_amount)} ${escapeHtml(currency)}</div><button id="copyCryptoAmount" style="padding:10px 14px;background:#211832;color:#c4a7ff;border:1px solid rgba(167,139,250,.25);border-radius:8px;cursor:pointer;font-weight:700;">▣ Copy Amount</button></div>
              <div style="padding:18px 20px;border-top:1px solid rgba(255,255,255,.06);"><div style="font-size:12px;color:#aaaabb;margin-bottom:7px;">Payment Address</div><div style="display:flex;gap:8px;align-items:center;"><div style="flex:1;background:#171721;border:1px solid rgba(255,255,255,.09);padding:12px;border-radius:9px;word-break:break-all;font-size:13px;">${escapeHtml(data.pay_address||'')}</div><button id="copyCryptoAddress" style="padding:12px;background:#252532;color:#fff;border:1px solid rgba(255,255,255,.09);border-radius:9px;cursor:pointer;white-space:nowrap;">▣ Copy Address</button></div><div style="margin-top:9px;color:#77778a;font-size:11px;">Send only ${escapeHtml(currency)} to this payment address.</div></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;"><div style="padding:15px;text-align:center;background:#101019;border:1px solid rgba(255,255,255,.06);border-radius:11px;"><div style="color:#a78bfa;font-size:21px;">♢</div><strong style="font-size:12px;">Secure Payment</strong><div style="font-size:11px;color:#858598;margin-top:4px;">Encrypted checkout</div></div><div style="padding:15px;text-align:center;background:#101019;border:1px solid rgba(255,255,255,.06);border-radius:11px;"><div style="color:#a78bfa;font-size:21px;">⚡</div><strong style="font-size:12px;">Auto Confirmation</strong><div style="font-size:11px;color:#858598;margin-top:4px;">Payment detected automatically</div></div><div style="padding:15px;text-align:center;background:#101019;border:1px solid rgba(255,255,255,.06);border-radius:11px;"><div style="color:#a78bfa;font-size:21px;">▣</div><strong style="font-size:12px;">Fast Shipping</strong><div style="font-size:11px;color:#858598;margin-top:4px;">Tracking within 48 hours or less</div></div></div>
            <div style="margin-top:16px;padding:15px 17px;border:1px dashed #7c3aed;border-radius:10px;background:rgba(124,58,237,.07);color:#c7c7d4;font-size:12px;">Your order will be processed after payment confirmation. <strong style="color:#fff;">Tracking number will be received within 48 hours or less.</strong></div>
            <div style="margin-top:16px;font-size:12px;color:#77778a;">Payment ID: ${escapeHtml(data.payment_id||'')}</div><button id="closePaymentBox" style="width:100%;margin-top:14px;padding:13px;background:#25252f;color:#fff;border:1px solid rgba(255,255,255,.08);border-radius:10px;cursor:pointer;">Done</button>
          </section>
          <aside style="background:linear-gradient(145deg,#111118,#0b0b12);border:1px solid rgba(167,139,250,.22);border-radius:18px;padding:24px;box-shadow:0 28px 90px rgba(0,0,0,.6);height:max-content;"><div style="font-size:13px;color:#a78bfa;font-weight:800;letter-spacing:.5px;margin-bottom:10px;">ORDER SUMMARY</div>${itemRows}<div style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:13px;"><div style="display:flex;justify-content:space-between;margin:7px 0;"><span style="color:#aaaabb;">Subtotal</span><span>${money(subtotal)}</span></div><div style="display:flex;justify-content:space-between;margin:7px 0;"><span style="color:#aaaabb;">Shipping</span><span>${money(SHIPPING_FEE)}</span></div><div style="display:flex;justify-content:space-between;margin:7px 0;"><span style="color:#aaaabb;">Sales Tax (7%)</span><span>${money(tax)}</span></div></div><div style="display:flex;justify-content:space-between;align-items:center;padding:18px 0;font-size:18px;font-weight:850;"><span>Total</span><span style="color:#a78bfa;">${money(total)} USD</span></div><div style="padding:14px;background:#101019;border-radius:10px;font-size:12px;color:#aaaabb;line-height:1.6;"><strong style="color:#fff;">Confirmation email</strong><br>${escapeHtml(customer.email)}<br><br><strong style="color:#fff;">Shipping to</strong><br>${escapeHtml(customer.name)}<br>${escapeHtml(customer.address)}${customer.unit?', '+escapeHtml(customer.unit):''}<br>${escapeHtml(customer.city)}, ${escapeHtml(customer.state)} ${escapeHtml(customer.zip)}<br>${escapeHtml(customer.phone)}</div></aside>
        </div>
      </div>`);
    const copy=(selector,text,label)=>{overlay.querySelector(selector).onclick=async()=>{const b=overlay.querySelector(selector);try{await navigator.clipboard.writeText(String(text));b.textContent='Copied ✓';setTimeout(()=>b.textContent=label,1800);}catch(_){window.prompt('Copy:',String(text));}};}; copy('#copyCryptoAmount',data.pay_amount,'▣ Copy Amount'); copy('#copyCryptoAddress',data.pay_address,'▣ Copy Address'); overlay.querySelector('#closePaymentBox').onclick=()=>overlay.remove();
  }

  window.proceedToCheckout=async function(){
    try{
      if(typeof cart==='undefined'||!Array.isArray(cart)||cart.length===0)return;
      const customer=await collectCustomerInfo(); if(!customer)return;
      const subtotal=typeof cartSubtotal==='function'?cartSubtotal():cart.reduce((s,l)=>s+Number(l.price||0)*Number(l.qty||0),0);
      const tax=Number((subtotal*SALES_TAX_RATE).toFixed(2)); const total=Number((subtotal+tax+SHIPPING_FEE).toFixed(2));
      const items=cart.map(line=>({name:line.name,label:line.label,price:Number(line.price||0),qty:Number(line.qty||0)}));
      fetch('/api/checkout-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer,items,amount:total,subtotal,tax,shipping:SHIPPING_FEE})}).catch(error=>console.error('Checkout lead notification failed:',error));
      const payCurrency=await chooseCrypto(); if(!payCurrency)return;
      const orderId='NXT-'+Date.now();
      const response=await fetch('/api/create-nowpayment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:total,payCurrency,orderId,customer,items,subtotal,tax,shipping:SHIPPING_FEE})});
      let data; try{data=await response.json();}catch(_){throw new Error('Payment server returned an invalid response.');} if(!response.ok)throw new Error(data.message||data.error||'Unable to create payment'); showPayment(data,customer,items,subtotal,tax,total);
    }catch(error){console.error('Checkout error:',error);alert(error&&error.message?error.message:'Payment setup failed. Please try again.');}
  };
  const checkoutBtn=document.getElementById('cartCheckoutBtn'); if(checkoutBtn)checkoutBtn.onclick=e=>{e.preventDefault();window.proceedToCheckout();};
});
