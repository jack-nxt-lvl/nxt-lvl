(function () {
  'use strict';
  if (window.__nxtDirectWalletCheckout) return;
  window.__nxtDirectWalletCheckout = true;

  const ACTIVE_PAYMENT_KEY = 'nxtActiveDirectPaymentV3';
  const QUOTE_RECOVERY_MS = 2 * 60 * 60 * 1000;
  const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  let active = null;
  let working = false;
  try { sessionStorage.removeItem('nxtActiveDirectPaymentV2'); } catch (_) {}

  const style = document.createElement('style');
  style.textContent = `
    .nxt-wallet-overlay,.nxt-wallet-loading{position:fixed;inset:0;z-index:1000002;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,5,9,.88);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f7f8fc}
    .nxt-wallet-overlay *,.nxt-wallet-loading *{box-sizing:border-box}.nxt-wallet-overlay [hidden]{display:none!important}
    .nxt-wallet-card{width:min(800px,100%);max-height:calc(100dvh - 40px);overflow:auto;overscroll-behavior:contain;background:#10141c;border:1px solid #364050;border-radius:22px;box-shadow:0 30px 100px #0009}
    .nxt-wallet-head{background:#10141c;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:22px 24px;border-bottom:1px solid #293240}.nxt-wallet-kicker{font-size:11px;letter-spacing:1.4px;color:#af9cfa;font-weight:800;text-transform:uppercase;margin-bottom:6px}
    .nxt-wallet-head h2{font:750 25px/1.2 Inter,-apple-system,sans-serif;margin:0}.nxt-wallet-head p{font-size:12px;color:#b8c0cf;margin:8px 0 0}.nxt-wallet-close{flex:none;width:44px;height:44px;border:1px solid #414b5a;border-radius:12px;background:#1c2430;color:white;font-size:24px;cursor:pointer}
    .nxt-wallet-body{padding:22px 24px;display:grid;grid-template-columns:minmax(0,1fr) 208px;gap:22px}.nxt-wallet-main{min-width:0}.nxt-wallet-side{min-width:0}.nxt-wallet-summary{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#b8c0cf;font-size:12px;margin-bottom:16px}.nxt-wallet-summary b{color:white}
    .nxt-wallet-amount{padding:18px;background:#18221f;border:1px solid #376554;border-radius:14px}.nxt-wallet-label{color:#c3cbda;font-size:12px;font-weight:650;margin-bottom:8px}.nxt-wallet-copyline{display:flex;align-items:center;justify-content:space-between;gap:12px}.nxt-wallet-value{font:650 13px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere;min-width:0}.nxt-wallet-value.amount{font-size:24px;line-height:1.3;color:#a6f0d4}.nxt-wallet-copy{flex:none;border:1px solid #607362;border-radius:9px;background:#233c31;color:#e9fff4;font-size:12px;font-weight:700;min-height:44px;padding:8px 12px;cursor:pointer}.nxt-wallet-copy.copied{background:#24583f}
    .nxt-wallet-network{margin:14px 0;padding:12px 14px;background:#251e12;border:1px solid #66512d;border-radius:12px;font-size:12px;line-height:1.6;color:#eadab7}.nxt-wallet-network b{display:block;color:#ffe1a3;font-size:14px}.nxt-wallet-field{padding:14px;border:1px solid #374251;border-radius:12px;background:#151c26;margin-bottom:14px}
    .nxt-wallet-note{font-size:12px;line-height:1.65;color:#b8c0cf;margin:10px 0}.nxt-wallet-actions{display:grid;gap:10px}.nxt-wallet-primary,.nxt-wallet-secondary{display:flex;align-items:center;justify-content:center;text-align:center;width:100%;min-height:50px;border-radius:11px;font:750 14px/1.4 Inter,-apple-system,sans-serif;padding:12px 16px;cursor:pointer;text-decoration:none!important}.nxt-wallet-primary{border:1px solid #9c79ff;background:#8052e6;color:white!important}.nxt-wallet-secondary{border:1px solid #4a586c;background:#1c2634;color:#f0f5ff!important}.nxt-wallet-overlay button:disabled,.nxt-wallet-overlay [aria-disabled=true]{opacity:.55;cursor:not-allowed}
    .nxt-wallet-overlay :focus-visible{outline:3px solid #a6f0d4;outline-offset:3px}.nxt-wallet-overlay a{color:#c6b4ff}.nxt-wallet-status{font-size:13px;line-height:1.6;padding:13px 14px;border:1px solid #3b4c64;background:#192433;border-radius:12px;margin:14px 0;overflow-wrap:anywhere}.nxt-wallet-status.good{border-color:#3d7b60;background:#142a20;color:#c6f7dd}.nxt-wallet-status.bad{border-color:#95663b;background:#2c2116;color:#ffe2bc}
    .nxt-wallet-stages{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:0 0 14px;padding:0;list-style:none}.nxt-wallet-stages li{border-top:3px solid #3d495a;padding-top:8px;font-size:10px;color:#a4b1c3}.nxt-wallet-stages li.active{border-color:#ad8bff;color:#e1d5ff}.nxt-wallet-stages li.complete{border-color:#61d5a0;color:#b5f2d3}
    .nxt-wallet-help{border-top:1px solid #34404f;margin-top:18px;padding-top:4px}.nxt-wallet-help summary{padding:14px 0;cursor:pointer;font-size:13px;font-weight:650;color:#e3eaf5}.nxt-wallet-help p,.nxt-wallet-help li{font-size:12px;line-height:1.65;color:#bec8d6}.nxt-wallet-help ol{padding-left:22px;margin:0 0 14px}.nxt-wallet-help li{margin:8px 0}.nxt-wallet-help .nxt-wallet-copy{margin-bottom:12px}.nxt-wallet-buy-status:empty{display:none}
    .nxt-wallet-verifyrow{display:grid;gap:8px}.nxt-wallet-verifyrow input{min-width:0;width:100%;min-height:48px;border:1px solid #58677b;border-radius:10px;background:#0c121b;color:white;padding:12px;font:14px ui-monospace,monospace}.nxt-wallet-verify label{display:block;font-size:12px;color:#bec8d6;margin-bottom:8px}
    .nxt-wallet-qr{border:1px solid #354151;border-radius:14px;padding:14px}.nxt-wallet-qr summary{font-size:12px;font-weight:700;cursor:pointer;margin-bottom:12px}.nxt-wallet-qr img{width:100%;height:auto;display:block;border-radius:8px;background:#fff}.nxt-wallet-qr p{font-size:11px;line-height:1.6;color:#bec8d6;margin:10px 0 0}.nxt-wallet-side .nxt-wallet-note{font-size:11px}.nxt-wallet-order-id{overflow-wrap:anywhere}.nxt-wallet-support{display:block;text-align:center;padding:13px 8px;font-size:12px}
    .nxt-wallet-expired{margin:12px 0;padding:16px;border:1px solid #b37d42;background:#302315;border-radius:12px}.nxt-wallet-expired strong{font-size:15px}.nxt-wallet-expired p{font-size:12px;line-height:1.6;margin:8px 0 12px;color:#f5dbb8}.nxt-wallet-pad{padding:32px}.nxt-wallet-pad h2{font-size:25px;margin:0 0 12px}.nxt-wallet-pad p{color:#bec8d6;font-size:14px;line-height:1.6}.nxt-wallet-pad button{margin-top:12px}.nxt-wallet-loadbox{max-width:360px;padding:28px;border:1px solid #4a586c;border-radius:16px;background:#10141c;text-align:center}.nxt-wallet-loadbox h3{font-size:20px}.nxt-wallet-loadbox p{font-size:13px;color:#bec8d6;line-height:1.6}
    .nxt-wallet-resume{position:fixed;bottom:max(18px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:1000001;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 24px);padding:12px 14px;border:1px solid #6d559e;border-radius:14px;background:#171423;color:white;box-shadow:0 8px 40px #0008;font:12px Inter,sans-serif}.nxt-wallet-resume span{min-width:0}.nxt-wallet-resume button{min-height:44px;border:0;border-radius:8px;background:#8052e6;color:white;padding:8px 14px;cursor:pointer}.nxt-wallet-resume .dismiss{padding:8px;background:transparent;font-size:20px}
    .nxt-simple-payment .nxt-wallet-summary{font-size:12px!important}.nxt-simple-payment .nxt-wallet-value.amount{font-size:24px!important}.nxt-simple-payment .nxt-wallet-qr{width:100%!important}.nxt-simple-payment .nxt-wallet-copy{min-height:44px!important}
    @media(max-width:620px){.nxt-wallet-overlay,.nxt-wallet-loading{padding:8px}.nxt-wallet-card{max-height:calc(100dvh - 16px);border-radius:16px}.nxt-wallet-head{padding:18px 16px}.nxt-wallet-head h2{font-size:22px}.nxt-wallet-body{padding:16px;grid-template-columns:1fr;gap:8px}.nxt-wallet-value.amount{font-size:22px}.nxt-wallet-copyline{gap:8px}.nxt-wallet-amount{padding:14px}.nxt-wallet-value:not(.amount){font-size:12px}.nxt-wallet-qr{max-width:100%}.nxt-wallet-qr img{max-width:220px;margin:auto}.nxt-wallet-verifyrow input{font-size:16px}.nxt-wallet-pad{padding:24px 18px}}
  `;
  document.head.appendChild(style);

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  }
  function cartItems() {
    try { return typeof cart !== 'undefined' && Array.isArray(cart) ? cart : (Array.isArray(window.cart) ? window.cart : []); }
    catch (_) { return []; }
  }
  function saveActivePayment(quote, context, txid) {
    try { sessionStorage.setItem(ACTIVE_PAYMENT_KEY, JSON.stringify({quote, context:{...context,details:{...context.details,researchApprovalCode:undefined,research:undefined}},txid:String(txid || ''),savedAt:Date.now()})); } catch (_) {}
  }
  function readActivePayment() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(ACTIVE_PAYMENT_KEY) || 'null');
      if (!saved?.quote?.quoteToken || !saved.context?.details || !Number.isFinite(Number(saved.quote.expiresAt)) || Date.now() > Number(saved.quote.expiresAt) + QUOTE_RECOVERY_MS) {
        sessionStorage.removeItem(ACTIVE_PAYMENT_KEY); return null;
      }
      return saved;
    } catch (_) { return null; }
  }
  function clearActivePayment() {
    try { sessionStorage.removeItem(ACTIVE_PAYMENT_KEY); } catch (_) {}
    document.querySelector('.nxt-wallet-resume')?.remove();
  }
  function halt(session) {
    if (!session) return;
    session.halted = true;
    session.timers.forEach(clearTimeout); session.timers.clear();
    session.controllers.forEach(controller => controller.abort()); session.controllers.clear();
  }
  function closeActive() {
    if (!active) return;
    halt(active); active.overlay.remove(); active.previousFocus?.focus(); active = null;
  }
  function later(session, fn, delay) {
    const id = setTimeout(() => { session.timers.delete(id); if (active === session && !session.halted) fn(); }, delay);
    session.timers.add(id); return id;
  }
  function trapFocus(node, dismiss) {
    node.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
      if (event.key !== 'Tab') return;
      const fields = [...node.querySelectorAll('a[href],button,input,summary,[tabindex="0"]')].filter(el => !el.disabled && el.getAttribute('aria-disabled') !== 'true' && el.getClientRects().length);
      const first = fields[0], last = fields[fields.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
  }
  async function request(url, body, session, timeoutMs = 25000) {
    const controller = new AbortController();
    session?.controllers.add(controller);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
      const data = await response.json().catch(() => ({}));
      return {response,data};
    } catch (error) {
      if (error.name === 'AbortError' && !session?.halted) throw new Error('The connection took too long. Please try again.');
      throw error;
    } finally { clearTimeout(timeout); session?.controllers.delete(controller); }
  }
  async function copyText(value, button) {
    const original = button.textContent;
    let copied = false;
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(value); copied = true; } } catch (_) {}
    if (!copied) {
      const area = document.createElement('textarea'); area.value = value; area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.appendChild(area); area.select();
      try { copied = document.execCommand('copy') === true; } catch (_) {}
      area.remove(); button.focus();
    }
    button.textContent = copied ? 'Copied ✓' : 'Select text to copy';
    button.classList.toggle('copied', copied);
    setTimeout(() => { button.textContent = original; button.classList.remove('copied'); }, 1800);
    return copied;
  }
  function showResumePrompt() {
    document.querySelector('.nxt-wallet-resume')?.remove();
    const saved = readActivePayment(); if (!saved || active) return;
    const node = document.createElement('div'); node.className = 'nxt-wallet-resume';
    node.innerHTML = '<span>Your payment checkout is saved.</span><button type="button" data-resume>Resume</button><button type="button" class="dismiss" aria-label="Dismiss payment reminder">×</button>';
    node.querySelector('[data-resume]').onclick = () => { const current = readActivePayment(); if (current) renderPayment(current.quote,current.context,current.txid); else node.remove(); };
    node.querySelector('.dismiss').onclick = () => node.remove(); document.body.appendChild(node);
  }
  function showError(message, retry) {
    const node = document.createElement('div'); node.className = 'nxt-wallet-overlay';
    node.innerHTML = `<div class="nxt-wallet-card" role="dialog" aria-modal="true" aria-labelledby="nxtWalletErrorTitle"><div class="nxt-wallet-pad"><h2 id="nxtWalletErrorTitle">Let’s try that again</h2><p role="alert">${escapeHtml(message)}</p><p>Your cart and details are saved.</p><button type="button" class="nxt-wallet-primary" data-retry>Try again</button><button type="button" class="nxt-wallet-secondary" data-close>Back to cart</button><a class="nxt-wallet-support" href="sms:+17542907210">Text us for help</a></div></div>`;
    const dismiss = () => node.remove(); node.querySelector('[data-close]').onclick = dismiss;
    node.querySelector('[data-retry]').onclick = () => { dismiss(); retry(); };
    trapFocus(node,dismiss); document.body.appendChild(node); node.querySelector('[data-retry]').focus();
  }
  function setStatus(session, message, kind = '') {
    if (active !== session || session.halted) return;
    session.status.className = `nxt-wallet-status ${kind}`; session.status.textContent = message;
  }
  function setPaymentStage(session, stage) {
    const order = ['awaiting','detected','confirming','confirmed'];
    session.overlay.querySelectorAll('[data-payment-stage]').forEach((node,index) => {
      node.classList.toggle('active',order[index] === stage); node.classList.toggle('complete',index < order.indexOf(stage));
      if (order[index] === stage) node.setAttribute('aria-current','step'); else node.removeAttribute('aria-current');
    });
  }
  function clearPaidItems(context) {
    const items = cartItems();
    for (const paid of context.items) {
      const index = items.findIndex(item => item.key === paid.key);
      if (index < 0) continue;
      items[index].qty -= paid.qty; if (items[index].qty <= 0) items.splice(index,1);
    }
    try { if (typeof renderCart === 'function') renderCart(); } catch (_) {}
  }
  function showSuccess(session, data) {
    if (active !== session || session.halted) return;
    halt(session); clearActivePayment(); clearPaidItems(session.context);
    window.dispatchEvent(new CustomEvent('nxt:payment-confirmed',{detail:{orderId:data.orderId}}));
    const email = data.confirmationEmailSent === true ? 'A confirmation email has been sent.' : 'Your payment is confirmed. Contact us if your receipt does not arrive.';
    let transactionUrl = '';
    try { const url = new URL(data.transactionUrl); if (url.protocol === 'https:') transactionUrl = url.href; } catch (_) {}
    session.overlay.innerHTML = `<div class="nxt-wallet-card" role="dialog" aria-modal="true" aria-labelledby="nxtPaidTitle"><div class="nxt-wallet-pad"><div class="nxt-wallet-kicker">Payment verified</div><h2 id="nxtPaidTitle">You’re all set ✓</h2><p>Order <strong>${escapeHtml(data.orderId)}</strong> is paid. ${email}</p><p>No further payment is needed.</p>${transactionUrl ? `<a href="${escapeHtml(transactionUrl)}" target="_blank" rel="noopener noreferrer">View confirmed transaction ↗</a>` : ''}<button type="button" class="nxt-wallet-primary">Done</button><a class="nxt-wallet-support" href="sms:+17542907210">Text us for order help</a></div></div>`;
    session.overlay.querySelector('button').onclick = closeActive; session.overlay.querySelector('button').focus();
  }
  function renderPayment(quote, context, initialTxid = '') {
    closeActive(); document.querySelector('.nxt-wallet-resume')?.remove();
    const previousFocus = document.activeElement;
    const session = {quote,context,txid:initialTxid,timers:new Set(),controllers:new Set(),halted:false,previousFocus,checking:false,walletBusy:false};
    const automaticDetection = quote.asset === 'BTC' || quote.asset === 'USDT';
    const network = quote.asset === 'USDT' ? 'Ethereum (ERC-20) only' : `${quote.network} only`;
    let paybisUrl = '';
    try { paybisUrl = window.NxtPaybisFunding?.buildCheckoutUrl({asset:quote.asset}) || ''; } catch (_) {}
    const overlay = document.createElement('div'); session.overlay = overlay; overlay.className = 'nxt-wallet-overlay';
    const e = escapeHtml;
    overlay.innerHTML = `<div class="nxt-wallet-card nxt-simple-payment" role="dialog" aria-modal="true" aria-labelledby="nxtPayTitle">
      <div class="nxt-wallet-head"><div><div class="nxt-wallet-kicker">Step 2 of 2 · Payment</div><h2 id="nxtPayTitle">Pay now with ${e(quote.asset)}</h2><p>Send once. Wait here for confirmation.</p></div><button type="button" class="nxt-wallet-close" aria-label="Close and save checkout">×</button></div>
      <div class="nxt-wallet-body"><div class="nxt-wallet-main">
        <div class="nxt-wallet-summary"><span>Order total <b>$${e(quote.totalUsd)} USD</b></span><span id="nxtWalletTimer"></span></div>
        <div class="nxt-wallet-amount"><div class="nxt-wallet-label">1. Send this exact amount</div><div class="nxt-wallet-copyline"><div class="nxt-wallet-value amount">${e(quote.amount)} <span>${e(quote.asset)}</span></div><button type="button" class="nxt-wallet-copy" data-copy-amount>Copy amount</button></div></div>
        <div class="nxt-wallet-network"><b>Network: ${e(network)}</b>${quote.asset === 'USDT' ? 'Choose Ethereum / ERC-20 in your app. Do not use Tron (TRC-20), BNB Chain, Base or another network.' : 'Select this same network in your wallet or exchange.'}</div>
        <div class="nxt-wallet-field"><div class="nxt-wallet-label">2. Send to this address</div><div class="nxt-wallet-copyline"><div class="nxt-wallet-value">${e(quote.address)}</div><button type="button" class="nxt-wallet-copy" data-copy-address>Copy address</button></div></div>
        <div class="nxt-wallet-expired" data-expired hidden><strong>This payment amount has expired</strong><p>Already sent it? Check your payment below. Do not send again. If you have not sent anything, get a fresh amount.</p><button type="button" class="nxt-wallet-secondary" data-refresh>I haven’t sent — get a new amount</button></div>
        <div class="nxt-wallet-actions"><a class="nxt-wallet-primary" data-open-wallet href="${e(quote.paymentUri)}">Open my wallet →</a><button type="button" class="nxt-wallet-secondary" data-browser-pay ${quote.asset === 'BTC' || !window.ethereum ? 'hidden' : ''}>Pay with browser wallet</button><button type="button" class="nxt-wallet-secondary" data-check>I sent payment — check status</button></div>
        <p class="nxt-wallet-note">If no wallet opens, copy the amount and address into your app. Your wallet shows any network fee before you confirm. The full amount above must arrive${quote.asset === 'USDT' ? '. A self-custody wallet also needs ETH for its network fee' : ''}.</p>
        <div class="nxt-wallet-status" role="status" aria-live="polite"></div>
        <ol class="nxt-wallet-stages" aria-label="Payment progress"><li data-payment-stage="awaiting">Waiting</li><li data-payment-stage="detected">Detected</li><li data-payment-stage="confirming">Confirming</li><li data-payment-stage="confirmed">Paid</li></ol>
        <details class="nxt-wallet-help" data-buy-help><summary>Need ${e(quote.asset)}? Buy with Paybis</summary><ol><li>Open Paybis below. It is a separate service and may require identity verification.</li><li>Choose <strong>${e(quote.asset)} on ${e(network)}</strong>. Purchase enough to cover your order plus provider and network fees.</li><li>Copy the address above if Paybis supports sending to it. Before confirming, make sure “You receive” is at least <strong>${e(quote.amount)} ${e(quote.asset)}</strong>. If you buy into your own wallet, return here for a current amount before sending.</li><li>Return here and tap <strong>I sent payment — check status</strong>. If the provider changed the amount, paste its transaction ID below.</li></ol><a class="nxt-wallet-secondary" data-buy-crypto ${paybisUrl ? `href="${e(paybisUrl)}"` : 'aria-disabled="true"'} target="_blank" rel="noopener noreferrer">Buy ${e(quote.asset)} on Paybis ↗</a><p>Paybis controls availability, fees, payment methods and verification times. Opening Paybis does not pay this order. Do not send after the timer expires.</p><div class="nxt-wallet-buy-status" data-buy-status role="status" aria-live="polite"></div></details>
        <details class="nxt-wallet-help nxt-wallet-verify"><summary>Payment sent but not detected?</summary><p>Do not pay twice. Use the transaction ID from your wallet or exchange, or text us for help.</p><label for="nxtWalletTxid">Transaction ID / hash</label><div class="nxt-wallet-verifyrow"><input id="nxtWalletTxid" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Paste transaction ID"><button type="button" class="nxt-wallet-secondary" data-verify>Verify payment</button></div></details>
      </div><aside class="nxt-wallet-side"><details class="nxt-wallet-qr" ${window.matchMedia('(min-width:621px)').matches ? 'open' : ''}><summary>Scan with another device</summary><img src="${e(quote.qrDataUrl)}" alt="${e(quote.asset)} payment QR code with exact amount and network"><p>Scan in a compatible wallet. Check the amount and network before confirming.</p></details><p class="nxt-wallet-note nxt-wallet-order-id">Order ${e(quote.orderId)}</p><p class="nxt-wallet-note">The small fractional amount helps identify your order. Keep every decimal when you send.</p><p class="nxt-wallet-note">Never share your recovery phrase or private key.</p><a class="nxt-wallet-support" href="sms:+17542907210">Need help? Text us ↗</a></aside></div>
    </div>`;
    active = session; window.nxtCheckoutDetails = context.details; saveActivePayment(quote,context,initialTxid);
    document.body.appendChild(overlay);
    session.status = overlay.querySelector('.nxt-wallet-status');
    const input = overlay.querySelector('#nxtWalletTxid'); input.value = initialTxid;
    const checkButton = overlay.querySelector('[data-check]');
    const verifyButton = overlay.querySelector('[data-verify]');
    const browserButton = overlay.querySelector('[data-browser-pay]');
    const openWallet = overlay.querySelector('[data-open-wallet]');
    const buyLink = overlay.querySelector('[data-buy-crypto]');
    const expire = () => Date.now() >= Number(quote.expiresAt);
    const current = () => active === session && !session.halted;
    const paymentBody = () => ({quoteToken:quote.quoteToken,fulfillment:context.details.fulfillment,customer:context.details.customer,items:context.items});
    const dismiss = () => { closeActive(); showResumePrompt(); };
    overlay.querySelector('.nxt-wallet-close').onclick = dismiss; trapFocus(overlay,dismiss);
    overlay.querySelector('.nxt-wallet-close').focus();
    setPaymentStage(session,initialTxid ? 'detected' : 'awaiting');

    for (const [selector,value] of [['[data-copy-amount]',quote.amount],['[data-copy-address]',quote.address]]) {
      overlay.querySelector(selector).onclick = event => { if (!expire()) copyText(value,event.currentTarget); else updateTimer(); };
    }
    openWallet.onclick = event => {
      if (expire()) { event.preventDefault(); updateTimer(); return; }
      setStatus(session,'Review the amount and network in your wallet. After sending, return here. Do not send twice.');
    };
    buyLink.onclick = event => {
      if (expire() || !paybisUrl) { event.preventDefault(); updateTimer(); return; }
      saveActivePayment(quote,context,input.value.trim());
      overlay.querySelector('[data-buy-status]').textContent = 'Paybis opens in a new tab. Your order is still unpaid. Return here to check the payment, and do not reuse expired instructions.';
    };
    overlay.querySelector('[data-refresh]').onclick = () => { if (session.txid || session.walletBusy) return; closeActive(); start(quote.asset,context); };
    input.addEventListener('input',() => { session.txid = input.value.trim(); saveActivePayment(quote,context,session.txid); });

    let pollingTimer = null;
    async function check(manual = false) {
      if (!current() || session.checking) return;
      if (pollingTimer) { clearTimeout(pollingTimer); session.timers.delete(pollingTimer); pollingTimer = null; }
      const txid = input.value.trim();
      if (!txid && !automaticDetection) {
        setStatus(session,'Paste your transaction ID below, or pay with your browser wallet to fill it automatically.');
        if (manual) { overlay.querySelector('.nxt-wallet-verify').open = true; input.focus(); }
        return;
      }
      session.checking = true; checkButton.disabled = true; verifyButton.disabled = true;
      let retry = true;
      if (manual) setStatus(session,'Checking your payment…');
      try {
        const {response,data} = await request(txid ? '/api/verify-direct-payment' : '/api/find-direct-payment', {...paymentBody(),...(txid ? {txid} : {waitMs:12000})}, session);
        if (!current()) return;
        if (txid && response.ok && data.status === 'paid') { showSuccess(session,data); return; }
        if (!txid && response.ok && data.status === 'found' && data.txid) {
          input.value = data.txid; session.txid = data.txid; saveActivePayment(quote,context,data.txid); updateTimer();
          setPaymentStage(session,'detected'); setStatus(session,'Payment detected. Waiting for blockchain confirmation. Do not send again.','good');
          later(session,() => check(),500); retry = false; return;
        }
        if (response.status === 202) {
          if (data.status === 'manual_review') {
            retry = false; setPaymentStage(session,'detected');
            setStatus(session,data.message || 'Your transfer needs review. Do not send again; contact support with your order number.','bad');
          } else if (txid) {
            const confirming = ['confirming','provider_disagreement','reorged'].includes(data.status);
            setPaymentStage(session,confirming ? 'confirming' : 'detected');
            setStatus(session,data.message || 'Your transfer is being checked. Do not send again.');
          } else {
            setStatus(session,expire() ? 'No payment found yet. If you already sent it, we’re still checking. Do not send again.' : 'Waiting for your payment. This page checks automatically; you can also check above.');
          }
        } else if (!response.ok) {
          retry = response.status >= 500 || response.status === 429;
          setStatus(session,data.error || data.message || 'We could not check this payment. Try again or contact support.','bad');
          if (!retry) { overlay.querySelector('.nxt-wallet-verify').open = true; }
        } else { setStatus(session,'We could not confirm payment yet. Keep this page open or contact support.','bad'); }
      } catch (error) { if (current()) setStatus(session,'Connection interrupted. We’ll retry automatically. If you already sent payment, do not send again.','bad'); }
      finally {
        session.checking = false;
        if (current()) {
          checkButton.disabled = false; verifyButton.disabled = false;
          overlay.querySelector('[data-refresh]').disabled = Boolean(session.txid || session.walletBusy);
          if (retry && Date.now() < Number(quote.expiresAt) + QUOTE_RECOVERY_MS) pollingTimer = later(session,() => check(),txid ? 12000 : 4000);
        }
      }
    }
    session.check = check;
    checkButton.onclick = () => check(true);
    verifyButton.onclick = () => {
      if (!input.value.trim()) { setStatus(session,'Paste the transaction ID from your wallet or exchange.','bad'); input.focus(); return; }
      check(true);
    };
    input.addEventListener('keydown',event => { if (event.key === 'Enter') verifyButton.click(); });
    browserButton.onclick = async () => {
      if (!current() || session.walletBusy || expire()) return;
      session.walletBusy = true; browserButton.disabled = true;
      try {
        const provider = window.ethereum;
        if (!provider) throw new Error('No browser wallet found. Use Open my wallet or copy the payment details.');
        setStatus(session,'Approve the connection in your wallet.');
        const accounts = await provider.request({method:'eth_requestAccounts'});
        if (!current()) return;
        const from = accounts?.[0]; if (!from) throw new Error('Your wallet did not provide an account.');
        const chainId = await provider.request({method:'eth_chainId'});
        if (!current()) return;
        if (String(chainId).toLowerCase() !== '0x1') await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x1'}]});
        if (!current()) return;
        if (expire()) throw new Error('This amount expired while connecting. Get a new amount before sending.');
        const target = String(quote.address).toLowerCase().replace(/^0x/,'').padStart(64,'0');
        const units = BigInt(quote.amountUnits).toString(16);
        const tx = quote.asset === 'ETH' ? {from,to:quote.address,value:`0x${units}`} : {from,to:USDT_CONTRACT,value:'0x0',data:`0xa9059cbb${target}${units.padStart(64,'0')}`};
        setStatus(session,'Confirm the amount and network fee in your wallet.');
        const txid = await provider.request({method:'eth_sendTransaction',params:[tx]});
        // A wallet may finish while the checkout is closed. Preserve its hash without replacing a newer order.
        const saved = readActivePayment();
        if (saved?.quote.quoteToken === quote.quoteToken) saveActivePayment(quote,context,txid);
        if (!current()) return;
        input.value = txid; session.txid = txid; setPaymentStage(session,'detected');
        setStatus(session,'Payment submitted. Waiting for confirmation. Do not send again.','good'); await check();
      } catch (error) {
        if (current()) setStatus(session,Number(error.code) === 4001 ? 'Wallet request cancelled. No payment was confirmed here. You can try again.' : (error.message || 'Unable to open your wallet. Copy the details to pay instead.'),'bad');
      } finally { session.walletBusy = false; if (current()) browserButton.disabled = expire() || Boolean(session.txid); }
    };
    function updateTimer(schedule = false) {
      if (!current()) return;
      const remaining = Math.max(0,Number(quote.expiresAt) - Date.now());
      overlay.querySelector('#nxtWalletTimer').textContent = remaining ? `Send within ${Math.floor(remaining / 60000)}:${String(Math.floor(remaining % 60000 / 1000)).padStart(2,'0')}` : 'Amount expired';
      const sent = Boolean(session.txid);
      for (const selector of ['[data-copy-amount]','[data-copy-address]']) overlay.querySelector(selector).disabled = !remaining || sent;
      browserButton.disabled = !remaining || sent || session.walletBusy;
      for (const link of [openWallet,buyLink]) {
        if (!remaining || sent) { link.removeAttribute('href'); link.setAttribute('aria-disabled','true'); }
      }
      overlay.querySelector('.nxt-wallet-qr').hidden = !remaining || sent;
      overlay.querySelector('[data-expired]').hidden = Boolean(remaining) || sent;
      overlay.querySelector('[data-refresh]').disabled = sent || session.walletBusy;
      if (schedule) later(session,() => updateTimer(true),1000);
    }
    if (context.paymentIntent === 'buy') overlay.querySelector('[data-buy-help]').open = true;
    setStatus(session,automaticDetection ? 'Waiting for your payment. We’ll check automatically after you send.' : 'Send from your wallet, then paste the transaction ID below.');
    updateTimer(true); later(session,() => check(),initialTxid ? 500 : 1500);
  }
  async function start(preferredAsset = 'USDT', suppliedContext) {
    if (working) return;
    working = true;
    const asset = ['USDT','BTC','ETH'].includes(preferredAsset) ? preferredAsset : 'USDT';
    const context = suppliedContext || {details:window.nxtCheckoutDetails || {},items:cartItems().map(item => ({...item}))};
    const loading = document.createElement('div'); loading.className = 'nxt-wallet-loading';
    loading.innerHTML = `<div class="nxt-wallet-loadbox" role="status"><h3>Preparing your ${escapeHtml(asset)} payment…</h3><p>Getting the exact amount and payment details.</p></div>`;
    document.body.appendChild(loading);
    try {
      const {response,data:quote} = await request('/api/create-direct-payment-quote',{asset,researchConsent:context.details.researchConsent,fulfillment:context.details.fulfillment,customer:context.details.customer,items:context.items,locale:navigator.languages?.[0] || navigator.language || 'en-US'});
      if (!response.ok) throw new Error(quote.error || 'Could not prepare payment. Please try again.');
      if (quote.asset !== asset || !quote.quoteToken || !quote.address || !quote.paymentUri || !Number.isFinite(Number(quote.expiresAt))) throw new Error('Payment details could not be verified. Please try again.');
      renderPayment(quote,context);
      request('/api/checkout-lead',{quoteToken:quote.quoteToken,customer:context.details.customer,fulfillment:context.details.fulfillment,items:context.items}).catch(() => {});
    } catch (error) { showError(error.message || 'Unable to prepare payment.',() => start(asset,context)); }
    finally { loading.remove(); working = false; }
  }
  window.startDirectWalletCheckout = start;
  const restoreCheckout = () => {
    if (active?.halted && active.quote) { const saved = readActivePayment(); if (saved) renderPayment(saved.quote,saved.context,saved.txid); }
    else showResumePrompt();
  };
  window.addEventListener('pageshow',restoreCheckout);
  window.addEventListener('pagehide',() => halt(active));
  document.addEventListener('visibilitychange',() => { if (document.visibilityState === 'visible' && active && !active.halted) active.check?.(); });
  setTimeout(showResumePrompt,400);
})();
