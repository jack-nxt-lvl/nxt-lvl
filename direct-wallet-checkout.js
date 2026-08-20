(() => {
  if (window.__nxtDirectWalletCheckoutLoaded) return;
  window.__nxtDirectWalletCheckoutLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .nxt-wallet-overlay,.nxt-wallet-chooser,.nxt-wallet-loading{position:fixed;inset:0;z-index:1000015;background:rgba(2,2,7,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-wallet-card{width:min(540px,96vw);max-height:96vh;overflow:auto;border:1px solid rgba(167,139,250,.30);border-radius:22px;background:radial-gradient(circle at 100% 0,rgba(124,58,237,.20),transparent 36%),linear-gradient(155deg,#14141e,#09090f 70%);box-shadow:0 38px 120px rgba(0,0,0,.82);color:#fff}
    .nxt-wallet-pad{padding:26px}.nxt-wallet-kicker{font-size:9px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;color:#a78bfa}.nxt-wallet-card h2{margin:6px 0 7px;font-size:27px;line-height:1.12}.nxt-wallet-card p{margin:0;color:#a1a1b2;font-size:11px;line-height:1.55}
    .nxt-wallet-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:17px 0}.nxt-wallet-trust div{padding:9px 7px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:rgba(255,255,255,.025);text-align:center;color:#b9bdc8;font-size:8.5px;line-height:1.35}.nxt-wallet-trust b{display:block;color:#fff;font-size:9px;margin-bottom:2px}
    .nxt-wallet-coins{display:grid;gap:10px}.nxt-wallet-coin{position:relative;width:100%;display:flex;align-items:center;gap:13px;padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:linear-gradient(145deg,#1a1a24,#12121a);color:#fff;text-align:left;cursor:pointer;transition:.18s}.nxt-wallet-coin:hover{transform:translateY(-1px);border-color:#8b5cf6;background:rgba(124,58,237,.12)}.nxt-wallet-icon{width:44px;height:44px;flex:0 0 44px;border-radius:50%;display:grid;place-items:center;font-size:19px;font-weight:900}.nxt-wallet-icon.btc{background:#f7931a}.nxt-wallet-icon.eth{background:#627eea}.nxt-wallet-icon.usdt{background:#26a17b}.nxt-wallet-coin strong{display:block;font-size:13px}.nxt-wallet-coin small{display:block;margin-top:2px;color:#9ca3af;font-size:9px}.nxt-wallet-arrow{margin-left:auto;color:#c4b5fd;font-size:20px}.nxt-wallet-badge{position:absolute;right:38px;top:11px;padding:3px 6px;border-radius:999px;border:1px solid rgba(52,211,153,.25);background:rgba(16,185,129,.08);color:#6ee7b7;font-size:7px;font-weight:900;letter-spacing:.5px}
    .nxt-wallet-cancel{width:100%;margin-top:13px;min-height:44px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:#20202a;color:#aaa;font-weight:800;cursor:pointer}.nxt-wallet-note{margin-top:12px!important;text-align:center;font-size:9px!important;color:#777b88!important}
    .nxt-wallet-loading{z-index:1000017}.nxt-wallet-loadbox{width:min(420px,92vw);padding:30px;border-radius:20px;border:1px solid rgba(167,139,250,.25);background:#111118;color:#fff;text-align:center;box-shadow:0 30px 90px rgba(0,0,0,.7)}.nxt-wallet-spin{width:44px;height:44px;margin:0 auto 15px;border-radius:50%;border:3px solid rgba(255,255,255,.12);border-top-color:#a78bfa;animation:nxtWalletSpin .75s linear infinite}@keyframes nxtWalletSpin{to{transform:rotate(360deg)}}.nxt-wallet-loadbox h3{margin:0 0 6px}.nxt-wallet-loadbox p{color:#9ca3af;font-size:10px;margin:0}
    .nxt-wallet-pay{width:min(800px,97vw)}.nxt-wallet-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(100deg,#15151f,#101018)}.nxt-wallet-head strong{display:block;font-size:14px}.nxt-wallet-head span{display:block;color:#9ca3af;font-size:9px;margin-top:3px}.nxt-wallet-close{width:38px;height:38px;flex:0 0 38px;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:#23232e;color:#fff;font-size:21px;cursor:pointer}.nxt-wallet-body{padding:20px;display:grid;grid-template-columns:260px 1fr;gap:20px}.nxt-wallet-qr{background:#fff;border-radius:16px;padding:12px;align-self:start;text-align:center}.nxt-wallet-qr img{display:block;width:100%;height:auto}.nxt-wallet-qr small{display:block;color:#5b5b66;font-size:9px;font-weight:800;margin-top:7px}.nxt-wallet-order{display:grid;gap:12px}.nxt-wallet-summary{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.025);font-size:10px;color:#aaa}.nxt-wallet-summary b{color:#fff}.nxt-wallet-field{padding:13px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:#14141d}.nxt-wallet-label{font-size:8px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#8f8fa1;margin-bottom:7px}.nxt-wallet-copyline{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.nxt-wallet-value{min-width:0;color:#fff;font:800 14px ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}.nxt-wallet-value.amount{font-size:20px;color:#c4b5fd}.nxt-wallet-copy{border:1px solid rgba(167,139,250,.28);border-radius:8px;background:rgba(124,58,237,.12);color:#d8ccff;font-size:9px;font-weight:850;padding:9px;cursor:pointer}
    .nxt-wallet-warning{padding:11px 12px;border:1px solid rgba(251,191,36,.26);border-radius:10px;background:rgba(245,158,11,.07);color:#fde68a;font-size:9.5px;line-height:1.5}.nxt-wallet-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nxt-wallet-actions a,.nxt-wallet-actions button{min-height:45px;border-radius:10px;border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;background:#222231;color:#fff;font:850 10px Inter,sans-serif;cursor:pointer;padding:9px}.nxt-wallet-actions .primary{border:0;background:linear-gradient(100deg,#7c3aed,#9f55ff 55%,#6d28d9)}.nxt-wallet-actions [hidden]{display:none}
    .nxt-wallet-verify{padding:13px;border:1px solid rgba(52,211,153,.18);border-radius:12px;background:rgba(16,185,129,.045)}.nxt-wallet-verify label{display:block;color:#d1fae5;font-size:9px;font-weight:850;margin-bottom:7px}.nxt-wallet-verifyrow{display:grid;grid-template-columns:1fr auto;gap:8px}.nxt-wallet-verify input{min-width:0;height:43px;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:#0d0d14;color:#fff;padding:0 11px;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}.nxt-wallet-verify button{border:0;border-radius:9px;background:#059669;color:#fff;font-size:9px;font-weight:900;padding:0 13px;cursor:pointer}.nxt-wallet-status{display:none;margin-top:9px;padding:9px 10px;border-radius:8px;background:rgba(255,255,255,.04);color:#c7c7d1;font-size:9.5px;line-height:1.45}.nxt-wallet-status.show{display:block}.nxt-wallet-status.good{color:#a7f3d0;background:rgba(16,185,129,.09)}.nxt-wallet-status.bad{color:#fecaca;background:rgba(239,68,68,.08)}.nxt-wallet-fine{font-size:8.5px!important;color:#747487!important;text-align:center}.nxt-wallet-success{padding:32px;text-align:center}.nxt-wallet-success .check{width:64px;height:64px;margin:0 auto 16px;border-radius:50%;display:grid;place-items:center;background:rgba(16,185,129,.15);border:1px solid rgba(52,211,153,.35);color:#6ee7b7;font-size:30px}.nxt-wallet-success h2{margin-bottom:8px}.nxt-wallet-success a{display:inline-flex;margin-top:16px;color:#c4b5fd;font-size:10px}.nxt-wallet-success button{display:block;margin:18px auto 0;min-width:180px;min-height:44px;border:0;border-radius:10px;background:linear-gradient(100deg,#7c3aed,#6d28d9);color:#fff;font-weight:850;cursor:pointer}
    @media(max-width:700px){.nxt-wallet-pad{padding:22px 16px}.nxt-wallet-card h2{font-size:23px}.nxt-wallet-trust{grid-template-columns:1fr}.nxt-wallet-pay{height:96vh}.nxt-wallet-body{grid-template-columns:1fr;padding:16px}.nxt-wallet-qr{width:210px;margin:auto}.nxt-wallet-actions{grid-template-columns:1fr}.nxt-wallet-verifyrow{grid-template-columns:1fr}.nxt-wallet-verify button{min-height:42px}}
  `;
  document.head.appendChild(style);

  let working = false;
  let activeOverlay = null;
  let activePoll = null;
  let activeTimer = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }

  function cartItems() {
    try { return typeof cart !== 'undefined' && Array.isArray(cart) ? cart : (Array.isArray(window.cart) ? window.cart : []); }
    catch (_) { return []; }
  }

  function checkoutDetails() { return window.nxtCheckoutDetails || {}; }

  function stopTimers() {
    if (activePoll) clearInterval(activePoll);
    if (activeTimer) clearInterval(activeTimer);
    activePoll = null;
    activeTimer = null;
  }

  function closeActive() {
    stopTimers();
    if (activeOverlay) activeOverlay.remove();
    activeOverlay = null;
  }

  function showLoading(show, asset) {
    document.querySelector('.nxt-wallet-loading')?.remove();
    if (!show) return;
    const node = document.createElement('div');
    node.className = 'nxt-wallet-loading';
    node.innerHTML = `<div class="nxt-wallet-loadbox"><div class="nxt-wallet-spin"></div><h3>Creating direct-wallet payment</h3><p>Locking the exact ${escapeHtml(asset || 'crypto')} amount and generating its QR code…</p></div>`;
    document.body.appendChild(node);
  }

  function showError(message) {
    showLoading(false);
    closeActive();
    const node = document.createElement('div');
    node.className = 'nxt-wallet-overlay';
    node.innerHTML = `<div class="nxt-wallet-card"><div class="nxt-wallet-pad" style="text-align:center"><h2>Checkout couldn’t continue</h2><p>${escapeHtml(message || 'Please try again.')}</p><button type="button" class="nxt-wallet-cancel">Close</button></div></div>`;
    node.querySelector('button').onclick = () => node.remove();
    node.addEventListener('click', (event) => { if (event.target === node) node.remove(); });
    document.body.appendChild(node);
  }

  function chooseAsset() {
    return new Promise((resolve) => {
      const node = document.createElement('div');
      node.className = 'nxt-wallet-chooser';
      node.innerHTML = `<div class="nxt-wallet-card"><div class="nxt-wallet-pad"><div class="nxt-wallet-kicker">Direct wallet checkout</div><h2>Choose your payment asset</h2><p>Send crypto from your wallet directly to the matching NXT LVL receiving address. No payment processor holds your funds.</p><div class="nxt-wallet-trust"><div><b>✓ Direct</b>Wallet-to-wallet payment</div><div><b>🔍 Verified</b>Checked on the blockchain</div><div><b>🔑 Private</b>No recovery phrase requested</div></div><div class="nxt-wallet-coins"><button class="nxt-wallet-coin" data-asset="BTC"><span class="nxt-wallet-icon btc">₿</span><span><strong>Bitcoin (BTC)</strong><small>Bitcoin Mainnet</small></span><span class="nxt-wallet-arrow">›</span></button><button class="nxt-wallet-coin" data-asset="ETH"><span class="nxt-wallet-icon eth">Ξ</span><span><strong>Ethereum (ETH)</strong><small>Ethereum Mainnet</small></span><span class="nxt-wallet-arrow">›</span></button><button class="nxt-wallet-coin" data-asset="USDT"><span class="nxt-wallet-icon usdt">₮</span><span><strong>Tether (USDT)</strong><small>Ethereum Mainnet · ERC-20 only</small></span><span class="nxt-wallet-badge">STABLECOIN</span><span class="nxt-wallet-arrow">›</span></button></div><button class="nxt-wallet-cancel" type="button">Back</button><p class="nxt-wallet-note">Only send the selected asset on the network shown. Wrong-network transfers may be permanently lost.</p></div></div>`;
      let finished = false;
      const done = (asset) => { if (finished) return; finished = true; node.remove(); resolve(asset); };
      node.querySelectorAll('[data-asset]').forEach((button) => { button.onclick = () => done(button.dataset.asset); });
      node.querySelector('.nxt-wallet-cancel').onclick = () => done(null);
      node.addEventListener('click', (event) => { if (event.target === node) done(null); });
      document.body.appendChild(node);
    });
  }

  async function createQuote(asset) {
    const details = checkoutDetails();
    const response = await fetch('/api/create-direct-payment-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset, fulfillment: details.fulfillment, customer: details.customer, items: cartItems() }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const missing = Array.isArray(data.missing) && data.missing.length ? ` Missing setup: ${data.missing.join(', ')}.` : '';
      throw new Error((data.error || 'Unable to create a direct payment quote.') + missing);
    }
    return data;
  }

  function copyText(text, button) {
    const finish = () => {
      if (!button) return;
      const original = button.textContent;
      button.textContent = 'Copied ✓';
      setTimeout(() => { button.textContent = original; }, 1500);
    };
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(finish);
    const area = document.createElement('textarea');
    area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select();
    try { document.execCommand('copy'); } catch (_) {}
    area.remove(); finish(); return Promise.resolve();
  }

  function setStatus(node, message, type) {
    node.className = `nxt-wallet-status show${type ? ` ${type}` : ''}`;
    node.textContent = message;
  }

  function ethereumTransferData(address, amountUnits) {
    const target = String(address).toLowerCase().replace(/^0x/, '').padStart(64, '0');
    const amount = BigInt(amountUnits).toString(16).padStart(64, '0');
    return `0xa9059cbb${target}${amount}`;
  }

  async function payWithBrowserWallet(quote, input, status) {
    if (!window.ethereum) throw new Error('No compatible browser wallet was detected. Use the QR code or copy the payment details.');
    setStatus(status, 'Connecting to your wallet…');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts && accounts[0];
    if (!from) throw new Error('The wallet did not provide an account.');
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (String(chainId).toLowerCase() !== '0x1') {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] });
    }
    const tx = quote.asset === 'ETH'
      ? { from, to: quote.address, value: `0x${BigInt(quote.amountUnits).toString(16)}` }
      : { from, to: '0xdAC17F958D2ee523a2206206994597C13D831ec7', value: '0x0', data: ethereumTransferData(quote.address, quote.amountUnits) };
    setStatus(status, 'Review the exact amount and Ethereum Mainnet network in your wallet.');
    const txid = await window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] });
    input.value = txid;
    return txid;
  }

  async function verifyPayment(quote, txid, status, button) {
    const details = checkoutDetails();
    if (!txid) return setStatus(status, 'Paste the transaction ID shown by your wallet.', 'bad');
    button.disabled = true;
    setStatus(status, 'Checking the blockchain…');
    try {
      const response = await fetch('/api/verify-direct-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteToken: quote.quoteToken,
          txid,
          fulfillment: details.fulfillment,
          customer: details.customer,
          items: cartItems(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 202) {
        setStatus(status, data.message || 'Payment found and waiting for confirmations.');
        return 'pending';
      }
      if (!response.ok || data.status !== 'paid') throw new Error(data.error || data.message || 'Payment could not be verified.');
      showSuccess(data);
      return 'paid';
    } catch (error) {
      setStatus(status, error.message || 'Unable to verify payment.', 'bad');
      return 'error';
    } finally {
      button.disabled = false;
    }
  }

  function clearCartAfterPayment() {
    try {
      if (typeof cart !== 'undefined' && Array.isArray(cart)) cart.splice(0, cart.length);
      if (Array.isArray(window.cart)) window.cart.splice(0, window.cart.length);
      if (typeof renderCart === 'function') renderCart();
    } catch (_) {}
  }

  function showSuccess(data) {
    stopTimers();
    if (!activeOverlay) return;
    clearCartAfterPayment();
    const emailMessage = data.confirmationEmailSent === false
      ? 'The payment is confirmed; the email receipt may be delayed.'
      : 'A confirmation email has been sent.';
    activeOverlay.innerHTML = `<div class="nxt-wallet-card"><div class="nxt-wallet-success"><div class="check">✓</div><div class="nxt-wallet-kicker">Blockchain verified</div><h2>Payment confirmed</h2><p>Order <b>${escapeHtml(data.orderId)}</b> has been paid. ${emailMessage}</p><a href="${escapeHtml(data.transactionUrl)}" target="_blank" rel="noopener noreferrer">View confirmed transaction ↗</a><button type="button">Close</button></div></div>`;
    activeOverlay.querySelector('button').onclick = closeActive;
  }

  function renderPayment(quote) {
    showLoading(false);
    closeActive();
    const networkWarning = quote.asset === 'USDT'
      ? 'For USDT, select Ethereum ERC‑20—not Tron, BNB Chain, Base, or another network.'
      : '';
    const overlay = document.createElement('div');
    overlay.className = 'nxt-wallet-overlay';
    overlay.innerHTML = `<div class="nxt-wallet-card nxt-wallet-pay" role="dialog" aria-modal="true" aria-label="Direct ${escapeHtml(quote.asset)} payment"><div class="nxt-wallet-head"><div><strong>Pay directly with ${escapeHtml(quote.asset)}</strong><span>${escapeHtml(quote.network)} · Order ${escapeHtml(quote.orderId)}</span></div><button type="button" class="nxt-wallet-close" aria-label="Close checkout">×</button></div><div class="nxt-wallet-body"><div class="nxt-wallet-qr"><img src="${escapeHtml(quote.qrDataUrl)}" alt="${escapeHtml(quote.asset)} payment QR code"><small>SCAN WITH YOUR WALLET</small></div><div class="nxt-wallet-order"><div class="nxt-wallet-summary"><span>Order total <b>$${escapeHtml(quote.totalUsd)}</b></span><span id="nxtWalletTimer">Quote expires in 15:00</span></div><div class="nxt-wallet-field"><div class="nxt-wallet-label">Exact amount</div><div class="nxt-wallet-copyline"><div class="nxt-wallet-value amount">${escapeHtml(quote.amount)} ${escapeHtml(quote.asset)}</div><button type="button" class="nxt-wallet-copy" data-copy-amount>Copy</button></div></div><div class="nxt-wallet-field"><div class="nxt-wallet-label">Receiving address</div><div class="nxt-wallet-copyline"><div class="nxt-wallet-value">${escapeHtml(quote.address)}</div><button type="button" class="nxt-wallet-copy" data-copy-address>Copy</button></div></div><div class="nxt-wallet-warning"><b>${escapeHtml(quote.network)} only.</b> Send the exact amount shown. ${escapeHtml(networkWarning)}</div><div class="nxt-wallet-actions"><a class="primary" href="${escapeHtml(quote.paymentUri)}">Open in wallet</a><button type="button" data-browser-pay ${quote.asset === 'BTC' ? 'hidden' : ''}>Pay with browser wallet</button></div><div class="nxt-wallet-verify"><label for="nxtWalletTxid">After sending, paste the transaction ID from your wallet</label><div class="nxt-wallet-verifyrow"><input id="nxtWalletTxid" autocomplete="off" spellcheck="false" placeholder="Transaction ID / hash"><button type="button" data-verify>Verify payment</button></div><div class="nxt-wallet-status"></div></div><p class="nxt-wallet-fine">${escapeHtml(quote.note)} Never share your recovery phrase or private key. If you do not own crypto yet, fund your own wallet through a lawful provider, then return here to pay.</p></div></div></div>`;
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    const input = overlay.querySelector('#nxtWalletTxid');
    const status = overlay.querySelector('.nxt-wallet-status');
    const verifyButton = overlay.querySelector('[data-verify]');
    const closeButton = overlay.querySelector('.nxt-wallet-close');
    overlay.querySelector('[data-copy-amount]').onclick = (event) => copyText(quote.amount, event.currentTarget);
    overlay.querySelector('[data-copy-address]').onclick = (event) => copyText(quote.address, event.currentTarget);
    closeButton.onclick = closeActive;
    overlay.addEventListener('click', (event) => { if (event.target === overlay) closeActive(); });

    const check = async () => {
      const result = await verifyPayment(quote, input.value.trim(), status, verifyButton);
      if (result === 'pending' && !activePoll) activePoll = setInterval(check, 12000);
      return result;
    };
    verifyButton.onclick = check;
    input.addEventListener('keydown', (event) => { if (event.key === 'Enter') check(); });

    const browserPay = overlay.querySelector('[data-browser-pay]');
    if (browserPay) browserPay.onclick = async () => {
      try {
        const txid = await payWithBrowserWallet(quote, input, status);
        await check();
      } catch (error) { setStatus(status, error.message || 'Wallet payment could not start.', 'bad'); }
    };

    const timer = overlay.querySelector('#nxtWalletTimer');
    activeTimer = setInterval(() => {
      const remaining = Math.max(0, Number(quote.expiresAt) - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      timer.textContent = remaining ? `Quote expires in ${minutes}:${String(seconds).padStart(2, '0')}` : 'Quote expired — restart if not sent';
    }, 1000);
  }

  async function start(preferredAsset) {
    if (working) return;
    const asset = preferredAsset || await chooseAsset();
    if (!asset) return;
    working = true;
    showLoading(true, asset);
    try {
      const quote = await createQuote(asset);
      renderPayment(quote);
    } catch (error) {
      showError(error.message || 'Unable to create direct-wallet checkout.');
    } finally {
      working = false;
    }
  }

  window.startDirectWalletCheckout = start;
})();
