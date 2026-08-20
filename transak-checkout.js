(() => {
  if (window.__nxtTransakCheckoutLoaded) return;
  window.__nxtTransakCheckoutLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .nxt-transak-cta{width:100%;display:flex;align-items:center;gap:13px;margin:12px 0 8px;padding:15px 16px;border:1px solid rgba(167,139,250,.48);border-radius:13px;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;cursor:pointer;text-align:left;box-shadow:0 14px 34px rgba(91,33,182,.28);transition:.18s ease}
    .nxt-transak-cta:hover{transform:translateY(-1px);filter:brightness(1.06)}
    .nxt-transak-cta .nxt-t-icon{width:48px;height:48px;display:grid;place-items:center;flex:0 0 48px;border-radius:12px;background:#fff;color:#111827;font-size:22px;font-weight:900}
    .nxt-transak-cta .nxt-t-copy{display:block;min-width:0;flex:1}.nxt-transak-cta strong{display:block;font-size:14px}.nxt-transak-cta small{display:block;margin-top:3px;color:#ede9fe;font-size:10px;line-height:1.35}.nxt-transak-cta .nxt-t-badges{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.nxt-transak-cta .nxt-t-badge{padding:5px 7px;border-radius:6px;background:#fff;color:#111827;font-size:9px;font-weight:900}
    .nxt-transak-note{margin:0 0 10px;padding:9px 11px;border-radius:9px;border:1px solid rgba(52,211,153,.18);background:rgba(16,185,129,.055);color:#a7b8b1;font-size:9px;line-height:1.45}.nxt-transak-note b{color:#d1fae5}
    .nxt-transak-overlay{position:fixed;inset:0;z-index:1000010;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:14px}
    .nxt-transak-modal{position:relative;width:min(520px,96vw);height:min(760px,94vh);border:1px solid rgba(167,139,250,.32);border-radius:18px;overflow:hidden;background:#09090f;box-shadow:0 34px 110px rgba(0,0,0,.78)}
    .nxt-transak-head{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 15px;border-bottom:1px solid rgba(255,255,255,.08);background:#111118;color:#fff}.nxt-transak-head strong{font-size:13px}.nxt-transak-head span{display:block;color:#9ca3af;font-size:9px;margin-top:2px}.nxt-transak-close{width:35px;height:35px;border:1px solid rgba(255,255,255,.10);border-radius:9px;background:#1f1f2a;color:#fff;font-size:21px;cursor:pointer}
    .nxt-transak-frame{display:block;width:100%;height:calc(100% - 58px);border:0;background:#fff}
    .nxt-transak-loading{position:fixed;inset:0;z-index:1000011;background:rgba(0,0,0,.82);display:grid;place-items:center;padding:20px}.nxt-transak-loading-box{width:min(400px,92vw);padding:28px;border-radius:18px;background:#111118;border:1px solid rgba(167,139,250,.25);color:#fff;text-align:center}.nxt-transak-spin{width:42px;height:42px;margin:0 auto 14px;border-radius:50%;border:3px solid rgba(255,255,255,.13);border-top-color:#a78bfa;animation:nxtTransakSpin .8s linear infinite}@keyframes nxtTransakSpin{to{transform:rotate(360deg)}}.nxt-transak-loading-box p{color:#a1a1aa;font-size:11px;margin-top:7px}
    .nxt-transak-choose{position:fixed;inset:0;z-index:1000012;background:rgba(0,0,0,.86);display:flex;align-items:center;justify-content:center;padding:16px}.nxt-transak-choose-card{width:min(440px,94vw);padding:24px;border-radius:18px;background:linear-gradient(145deg,#15151f,#0b0b11);border:1px solid rgba(167,139,250,.26);color:#fff;box-shadow:0 30px 90px rgba(0,0,0,.72)}.nxt-transak-choose-card h3{margin:0 0 5px;font-size:23px}.nxt-transak-choose-card p{margin:0 0 16px;color:#a1a1b2;font-size:11px;line-height:1.5}.nxt-transak-coins{display:grid;gap:9px}.nxt-transak-coin{width:100%;display:flex;align-items:center;gap:12px;padding:13px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:#181821;color:#fff;text-align:left;cursor:pointer}.nxt-transak-coin:hover{border-color:#8b5cf6;background:rgba(124,58,237,.12)}.nxt-transak-coin-icon{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:18px}.nxt-transak-coin-icon.btc{background:#f7931a}.nxt-transak-coin-icon.eth{background:#627eea}.nxt-transak-coin-icon.usdt{background:#26a17b}.nxt-transak-coin strong{display:block;font-size:13px}.nxt-transak-coin small{display:block;margin-top:2px;color:#9ca3af;font-size:9px}.nxt-transak-cancel{width:100%;margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#242431;color:#aaa;cursor:pointer;font-weight:800}
    @media(max-width:650px){.nxt-transak-cta .nxt-t-badges{display:none}.nxt-transak-modal{width:100%;height:96vh;border-radius:14px}}
  `;
  document.head.appendChild(style);

  function getCart() {
    try { return Array.isArray(window.cart) ? window.cart : (typeof cart !== 'undefined' && Array.isArray(cart) ? cart : []); }
    catch (_) { return []; }
  }

  function total() {
    return getCart().reduce((sum, line) => sum + (Number(line.price) || 0) * (Number(line.qty) || 0), 0);
  }

  function loading(show, message) {
    document.querySelector('.nxt-transak-loading')?.remove();
    if (!show) return;
    const el = document.createElement('div');
    el.className = 'nxt-transak-loading';
    el.innerHTML = `<div class="nxt-transak-loading-box"><div class="nxt-transak-spin"></div><h3>Opening secure checkout</h3><p>${message || 'Preparing Apple Pay and card options…'}</p></div>`;
    document.body.appendChild(el);
  }

  function showError(message, setupRequired, missing) {
    loading(false);
    let text = message;
    if (setupRequired) {
      text += '\n\nThe checkout code is installed. Add the missing Vercel environment variable';
      if (Array.isArray(missing) && missing.length) text += ': ' + missing.join(', ');
      else text += 's for the selected crypto';
      text += '.';
    }
    alert(text);
  }

  function chooseCrypto() {
    return new Promise(resolve => {
      document.querySelector('.nxt-transak-choose')?.remove();
      const overlay = document.createElement('div');
      overlay.className = 'nxt-transak-choose';
      overlay.innerHTML = `
        <div class="nxt-transak-choose-card">
          <h3>Choose what to buy</h3>
          <p>Your order total will be converted automatically and sent to the matching receiving wallet.</p>
          <div class="nxt-transak-coins">
            <button class="nxt-transak-coin" type="button" data-crypto="BTC"><span class="nxt-transak-coin-icon btc">₿</span><span><strong>Bitcoin (BTC)</strong><small>Sent to your BTC receiving address</small></span></button>
            <button class="nxt-transak-coin" type="button" data-crypto="ETH"><span class="nxt-transak-coin-icon eth">Ξ</span><span><strong>Ethereum (ETH)</strong><small>Sent on the Ethereum network</small></span></button>
            <button class="nxt-transak-coin" type="button" data-crypto="USDT"><span class="nxt-transak-coin-icon usdt">₮</span><span><strong>Tether (USDT)</strong><small>ERC-20 by default unless configured otherwise</small></span></button>
          </div>
          <button class="nxt-transak-cancel" type="button">Cancel</button>
        </div>`;
      overlay.querySelectorAll('[data-crypto]').forEach(btn => {
        btn.onclick = () => { const value = btn.dataset.crypto; overlay.remove(); resolve(value); };
      });
      overlay.querySelector('.nxt-transak-cancel').onclick = () => { overlay.remove(); resolve(null); };
      overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(null); } });
      document.body.appendChild(overlay);
    });
  }

  function openWidget(widgetUrl, crypto, network) {
    loading(false);
    document.querySelector('.nxt-transak-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'nxt-transak-overlay';
    overlay.innerHTML = `
      <div class="nxt-transak-modal" role="dialog" aria-modal="true" aria-label="Secure card and Apple Pay checkout">
        <div class="nxt-transak-head"><div><strong>Buy ${crypto} with Apple Pay / Card</strong><span>${network || ''} • Powered by Transak</span></div><button class="nxt-transak-close" type="button" aria-label="Close">×</button></div>
        <iframe class="nxt-transak-frame" src="${widgetUrl.replace(/"/g, '&quot;')}" allow="camera; microphone; payment; clipboard-write" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>`;
    overlay.querySelector('.nxt-transak-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  async function startTransak() {
    const amount = total();
    if (!amount) return showError('Your cart is empty.');

    const crypto = await chooseCrypto();
    if (!crypto) return;

    loading(true, `Preparing ${crypto} purchase…`);
    try {
      const orderId = `NXT-${Date.now()}`;
      const res = await fetch('/api/create-transak-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, orderId, crypto })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.widgetUrl) {
        return showError(data.error || 'Unable to start card checkout.', data.setupRequired, data.missing);
      }
      openWidget(data.widgetUrl, data.crypto || crypto, data.network || '');
    } catch (error) {
      showError('Unable to start card checkout. Please try again.');
      console.error('Transak checkout error:', error);
    }
  }

  function inject() {
    const shell = document.querySelector('.nxt-pay-shell');
    if (!shell) return;
    const heading = [...shell.querySelectorAll('h2')].find(h => /choose your payment method/i.test(h.textContent || ''));
    if (!heading || shell.querySelector('.nxt-transak-cta')) return;

    const anchor = shell.querySelector('.nxt-card-pay-hero') || shell.querySelector('.nxt-order-total-pill') || heading;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nxt-transak-cta';
    button.innerHTML = `<span class="nxt-t-icon"></span><span class="nxt-t-copy"><strong>Pay with Apple Pay or Debit Card</strong><small>Choose BTC, ETH, or USDT and buy it inside checkout.</small></span><span class="nxt-t-badges"><span class="nxt-t-badge">BTC</span><span class="nxt-t-badge">ETH</span><span class="nxt-t-badge">USDT</span></span>`;
    button.onclick = startTransak;

    const note = document.createElement('div');
    note.className = 'nxt-transak-note';
    note.innerHTML = `<b>Fast checkout:</b> choose BTC, ETH, or USDT. The order total and matching receiving wallet are filled automatically. Transak handles available card/Apple Pay methods and any required verification.`;

    anchor.insertAdjacentElement('afterend', note);
    note.insertAdjacentElement('afterend', button);
  }

  const observer = new MutationObserver(inject);
  observer.observe(document.body, { childList: true, subtree: true });
  inject();
  window.startTransakCheckout = startTransak;
})();
