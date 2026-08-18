(() => {
  if (window.__nxtPaymentHandoffFixLoaded) return;
  window.__nxtPaymentHandoffFixLoaded = true;

  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function currentCartItems() {
    try { return Array.isArray(cart) ? cart : []; } catch (_) { return []; }
  }

  function subtotalFromCart() {
    try {
      return currentCartItems().reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    } catch (_) {
      return 0;
    }
  }

  function makeOverlay(innerHtml, width = 460) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.84);display:flex;align-items:center;justify-content:center;padding:18px;z-index:1000001;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    overlay.innerHTML = `<div style="width:min(${width}px,94vw);max-height:92vh;overflow:auto;background:linear-gradient(155deg,#12121b,#090910);border:1px solid rgba(167,139,250,.34);border-radius:18px;padding:26px;color:#fff;box-shadow:0 30px 90px rgba(0,0,0,.7)">${innerHtml}</div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  function chooseCrypto(amount) {
    return new Promise(resolve => {
      const overlay = makeOverlay(`
        <div style="color:#c4b5fd;font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:7px">Secure Payment</div>
        <h2 style="margin:0 0 8px;font-size:26px">Choose Cryptocurrency</h2>
        <p style="margin:0 0 18px;color:#a5a5b5;font-size:12px;line-height:1.5">Order total: <b style="color:#fff">$${Number(amount).toFixed(2)}</b></p>
        <div id="nxtCryptoChoices" style="display:grid;gap:9px"></div>
        <button id="nxtCryptoCancel" type="button" style="width:100%;margin-top:12px;padding:13px;border:0;border-radius:10px;background:#262631;color:#aaa;font-weight:800;cursor:pointer">Cancel</button>
      `);

      const choices = [
        ['btc','Bitcoin (BTC)'],
        ['eth','Ethereum (ETH)'],
        ['ltc','Litecoin (LTC)'],
        ['usdttrc20','USDT (TRC20)']
      ];
      const wrap = overlay.querySelector('#nxtCryptoChoices');
      choices.forEach(([code,label]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.style.cssText = 'width:100%;padding:14px;border:1px solid rgba(167,139,250,.24);border-radius:10px;background:linear-gradient(100deg,#7c3aed,#8b5cf6);color:#fff;font-weight:850;cursor:pointer';
        btn.onclick = () => { overlay.remove(); resolve(code); };
        wrap.appendChild(btn);
      });
      overlay.querySelector('#nxtCryptoCancel').onclick = () => { overlay.remove(); resolve(null); };
    });
  }

  function showLoading() {
    return makeOverlay(`
      <div style="text-align:center;padding:12px 4px">
        <div style="font-size:22px;margin-bottom:10px">Creating payment…</div>
        <div style="color:#a5a5b5;font-size:12px">Please keep this page open.</div>
      </div>
    `, 420);
  }

  function showPayment(data) {
    const currency = String(data.pay_currency || '').toUpperCase();
    const amount = data.pay_amount;
    const address = data.pay_address || '';
    const overlay = makeOverlay(`
      <div style="color:#c4b5fd;font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:7px">Crypto Payment</div>
      <h2 style="margin:0 0 18px;font-size:26px">Send exactly</h2>
      <div style="font-size:23px;font-weight:900;color:#c4b5fd;margin-bottom:18px">${esc(amount)} ${esc(currency)}</div>
      <div style="color:#aaa;font-size:11px;margin-bottom:7px">Payment address</div>
      <div style="background:#1d1d27;border:1px solid rgba(255,255,255,.08);padding:12px;border-radius:10px;word-break:break-all;font-size:12px">${esc(address)}</div>
      <button id="nxtCopyAddress" type="button" style="width:100%;margin-top:11px;padding:13px;border:0;border-radius:10px;background:linear-gradient(100deg,#7c3aed,#9f55ff);color:#fff;font-weight:850;cursor:pointer">Copy Address</button>
      <div style="margin-top:16px;color:#777;font-size:10px">Payment ID: ${esc(data.payment_id || '')}</div>
      <button id="nxtClosePayment" type="button" style="width:100%;margin-top:14px;padding:13px;border:0;border-radius:10px;background:#292934;color:#bbb;font-weight:800;cursor:pointer">Done</button>
    `);

    overlay.querySelector('#nxtCopyAddress').onclick = async (e) => {
      try {
        await navigator.clipboard.writeText(address);
        e.currentTarget.textContent = 'Copied ✓';
      } catch (_) {
        e.currentTarget.textContent = 'Copy failed — select address above';
      }
    };
    overlay.querySelector('#nxtClosePayment').onclick = () => overlay.remove();
  }

  async function createPayment(details) {
    const payCurrency = await chooseCrypto(details.total);
    if (!payCurrency) return;

    const loading = showLoading();
    try {
      const res = await fetch('/api/create-nowpayment', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          amount: Number(details.total),
          payCurrency,
          orderId: 'NXT-' + Date.now(),
          description: 'NXT LVL Research order'
        })
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      loading.remove();
      if (!res.ok || !data.pay_address || !data.pay_amount) {
        alert(data.message || data.error || 'Unable to create payment. Please try again.');
        return;
      }
      showPayment(data);
    } catch (err) {
      loading.remove();
      console.error('NXT payment handoff error:', err);
      alert('Payment setup failed. Please try again.');
    }
  }

  function readDetailsFromOverlay(overlay) {
    const val = sel => (overlay.querySelector(sel)?.value || '').trim();
    const pickup = overlay.querySelector('.nxt-fulfillment[data-mode="pickup"]')?.classList.contains('active');
    const fulfillment = pickup ? 'pickup' : 'shipping';
    const customer = {
      name: val('#nxtName'), email: val('#nxtEmail'), phone: val('#nxtPhone'),
      address: val('#nxtAddress'), unit: val('#nxtUnit'), city: val('#nxtCity'), state: val('#nxtState'), zip: val('#nxtZip')
    };
    const required = [customer.name, customer.email, customer.phone];
    if (fulfillment === 'shipping') required.push(customer.address, customer.city, customer.state, customer.zip);
    const errorEl = overlay.querySelector('.nxt-checkout-error');
    if (required.some(v => !v)) {
      if (errorEl) {
        errorEl.textContent = fulfillment === 'shipping' ? 'Please complete your contact and shipping information.' : 'Please enter your name, email and phone number.';
        errorEl.classList.add('show');
      }
      return null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      if (errorEl) { errorEl.textContent = 'Please enter a valid email address.'; errorEl.classList.add('show'); }
      return null;
    }
    if (fulfillment === 'pickup') Object.assign(customer, {address:'LOCAL PICKUP', unit:'', city:'', state:'', zip:''});
    const shipping = fulfillment === 'pickup' ? 0 : 10;
    return { fulfillment, shipping, total: subtotalFromCart() + shipping, customer };
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.nxt-checkout-continue');
    if (!button) return;
    const overlay = button.closest('.nxt-checkout-overlay');
    if (!overlay) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const details = readDetailsFromOverlay(overlay);
    if (!details) return;

    window.nxtCheckoutDetails = details;
    fetch('/api/checkout-lead', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({customer:{...details.customer,fulfillment:details.fulfillment},items:currentCartItems(),amount:details.total,fulfillment:details.fulfillment,shipping:details.shipping})
    }).catch(() => {});

    overlay.remove();
    createPayment(details);
  }, true);
})();
