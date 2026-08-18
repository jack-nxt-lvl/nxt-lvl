(() => {
  const SHIPPING_FEE = 10;
  const originalProceed = window.proceedToCheckout;

  const style = document.createElement('style');
  style.textContent = `
    .nxt-checkout-overlay{position:fixed;inset:0;z-index:1000000;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-checkout-card{width:min(680px,96vw);max-height:94vh;overflow:auto;padding:28px;border-radius:22px;border:1px solid rgba(167,139,250,.34);background:radial-gradient(circle at 50% -15%,rgba(124,58,237,.18),transparent 42%),linear-gradient(155deg,#12121b,#090910);box-shadow:0 38px 110px rgba(0,0,0,.72);color:#fff;position:relative}
    .nxt-checkout-card:before{content:'';position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,#2563eb,#8b5cf6,#d946ef)}
    .nxt-checkout-steps{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:22px;color:#818194;font-size:10px;font-weight:800}.nxt-checkout-step{display:flex;align-items:center;gap:6px}.nxt-checkout-step b{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:#1a1a24;border:1px solid rgba(255,255,255,.12);color:#aaa}.nxt-checkout-step.on{color:#fff}.nxt-checkout-step.on b{background:linear-gradient(135deg,#9f67ff,#6d28d9);border-color:#a78bfa;color:#fff}.nxt-checkout-line{width:34px;height:1px;background:rgba(255,255,255,.12)}
    .nxt-checkout-kicker{color:#c4b5fd;font-size:10px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase;margin-bottom:7px}.nxt-checkout-card h2{font-size:28px;margin:0 0 7px}.nxt-checkout-intro{font-size:12px;line-height:1.55;color:#a5a5b5;margin-bottom:18px}
    .nxt-fulfillment-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 18px}.nxt-fulfillment{border:1px solid rgba(255,255,255,.10);border-radius:14px;background:linear-gradient(145deg,#181822,#101017);padding:15px;cursor:pointer;color:#fff;text-align:left;transition:.16s ease}.nxt-fulfillment:hover{border-color:rgba(167,139,250,.38)}.nxt-fulfillment.active{border-color:#8b5cf6;box-shadow:0 0 0 2px rgba(124,58,237,.14);background:linear-gradient(145deg,rgba(124,58,237,.18),#12121b)}.nxt-fulfillment strong{display:block;font-size:13px}.nxt-fulfillment span{display:block;color:#9999aa;font-size:10px;margin-top:4px;line-height:1.4}.nxt-fulfillment .price{color:#c4b5fd;font-weight:900;font-size:12px;margin-top:7px}
    .nxt-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nxt-field-grid .wide{grid-column:1/-1}.nxt-checkout-card input{width:100%;min-height:48px;margin:0;padding:13px 14px;background:linear-gradient(145deg,#181822,#12121b);border:1px solid rgba(255,255,255,.10);border-radius:10px;color:#fff;font-size:13px;outline:none}.nxt-checkout-card input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(124,58,237,.13)}.nxt-checkout-card input::placeholder{color:#7f7f91}
    .nxt-address-fields.hidden{display:none}.nxt-pickup-note{display:none;margin:4px 0 12px;padding:12px 13px;border:1px solid rgba(52,211,153,.20);border-radius:10px;background:rgba(16,185,129,.07);color:#b7e9d2;font-size:10.5px;line-height:1.5}.nxt-pickup-note.show{display:block}
    .nxt-order-summary{margin-top:16px;padding:14px 15px;border:1px solid rgba(167,139,250,.20);border-radius:12px;background:rgba(124,58,237,.06)}.nxt-summary-row{display:flex;justify-content:space-between;gap:12px;color:#a8a8b8;font-size:11px;padding:4px 0}.nxt-summary-row.total{border-top:1px solid rgba(255,255,255,.08);margin-top:5px;padding-top:10px;color:#fff;font-size:15px;font-weight:900}.nxt-summary-row.total span:last-child{color:#c4b5fd}.nxt-no-tax{color:#78788b;font-size:9.5px;margin-top:7px}
    .nxt-checkout-actions{display:grid;grid-template-columns:1fr 1.7fr;gap:9px;margin-top:17px}.nxt-checkout-actions button{min-height:50px;border-radius:11px;border:0;font-weight:850;cursor:pointer}.nxt-checkout-cancel{background:#242431;color:#aaa}.nxt-checkout-continue{background:linear-gradient(100deg,#7c3aed,#9f55ff 55%,#6d28d9);color:#fff;box-shadow:0 12px 34px rgba(124,58,237,.26)}.nxt-checkout-error{display:none;color:#fca5a5;font-size:10px;margin-top:10px}.nxt-checkout-error.show{display:block}
    @media(max-width:620px){.nxt-checkout-card{padding:22px 16px}.nxt-checkout-card h2{font-size:24px}.nxt-fulfillment-grid,.nxt-field-grid,.nxt-checkout-actions{grid-template-columns:1fr}.nxt-field-grid .wide{grid-column:auto}.nxt-checkout-line{width:18px}.nxt-checkout-steps{font-size:8.5px;gap:6px}}
  `;
  document.head.appendChild(style);

  function subtotal(){
    try { return Number(cartSubtotal()) || 0; } catch (_) { return 0; }
  }

  function showCustomerCheckout(){
    return new Promise(resolve => {
      let fulfillment = 'shipping';
      const base = subtotal();
      const overlay = document.createElement('div');
      overlay.className = 'nxt-checkout-overlay';
      overlay.innerHTML = `
        <div class="nxt-checkout-card">
          <div class="nxt-checkout-steps"><span class="nxt-checkout-step on"><b>1</b>Information</span><i class="nxt-checkout-line"></i><span class="nxt-checkout-step"><b>2</b>Payment</span><i class="nxt-checkout-line"></i><span class="nxt-checkout-step"><b>3</b>Confirmation</span></div>
          <div class="nxt-checkout-kicker">🔒 Secure Checkout</div>
          <h2>How would you like your order?</h2>
          <div class="nxt-checkout-intro">Choose shipping or local pickup. Local pickup removes the $10 shipping charge.</div>
          <div class="nxt-fulfillment-grid">
            <button type="button" class="nxt-fulfillment active" data-mode="shipping"><strong>📦 Ship My Order</strong><span>Enter the delivery address below.</span><span class="price">$10 shipping</span></button>
            <button type="button" class="nxt-fulfillment" data-mode="pickup"><strong>📍 Local Pickup</strong><span>For local customers who will pick up their order.</span><span class="price">FREE — no shipping fee</span></button>
          </div>
          <div class="nxt-field-grid">
            <input id="nxtName" class="wide" autocomplete="name" placeholder="Full name *">
            <input id="nxtEmail" autocomplete="email" inputmode="email" placeholder="Email *">
            <input id="nxtPhone" autocomplete="tel" inputmode="tel" placeholder="Phone number *">
          </div>
          <div class="nxt-address-fields">
            <div class="nxt-field-grid" style="margin-top:8px">
              <input id="nxtAddress" class="wide" autocomplete="street-address" placeholder="Street address *">
              <input id="nxtUnit" placeholder="Apt / Unit">
              <input id="nxtCity" autocomplete="address-level2" placeholder="City *">
              <input id="nxtState" autocomplete="address-level1" placeholder="State *">
              <input id="nxtZip" autocomplete="postal-code" inputmode="numeric" placeholder="ZIP code *">
            </div>
          </div>
          <div class="nxt-pickup-note">Local pickup selected. The $10 shipping fee is removed. Pickup details can be coordinated after the order is confirmed.</div>
          <div class="nxt-order-summary">
            <div class="nxt-summary-row"><span>Subtotal</span><span id="nxtSub">$${base.toFixed(2)}</span></div>
            <div class="nxt-summary-row"><span id="nxtShippingLabel">Shipping</span><span id="nxtShipping">$${SHIPPING_FEE.toFixed(2)}</span></div>
            <div class="nxt-summary-row total"><span>Total</span><span id="nxtTotal">$${(base + SHIPPING_FEE).toFixed(2)}</span></div>
            <div class="nxt-no-tax">No sales tax is added at checkout.</div>
          </div>
          <div class="nxt-checkout-error"></div>
          <div class="nxt-checkout-actions"><button type="button" class="nxt-checkout-cancel">Cancel</button><button type="button" class="nxt-checkout-continue">Continue to Payment →</button></div>
        </div>`;

      const addressWrap = overlay.querySelector('.nxt-address-fields');
      const pickupNote = overlay.querySelector('.nxt-pickup-note');
      const shippingEl = overlay.querySelector('#nxtShipping');
      const shippingLabel = overlay.querySelector('#nxtShippingLabel');
      const totalEl = overlay.querySelector('#nxtTotal');
      const errorEl = overlay.querySelector('.nxt-checkout-error');

      function refresh(){
        const fee = fulfillment === 'pickup' ? 0 : SHIPPING_FEE;
        addressWrap.classList.toggle('hidden', fulfillment === 'pickup');
        pickupNote.classList.toggle('show', fulfillment === 'pickup');
        shippingLabel.textContent = fulfillment === 'pickup' ? 'Local pickup' : 'Shipping';
        shippingEl.textContent = fee === 0 ? '$0.00' : '$' + fee.toFixed(2);
        totalEl.textContent = '$' + (base + fee).toFixed(2);
        overlay.querySelectorAll('.nxt-fulfillment').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === fulfillment));
      }

      overlay.querySelectorAll('.nxt-fulfillment').forEach(btn => btn.onclick = () => { fulfillment = btn.dataset.mode; refresh(); });
      overlay.querySelector('.nxt-checkout-cancel').onclick = () => { overlay.remove(); resolve(null); };
      overlay.addEventListener('click', e => { if(e.target === overlay){ overlay.remove(); resolve(null); } });
      overlay.querySelector('.nxt-checkout-continue').onclick = () => {
        const val = id => (overlay.querySelector(id)?.value || '').trim();
        const customer = { name:val('#nxtName'), email:val('#nxtEmail'), phone:val('#nxtPhone'), address:val('#nxtAddress'), unit:val('#nxtUnit'), city:val('#nxtCity'), state:val('#nxtState'), zip:val('#nxtZip') };
        const required = [customer.name, customer.email, customer.phone];
        if(fulfillment === 'shipping') required.push(customer.address, customer.city, customer.state, customer.zip);
        if(required.some(v => !v)){
          errorEl.textContent = fulfillment === 'shipping' ? 'Please complete your contact and shipping information.' : 'Please enter your name, email and phone number.';
          errorEl.classList.add('show');
          return;
        }
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)){
          errorEl.textContent = 'Please enter a valid email address.'; errorEl.classList.add('show'); return;
        }
        if(fulfillment === 'pickup'){
          customer.address = 'LOCAL PICKUP'; customer.unit = ''; customer.city = ''; customer.state = ''; customer.zip = '';
        }
        const shipping = fulfillment === 'pickup' ? 0 : SHIPPING_FEE;
        overlay.remove();
        resolve({ fulfillment, shipping, total:base + shipping, customer });
      };

      document.body.appendChild(overlay);
      setTimeout(() => overlay.querySelector('#nxtName')?.focus(), 50);
    });
  }

  async function sendCheckoutLead(details){
    try {
      await fetch('/api/checkout-lead', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          customer:{...details.customer, fulfillment:details.fulfillment},
          items:typeof cart !== 'undefined' ? cart : [],
          amount:details.total,
          fulfillment:details.fulfillment,
          shipping:details.shipping
        })
      });
    } catch (_) {}
  }

  if (typeof originalProceed === 'function') {
    window.proceedToCheckout = async function(){
      try { if(typeof cart !== 'undefined' && cart.length === 0) return; } catch (_) {}
      const details = await showCustomerCheckout();
      if(!details) return;
      window.nxtCheckoutDetails = details;
      sendCheckoutLead(details);

      const originalSubtotal = window.cartSubtotal;
      const adjustedSubtotal = () => details.total;
      try {
        window.cartSubtotal = adjustedSubtotal;
        await originalProceed();
      } finally {
        window.cartSubtotal = originalSubtotal;
      }
    };
  }
})();
