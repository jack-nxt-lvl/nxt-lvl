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
      'z-index:999999'
    ].join(';');
    document.body.appendChild(overlay);
    return overlay;
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

  function showPayment(data) {
    const currency = String(data.pay_currency || '').toUpperCase();
    const overlay = makeOverlay(`
      <div style="background:#111118;color:#fff;width:460px;max-width:92vw;padding:28px;border:1px solid rgba(124,58,237,.28);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.65);font-family:Inter,-apple-system,sans-serif;">
        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a78bfa;margin-bottom:8px;">Payment Created</div>
        <h2 style="margin:0 0 18px;font-size:24px;">Send exactly</h2>
        <div style="font-size:25px;font-weight:800;color:#a78bfa;margin-bottom:22px;word-break:break-word;">${data.pay_amount} ${currency}</div>
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#9999aa;margin-bottom:7px;">Payment Address</div>
        <div id="cryptoAddress" style="background:#1d1d27;border:1px solid rgba(255,255,255,.08);padding:13px;border-radius:10px;word-break:break-all;font-size:13px;margin-bottom:10px;">${data.pay_address || ''}</div>
        <button id="copyCryptoAddress" style="width:100%;padding:13px;background:#7c3aed;color:#fff;border:0;border-radius:10px;cursor:pointer;font-weight:700;">Copy Address</button>
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

      showPayment(data);
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
