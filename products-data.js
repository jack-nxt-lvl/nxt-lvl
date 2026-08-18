// NXT LVL data loader + checkout hotfix
// Load the original product database synchronously so the rest of index.html keeps working unchanged.
document.write('<script src="/products-data-original.js?v=1"><\/script>');

window.addEventListener('DOMContentLoaded', () => {
  function makeOverlay(innerHTML) {
    const overlay = document.createElement('div');
    overlay.innerHTML = innerHTML;
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,.82)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:20px',
      'z-index:999999',
      'overflow:auto'
    ].join(';');
    document.body.appendChild(overlay);
    return overlay;
  }

  async function collectCustomerInfo() {
    return new Promise((resolve) => {
      const overlay = makeOverlay(`
        <div style="background:#111118;color:#fff;width:560px;max-width:94vw;padding:28px;border:1px solid rgba(124,58,237,.28);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.65);font-family:Inter,-apple-system,sans-serif;margin:auto;">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a78bfa;margin-bottom:8px;">Checkout</div>
          <h2 style="margin:0 0 6px;font-size:24px;">Customer Information</h2>
          <p style="margin:0 0 20px;color:#9999aa;font-size:14px;">Enter the shipping details for your order.</p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <input id="checkoutName" autocomplete="name" placeholder="Full name" />
            <input id="checkoutPhone" autocomplete="tel" placeholder="Phone number" />
          </div>

          <input id="checkoutEmail" type="email" autocomplete="email" placeholder="Email address" />
          <input id="checkoutAddress" autocomplete="street-address" placeholder="Street address" />
          <input id="checkoutUnit" autocomplete="address-line2" placeholder="Apt / Unit (optional)" />

          <div style="display:grid;grid-template-columns:1.3fr .8fr .8fr;gap:12px;">
            <input id="checkoutCity" autocomplete="address-level2" placeholder="City" />
            <input id="checkoutState" autocomplete="address-level1" placeholder="State" />
            <input id="checkoutZip" autocomplete="postal-code" placeholder="ZIP code" />
          </div>

          <div id="checkoutCustomerError" style="display:none;margin:8px 0 0;color:#fca5a5;font-size:13px;">Please complete all required fields.</div>

          <button id="customerContinue" style="width:100%;margin-top:18px;padding:14px;background:#7c3aed;color:#fff;border:0;border-radius:10px;cursor:pointer;font-weight:700;">Continue to Payment</button>
          <button id="customerCancel" style="width:100%;margin-top:10px;padding:12px;background:#292933;color:#fff;border:0;border-radius:10px;cursor:pointer;">Cancel</button>
        </div>
      `);

      overlay.querySelectorAll('input').forEach((input) => {
        input.style.cssText = 'width:100%;margin:6px 0;padding:13px 14px;background:#1d1d27;color:#fff;border:1px solid rgba(255,255,255,.10);border-radius:10px;outline:none;font-size:14px;box-sizing:border-box;';
      });

      const finish = () => {
        const customer = {
          name: overlay.querySelector('#checkoutName').value.trim(),
          phone: overlay.querySelector('#checkoutPhone').value.trim(),
          email: overlay.querySelector('#checkoutEmail').value.trim(),
          address: overlay.querySelector('#checkoutAddress').value.trim(),
          unit: overlay.querySelector('#checkoutUnit').value.trim(),
          city: overlay.querySelector('#checkoutCity').value.trim(),
          state: overlay.querySelector('#checkoutState').value.trim(),
          zip: overlay.querySelector('#checkoutZip').value.trim()
        };

        if (!customer.name || !customer.phone || !customer.email || !customer.address || !customer.city || !customer.state || !customer.zip) {
          overlay.querySelector('#checkoutCustomerError').style.display = 'block';
          return;
        }

        sessionStorage.setItem('nxtlvlCustomerInfo', JSON.stringify(customer));
        overlay.remove();
        resolve(customer);
      };

      overlay.querySelector('#customerContinue').onclick = finish;
      overlay.querySelector('#customerCancel').onclick = () => {
        overlay.remove();
        resolve(null);
      };

      overlay.onclick = (event) => {
        if (event.target === overlay) {
          overlay.remove();
          resolve(null);
        }
      };
    });
  }

  async function chooseCrypto() {
    return new Promise((resolve) => {
      const overlay = makeOverlay(`
        <div style="background:#111118;color:#fff;width:420px;max-width:92vw;padding:28px;border:1px solid rgba(124,58,237,.28);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.65);font-family:Inter,-apple-system,sans-serif;">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a78bfa;margin-bottom:8px;">Crypto Checkout</div>
          <h2 style="margin:0 0 6px;font-size:24px;">Choose Cryptocurrency</h2>
          <p style="margin:0 0 20px;color:#9999aa;font-size:14px;">Select the network you want to use.</p>
          <button data-crypto="btc">Bitcoin <span>BTC</span></button>
          <button data-crypto="eth">Ethereum <span>ETH</span></button>
          <button data-crypto="ltc">Litecoin <span>LTC</span></button>
          <button data-crypto="usdttrc20">Tether <span>USDT (TRC20)</span></button>
          <button id="cancelCrypto" style="margin-top:10px;background:#25252f;">Cancel</button>
        </div>
      `);

      overlay.querySelectorAll('button').forEach((button) => {
        button.style.cssText += ';width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:7px 0;padding:14px 16px;background:#7c3aed;color:#fff;border:0;border-radius:10px;cursor:pointer;font-size:15px;font-weight:600;text-align:left;';
      });

      overlay.querySelectorAll('[data-crypto]').forEach((button) => {
        button.onclick = () => {
          const currency = button.dataset.crypto;
          overlay.remove();
          resolve(currency);
        };
      });

      const cancel = overlay.querySelector('#cancelCrypto');
      cancel.onclick = () => {
        overlay.remove();
        resolve(null);
      };

      overlay.onclick = (event) => {
        if (event.target === overlay) {
          overlay.remove();
          resolve(null);
        }
      };
    });
  }

  function showPayment(data, customer) {
    const currency = String(data.pay_currency || '').toUpperCase();
    const overlay = makeOverlay(`
      <div style="background:#111118;color:#fff;width:460px;max-width:92vw;padding:28px;border:1px solid rgba(124,58,237,.28);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.65);font-family:Inter,-apple-system,sans-serif;">
        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a78bfa;margin-bottom:8px;">Payment Created</div>
        <h2 style="margin:0 0 18px;font-size:24px;">Send exactly</h2>
        <div style="font-size:25px;font-weight:800;color:#a78bfa;margin-bottom:22px;word-break:break-word;">${data.pay_amount} ${currency}</div>
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#9999aa;margin-bottom:7px;">Payment Address</div>
        <div id="cryptoAddress" style="background:#1d1d27;border:1px solid rgba(255,255,255,.08);padding:13px;border-radius:10px;word-break:break-all;font-size:13px;margin-bottom:10px;">${data.pay_address || ''}</div>
        <button id="copyCryptoAddress" style="width:100%;padding:13px;background:#7c3aed;color:#fff;border:0;border-radius:10px;cursor:pointer;font-weight:700;">Copy Address</button>
        <div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:#b8b8c7;line-height:1.5;">
          <strong style="color:#fff;">Shipping to:</strong><br>
          ${customer.name}<br>
          ${customer.address}${customer.unit ? ', ' + customer.unit : ''}<br>
          ${customer.city}, ${customer.state} ${customer.zip}<br>
          ${customer.phone}
        </div>
        <div style="margin-top:18px;font-size:12px;color:#77778a;word-break:break-all;">Payment ID: ${data.payment_id || ''}</div>
        <button id="closePaymentBox" style="width:100%;margin-top:14px;padding:12px;background:#292933;color:#fff;border:0;border-radius:10px;cursor:pointer;">Done</button>
      </div>
    `);

    overlay.querySelector('#copyCryptoAddress').onclick = async () => {
      const button = overlay.querySelector('#copyCryptoAddress');
      try {
        await navigator.clipboard.writeText(String(data.pay_address || ''));
        button.textContent = 'Copied ✓';
      } catch (_) {
        const address = String(data.pay_address || '');
        window.prompt('Copy this payment address:', address);
      }
    };

    overlay.querySelector('#closePaymentBox').onclick = () => overlay.remove();
  }

  window.proceedToCheckout = async function proceedToCheckoutFixed() {
    try {
      if (typeof cart === 'undefined' || !Array.isArray(cart) || cart.length === 0) return;

      const customer = await collectCustomerInfo();
      if (!customer) return;

      const payCurrency = await chooseCrypto();
      if (!payCurrency) return;

      const orderId = 'NXT-' + Date.now();
      const amount = typeof cartSubtotal === 'function'
        ? cartSubtotal()
        : cart.reduce((sum, line) => sum + Number(line.price || 0) * Number(line.qty || 0), 0);

      const res = await fetch('/api/create-nowpayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          payCurrency,
          orderId,
          description: 'NXT LVL Research order'
        })
      });

      let data;
      try {
        data = await res.json();
      } catch (_) {
        throw new Error('Payment server returned an invalid response.');
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Unable to create payment');
      }

      showPayment(data, customer);
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error && error.message ? error.message : 'Payment setup failed. Please try again.');
    }
  };

  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.onclick = (event) => {
      event.preventDefault();
      window.proceedToCheckout();
    };
  }
});
