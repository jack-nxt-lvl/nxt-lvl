(() => {
  const STATUS_LABELS = {
    waiting: ['Waiting for payment', 'Send the exact amount shown below.'],
    confirming: ['Payment detected', 'Your transaction is confirming on the blockchain.'],
    confirmed: ['Payment confirmed', 'Confirmation received. Finalizing your order.'],
    sending: ['Payment confirmed', 'Finalizing your order.'],
    partially_paid: ['Partial payment received', 'The full payment amount has not arrived yet.'],
    finished: ['Paid successfully', 'Your payment is complete.'],
    failed: ['Payment failed', 'Please choose another payment method or try again.'],
    refunded: ['Payment refunded', 'This payment was refunded.'],
    expired: ['Quote expired', 'Create a new payment to get a fresh amount and address.']
  };

  const css = document.createElement('style');
  css.textContent = `
    .nxt-conv-total{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;margin:0 0 14px;border:1px solid rgba(167,139,250,.25);border-radius:12px;background:linear-gradient(135deg,rgba(91,33,182,.17),rgba(12,12,20,.78));color:#fff}
    .nxt-conv-total small{display:block;color:#9c9caf;font-size:9px;text-transform:uppercase;letter-spacing:1px;font-weight:800}.nxt-conv-total strong{font-size:21px;color:#c4b5fd}.nxt-conv-recommend{font-size:9px;color:#b6b6c6;text-align:right}.nxt-conv-recommend b{display:block;color:#fff;font-size:10px}
    .nxt-method-shell .nxt-coin-row:first-of-type{border-color:rgba(167,139,250,.58)!important;box-shadow:0 0 0 1px rgba(139,92,246,.12),0 13px 34px rgba(91,33,182,.12)}
    .nxt-method-shell .nxt-coin-row:first-of-type .nxt-row-title:after{content:'  • Recommended';color:#a78bfa;font-size:9px;font-weight:800}
    .nxt-live-status{margin:14px 0;padding:14px 15px;border-radius:12px;border:1px solid rgba(167,139,250,.3);background:linear-gradient(135deg,rgba(91,33,182,.18),rgba(16,16,25,.9));display:flex;align-items:center;gap:12px;text-align:left}
    .nxt-status-dot{width:11px;height:11px;border-radius:50%;background:#a78bfa;box-shadow:0 0 0 6px rgba(139,92,246,.10),0 0 18px rgba(139,92,246,.6);flex:0 0 11px}.nxt-status-dot.confirming{background:#f59e0b}.nxt-status-dot.finished{background:#22c55e}.nxt-status-dot.failed{background:#ef4444}
    .nxt-status-copy strong{display:block;color:#fff;font-size:12px}.nxt-status-copy span{display:block;color:#9d9daf;font-size:9px;margin-top:2px;line-height:1.4}.nxt-status-refresh{margin-left:auto;border:1px solid rgba(255,255,255,.1);background:#1d1d29;color:#ddd;border-radius:8px;padding:7px 9px;font-size:9px;font-weight:800;cursor:pointer}
    .nxt-quote-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;color:#858598;font-size:9px}.nxt-quote-bar b{color:#c4b5fd}.nxt-change-method{border:0;background:none;color:#a78bfa;font-size:9px;font-weight:800;cursor:pointer;padding:0}.nxt-pulse{animation:nxtPulse 1.4s ease-in-out infinite}@keyframes nxtPulse{0%,100%{opacity:.65}50%{opacity:1}}
    @media(max-width:720px){.nxt-conv-total{align-items:flex-start}.nxt-conv-recommend{max-width:135px}.nxt-live-status{align-items:flex-start}.nxt-status-refresh{margin-left:0}}
  `;
  document.head.appendChild(css);

  function money(value) {
    const n = Number(value);
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : '';
  }

  function getCartTotal() {
    try {
      if (typeof window.cartSubtotal === 'function') return Number(window.cartSubtotal()) || 0;
    } catch (_) {}
    try {
      if (typeof cartSubtotal === 'function') return Number(cartSubtotal()) || 0;
    } catch (_) {}
    return 0;
  }

  function addChooserTotal(shell) {
    if (!shell || shell.querySelector('.nxt-conv-total')) return;
    const total = getCartTotal();
    if (!total) return;
    const lead = shell.querySelector('.nxt-lead');
    if (!lead) return;
    const box = document.createElement('div');
    box.className = 'nxt-conv-total';
    box.innerHTML = `<div><small>Order total</small><strong>${money(total)}</strong></div><div class="nxt-conv-recommend"><b>Fastest option</b>Bitcoin is pre-highlighted so customers can get straight to payment.</div>`;
    lead.insertAdjacentElement('afterend', box);

    shell.querySelectorAll('.nxt-coin-row').forEach(row => {
      const title = row.querySelector('.nxt-row-title')?.textContent || '';
      const sub = row.querySelector('.nxt-row-sub');
      if (sub && total) sub.textContent = `${sub.textContent} • Order ${money(total)}`;
      if (/Bitcoin/i.test(title)) row.setAttribute('aria-label', `Pay ${money(total)} using Bitcoin`);
    });
  }

  function parsePaymentId(root) {
    const text = root.textContent || '';
    const match = text.match(/Payment\s*ID\s*:\s*(\d+)/i);
    return match ? match[1] : '';
  }

  function findPaymentModal() {
    return [...document.querySelectorAll('body > div')].find(el => {
      const t = el.textContent || '';
      return /Complete Your Payment|Payment Address|Payment ID/i.test(t) && /Payment ID\s*:\s*\d+/i.test(t);
    });
  }

  function statusClass(status) {
    if (['finished','confirmed','sending'].includes(status)) return 'finished';
    if (['failed','expired','refunded'].includes(status)) return 'failed';
    if (['confirming','partially_paid'].includes(status)) return 'confirming';
    return '';
  }

  function enhancePaymentModal(modal) {
    if (!modal || modal.dataset.nxtConversion === '1') return;
    const paymentId = parsePaymentId(modal);
    if (!paymentId) return;
    modal.dataset.nxtConversion = '1';

    const anchor = modal.querySelector('#copyCryptoAddress') || modal.querySelector('#closePaymentBox');
    if (!anchor) return;

    const total = getCartTotal();
    const status = document.createElement('div');
    status.className = 'nxt-live-status';
    status.innerHTML = `<span class="nxt-status-dot nxt-pulse"></span><div class="nxt-status-copy"><strong>Waiting for payment</strong><span>We automatically check for the transaction. You can leave this screen open.</span></div><button class="nxt-status-refresh" type="button">Check now</button>`;

    const quote = document.createElement('div');
    quote.className = 'nxt-quote-bar';
    quote.innerHTML = `<span>${total ? `Order total <b>${money(total)}</b> • ` : ''}Payment ID ${paymentId}</span><button type="button" class="nxt-change-method">Change payment method</button>`;

    const insertPoint = anchor.closest('.nxt-payment-layout') || anchor.parentElement;
    if (insertPoint) {
      insertPoint.insertAdjacentElement('beforebegin', status);
      status.insertAdjacentElement('afterend', quote);
    }

    let stopped = false;
    let failures = 0;
    async function checkStatus() {
      if (stopped || !document.body.contains(modal)) return;
      const btn = status.querySelector('.nxt-status-refresh');
      if (btn) btn.textContent = 'Checking…';
      try {
        const response = await fetch(`/api/payment-status?payment_id=${encodeURIComponent(paymentId)}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Status check failed');
        failures = 0;
        const s = String(data.payment_status || 'waiting').toLowerCase();
        const copy = STATUS_LABELS[s] || [s.replace(/_/g,' '), 'Payment status updated.'];
        const dot = status.querySelector('.nxt-status-dot');
        dot.className = `nxt-status-dot ${statusClass(s)}${s === 'waiting' ? ' nxt-pulse' : ''}`;
        status.querySelector('.nxt-status-copy strong').textContent = copy[0];
        let detail = copy[1];
        if (Number(data.actually_paid) > 0 && data.pay_currency) detail += ` Received ${data.actually_paid} ${String(data.pay_currency).toUpperCase()}.`;
        status.querySelector('.nxt-status-copy span').textContent = detail;
        if (['finished','failed','refunded','expired'].includes(s)) stopped = true;
      } catch (_) {
        failures += 1;
        if (failures >= 3) status.querySelector('.nxt-status-copy span').textContent = 'Automatic status check is temporarily unavailable. Your payment can still be completed normally.';
      } finally {
        if (btn) btn.textContent = 'Check now';
      }
    }

    status.querySelector('.nxt-status-refresh').onclick = checkStatus;
    quote.querySelector('.nxt-change-method').onclick = () => {
      stopped = true;
      const close = modal.querySelector('#closePaymentBox');
      if (close) close.click();
      else modal.remove();
    };

    checkStatus();
    const timer = setInterval(() => {
      if (stopped || !document.body.contains(modal)) return clearInterval(timer);
      checkStatus();
    }, 8000);
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll('.nxt-method-shell').forEach(addChooserTotal);
    enhancePaymentModal(findPaymentModal());
  });
  observer.observe(document.body, { childList: true, subtree: true });

  document.querySelectorAll('.nxt-method-shell').forEach(addChooserTotal);
  enhancePaymentModal(findPaymentModal());
})();
