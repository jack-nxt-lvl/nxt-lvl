(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) root.NxtAchCheckout = api.attach(root);
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const RECEIPT_KEY = 'nxtAchReceiptV1';
  const ATTEMPT_KEY = 'nxtAchAttemptV1';
  const STATUSES = new Set(['pending', 'processing', 'paid', 'cancelled']);

  function safeInvoiceUrl(value) {
    let url;
    try { url = new URL(String(value)); } catch (_) { throw new Error('The bank-payment link could not be verified. Contact support.'); }
    if (url.href !== String(value) || url.origin !== 'https://app.mercury.com' || url.username || url.password || url.search || url.hash
      || !/^\/pay\/[A-Za-z0-9_-]+$/.test(url.pathname)) {
      throw new Error('The bank-payment link could not be verified. Contact support.');
    }
    return url.href;
  }

  function normalizeReceipt(data, previous) {
    if (!data || typeof data.orderId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(data.orderId)
      || !Number.isSafeInteger(data.totalCents) || data.totalCents <= 0 || !STATUSES.has(data.status)) {
      throw new Error('The bank-payment response could not be verified. Contact support before retrying.');
    }
    const token = data.receiptToken || previous?.receiptToken;
    if (typeof token !== 'string' || token.length < 20 || token.length > 4096 || /[\s\u0000-\u001f]/.test(token)) {
      throw new Error('The bank-payment receipt could not be verified. Contact support.');
    }
    const invoiceUrl = safeInvoiceUrl(data.invoiceUrl || previous?.invoiceUrl);
    if (previous && (data.orderId !== previous.orderId || data.totalCents !== previous.totalCents
      || invoiceUrl !== previous.invoiceUrl)) {
      throw new Error('The payment status does not match this order. Contact support before paying.');
    }
    return { orderId: data.orderId, totalCents: data.totalCents, status: data.status, invoiceUrl, receiptToken: token };
  }

  function createClient({ fetch: fetchRequest, storage, crypto }) {
    const read = (key) => { try { return JSON.parse(storage.getItem(key) || 'null'); } catch (_) { return null; } };
    const write = (key, value) => { try { storage.setItem(key, JSON.stringify(value)); } catch (_) {} };
    const remove = (key) => { try { storage.removeItem(key); } catch (_) {} };
    let currentAttempt = read(ATTEMPT_KEY);
    let currentReceipt = null;

    function readReceipt() {
      try { return normalizeReceipt(currentReceipt || read(RECEIPT_KEY)); } catch (_) { return null; }
    }

    function saveReceipt(receipt) {
      currentReceipt = receipt;
      write(RECEIPT_KEY, receipt);
      return receipt;
    }

    async function create(details) {
      if (!crypto?.subtle || typeof crypto.randomUUID !== 'function') {
        throw new Error('Your browser cannot start a secure bank payment. Please update your browser.');
      }
      // Hash the order details; never persist the private purchaser approval code.
      const canonical = JSON.stringify({ items: details.items, fulfillment: details.fulfillment,
        customer: details.customer, promoCode: details.promoCode || '' });
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
      const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if (!currentAttempt || currentAttempt.fingerprint !== fingerprint || !/^[a-f0-9-]{36}$/i.test(currentAttempt.requestId)) {
        currentAttempt = { fingerprint, requestId: crypto.randomUUID() };
        write(ATTEMPT_KEY, currentAttempt);
      }
      const body = JSON.stringify({ requestId: currentAttempt.requestId, items: details.items,
        fulfillment: details.fulfillment, customer: details.customer, promoCode: details.promoCode,
        researchApprovalCode: details.researchApprovalCode, researchConsent: details.researchConsent });
      // An uncertain response keeps this exact request ID for the next retry.
      const response = await fetchRequest('/api/create-ach-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body, cache: 'no-store', signal: AbortSignal.timeout(60000),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not create the bank-payment invoice. Contact support before retrying.');
      return saveReceipt(normalizeReceipt(data));
    }

    async function status(receipt) {
      const response = await fetchRequest('/api/ach-payment-status', {
        headers: { Accept: 'application/json', Authorization: 'Bearer ' + receipt.receiptToken },
        cache: 'no-store', signal: AbortSignal.timeout(20000),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Payment status is unavailable. Do not submit another payment; check again later.');
      return saveReceipt(normalizeReceipt(data, receipt));
    }

    return { create, status, readReceipt, clearReceipt() { currentReceipt = null; remove(RECEIPT_KEY); remove(ATTEMPT_KEY); currentAttempt = null; } };
  }

  function attach(window) {
    const document = window.document;
    let storage;
    try { storage = window.sessionStorage; } catch (_) { storage = null; }
    const client = createClient({ fetch: window.fetch.bind(window), storage, crypto: window.crypto });
    let currentDialog = null;
    let creating = false;

    const style = document.createElement('style');
    style.textContent = '.nxt-ach-card p,.nxt-ach-card label,.nxt-ach-card .nxt-ach-message{font-size:16px;line-height:1.55}.nxt-ach-card .nxt-ach-order{font-size:16px;margin:18px 0;padding:14px;border:1px solid #5c477d;border-radius:12px}.nxt-ach-card .nxt-ach-actions{display:grid;gap:10px;margin-top:20px}.nxt-ach-card .nxt-ach-actions a,.nxt-ach-card .nxt-ach-actions button{display:block;box-sizing:border-box;min-height:48px;margin:0;padding:13px 16px;border-radius:10px;border:1px solid #8061b0;font-family:inherit;font-size:16px;font-weight:600;line-height:1.4;text-align:center;cursor:pointer}.nxt-ach-card .nxt-ach-actions a{background:#7c3aed;color:#fff;text-decoration:none}.nxt-ach-card .nxt-ach-actions button{background:#242431;color:#e7dfff}.nxt-ach-card .nxt-ach-actions button:disabled{opacity:.6;cursor:wait}.nxt-ach-card .nxt-ach-error{color:#fca5a5}.nxt-ach-card [hidden]{display:none!important}';
    document.head.appendChild(style);

    function makeDialog(title) {
      currentDialog?.remove();
      const previousFocus = document.activeElement;
      const overlay = document.createElement('div');
      overlay.className = 'nxt-checkout-overlay';
      const card = document.createElement('div');
      card.className = 'nxt-checkout-card nxt-ach-card';
      card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true');
      card.setAttribute('aria-label', title);
      const heading = document.createElement('h2'); heading.textContent = title;
      card.appendChild(heading); overlay.appendChild(card); document.body.appendChild(overlay);
      currentDialog = overlay;
      const close = () => { overlay.remove(); if (currentDialog === overlay) currentDialog = null; previousFocus?.focus(); };
      overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !creating) { event.preventDefault(); close(); }
        if (event.key !== 'Tab') return;
        const controls = Array.from(card.querySelectorAll('a,button')).filter(el => !el.hidden && !el.disabled);
        const first = controls[0], last = controls[controls.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
      heading.tabIndex = -1; heading.focus();
      return { overlay, card, heading, close };
    }

    function paragraph(parent, value, className) {
      const element = document.createElement('p'); element.textContent = value;
      if (className) element.className = className;
      parent.appendChild(element); return element;
    }

    function showReceipt(initial, verified) {
      let receipt = initial;
      const dialog = makeDialog('Bank payment');
      paragraph(dialog.card, 'Continue on Mercury’s secure website. Connect your bank through Plaid and authorize this payment there. Mercury may ask you to create a payer account.');
      const order = paragraph(dialog.card, 'Order ' + receipt.orderId + ' · $' + (receipt.totalCents / 100).toFixed(2), 'nxt-ach-order');
      const message = paragraph(dialog.card, '', 'nxt-ach-message'); message.setAttribute('role', 'status');
      const error = paragraph(dialog.card, '', 'nxt-ach-error'); error.setAttribute('role', 'alert');
      paragraph(dialog.card, 'ACH payments typically post in 1–5 business days. Opening the payment page or connecting a bank does not confirm payment.');
      const actions = document.createElement('div'); actions.className = 'nxt-ach-actions';
      const pay = document.createElement('a'); pay.href = receipt.invoiceUrl; pay.target = '_blank';
      pay.rel = 'noopener noreferrer'; pay.referrerPolicy = 'no-referrer'; pay.textContent = 'Open secure Mercury payment';
      const check = document.createElement('button'); check.type = 'button'; check.textContent = 'Check payment status';
      const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close';
      actions.append(pay, check, close); dialog.card.appendChild(actions);
      function render(isVerified) {
        pay.hidden = !isVerified || receipt.status !== 'pending';
        dialog.heading.textContent = !isVerified ? 'Check your saved bank payment' : ({pending:'Bank payment ready',processing:'Bank payment processing',paid:'Payment confirmed',cancelled:'Invoice cancelled'})[receipt.status];
        message.textContent = !isVerified ? 'Check the current status before continuing with this invoice.' : ({
          pending: 'Awaiting payment. Open Mercury to review the invoice and authorize your bank payment.',
          processing: 'Mercury reports that your payment is processing. Do not pay this order again.',
          paid: 'Mercury confirms that this invoice is paid. Your order is awaiting fulfillment review. Do not pay it again.',
          cancelled: 'This invoice was cancelled. Contact support before starting another payment.',
        })[receipt.status];
        order.textContent = 'Order ' + receipt.orderId + ' · $' + (receipt.totalCents / 100).toFixed(2);
        close.textContent = isVerified && (receipt.status === 'paid' || receipt.status === 'cancelled') ? 'Done' : 'Close';
      }
      let busy = false;
      async function checkStatus() {
        if (busy) return; busy = true; check.disabled = true; check.textContent = 'Checking payment…'; error.textContent = '';
        pay.hidden = true;
        try { receipt = await client.status(receipt); verified = true; render(true); }
        catch (err) { error.textContent = err.message || 'Could not check payment status. Do not pay again until status is confirmed.'; }
        finally { busy = false; check.disabled = false; check.textContent = 'Check payment status'; }
      }
      check.onclick = checkStatus;
      pay.onclick = () => {
        pay.hidden = true;
        message.textContent = 'Complete your payment on Mercury, then check its status here. Do not submit a second payment while the first is processing.';
      };
      close.onclick = () => {
        if (verified && (receipt.status === 'paid' || receipt.status === 'cancelled')) client.clearReceipt();
        dialog.close();
      };
      render(verified);
      if (!verified) checkStatus();
      return dialog;
    }

    function resume() {
      const receipt = client.readReceipt();
      if (!receipt) return false;
      // Persisted browser state is never treated as proof of payment.
      showReceipt(receipt, false); return true;
    }

    async function start(details) {
      if (creating) return;
      if (resume()) return;
      creating = true;
      const progress = makeDialog('Preparing your bank payment');
      paragraph(progress.card, 'Creating your order-specific Mercury invoice. No bank debit has been authorized yet.');
      try {
        const receipt = await client.create(details);
        progress.close(); showReceipt(receipt, true);
      } catch (err) {
        progress.close();
        const failed = makeDialog('Bank payment not confirmed');
        paragraph(failed.card, err.message || 'The request could not be confirmed. Check with support before paying again.', 'nxt-ach-error');
        paragraph(failed.card, 'Your cart is saved. Retrying the same order reuses its original payment request.');
        const actions = document.createElement('div'); actions.className = 'nxt-ach-actions';
        const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Retry this request';
        retry.onclick = () => { failed.close(); start(details); };
        const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close'; close.onclick = failed.close;
        actions.append(retry, close); failed.card.appendChild(actions);
      } finally { creating = false; }
    }

    return { start, resume };
  }

  return { RECEIPT_KEY, ATTEMPT_KEY, safeInvoiceUrl, normalizeReceipt, createClient, attach };
});
