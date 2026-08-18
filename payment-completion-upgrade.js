(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-final-pay{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    .nxt-final-pay .nxt-pay-banner{margin:14px 0 16px;padding:14px 16px;border:1px solid rgba(52,211,153,.24);border-radius:12px;background:linear-gradient(135deg,rgba(16,185,129,.09),rgba(15,23,42,.68));display:flex;align-items:flex-start;gap:10px;color:#d1fae5;font-size:11px;line-height:1.5}
    .nxt-final-pay .nxt-pay-banner b{color:#fff;display:block;font-size:12px;margin-bottom:2px}
    .nxt-final-pay .nxt-pay-guide{margin-top:16px;padding:16px;border:1px solid rgba(167,139,250,.20);border-radius:14px;background:linear-gradient(145deg,rgba(23,23,35,.96),rgba(12,12,19,.98))}
    .nxt-final-pay .nxt-pay-guide-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
    .nxt-final-pay .nxt-pay-guide-title strong{font-size:13px;color:#fff}.nxt-final-pay .nxt-pay-guide-title span{font-size:9px;font-weight:850;color:#c4b5fd;border:1px solid rgba(167,139,250,.25);border-radius:999px;padding:5px 8px;background:rgba(124,58,237,.10)}
    .nxt-final-pay .nxt-pay-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    .nxt-final-pay .nxt-pay-step{padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:#111722;min-height:105px}
    .nxt-final-pay .nxt-pay-step b{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;margin-bottom:8px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;font-size:10px}
    .nxt-final-pay .nxt-pay-step strong{display:block;color:#fff;font-size:10.5px;margin-bottom:4px}.nxt-final-pay .nxt-pay-step p{margin:0;color:#a7afbc;font-size:9.5px;line-height:1.5}
    .nxt-final-pay .nxt-pay-confidence{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
    .nxt-final-pay .nxt-confidence-item{padding:10px;border-radius:10px;text-align:center;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025)}
    .nxt-final-pay .nxt-confidence-item strong{display:block;color:#fff;font-size:9.5px;margin-bottom:3px}.nxt-final-pay .nxt-confidence-item span{display:block;color:#929baa;font-size:8.5px;line-height:1.4}
    .nxt-final-pay .nxt-pay-reminder{margin-top:12px;padding:11px 12px;border-radius:10px;border:1px solid rgba(251,191,36,.18);background:rgba(120,53,15,.08);color:#fde68a;font-size:9px;line-height:1.5}
    .nxt-final-pay .nxt-pay-reminder strong{color:#fff}
    .nxt-final-pay .nxt-pay-after{margin-top:12px;padding:12px;border-radius:10px;border:1px solid rgba(56,189,248,.18);background:rgba(8,47,73,.10);color:#bae6fd;font-size:9px;line-height:1.5}
    .nxt-final-pay .nxt-pay-after strong{color:#fff}
    @media(max-width:760px){.nxt-final-pay .nxt-pay-steps,.nxt-final-pay .nxt-pay-confidence{grid-template-columns:1fr}.nxt-final-pay .nxt-pay-step{min-height:0}}
  `;
  document.head.appendChild(style);

  function findPaymentCore(modal){
    const text = modal.textContent || '';
    const amountMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(BTC|ETH|LTC|USDT(?:TRC20)?)/i);
    const copyAddress = modal.querySelector('#copyCryptoAddress') || [...modal.querySelectorAll('button')].find(b => /copy address/i.test(b.textContent||''));
    if (!amountMatch || !copyAddress) return null;
    const addressBox = copyAddress.previousElementSibling;
    const currency = amountMatch[2].toUpperCase();
    return { amount: amountMatch[1], currency, copyAddress, addressBox };
  }

  function enhanceFinalPayment(modal){
    if (!modal || modal.dataset.nxtFinalPay === '1') return;
    const core = findPaymentCore(modal);
    if (!core) return;
    modal.dataset.nxtFinalPay = '1';
    modal.classList.add('nxt-final-pay');

    const shell = modal.firstElementChild || modal;
    const firstHeading = [...shell.querySelectorAll('h1,h2,h3')].find(h => /complete your payment|crypto payment/i.test(h.textContent||''));
    const anchor = firstHeading?.parentElement || shell.firstElementChild || shell;

    const banner = document.createElement('div');
    banner.className = 'nxt-pay-banner';
    banner.innerHTML = '<span style="font-size:18px">✓</span><div><b>Your payment details are ready</b>Use the amount, coin and address shown on this page. After you send it, keep this checkout open while the payment is confirmed.</div>';
    if (anchor && anchor.parentElement) anchor.insertAdjacentElement('afterend', banner); else shell.prepend(banner);

    const guide = document.createElement('div');
    guide.className = 'nxt-pay-guide';
    guide.innerHTML = `
      <div class="nxt-pay-guide-title"><strong>Finish Payment in 3 Simple Steps</strong><span>${core.currency} PAYMENT</span></div>
      <div class="nxt-pay-steps">
        <div class="nxt-pay-step"><b>1</b><strong>Copy the payment details</strong><p>Copy the exact ${core.currency} amount and the receiving address shown above.</p></div>
        <div class="nxt-pay-step"><b>2</b><strong>Send from your wallet or app</strong><p>Open your wallet, Coinbase, Cash App for BTC, or another compatible app and send the same coin on the correct network.</p></div>
        <div class="nxt-pay-step"><b>3</b><strong>Return here and keep this page open</strong><p>Blockchain confirmation can take a little time. This checkout can update after the payment provider sees your transaction.</p></div>
      </div>
      <div class="nxt-pay-confidence">
        <div class="nxt-confidence-item"><strong>Payment-linked order</strong><span>Your payment ID connects this checkout to this order.</span></div>
        <div class="nxt-confidence-item"><strong>Automatic confirmation</strong><span>Status can update after the network and payment provider confirm the transaction.</span></div>
        <div class="nxt-confidence-item"><strong>Fulfillment follows confirmation</strong><span>Confirmed orders move into processing and tracking preparation.</span></div>
      </div>
      <div class="nxt-pay-reminder"><strong>Important:</strong> Send the same cryptocurrency and network shown by checkout. Crypto transfers are generally irreversible, so verify the address before sending.</div>
      <div class="nxt-pay-after"><strong>After payment:</strong> Keep your payment ID for reference. The current fulfillment target is for tracking to be issued within 48 hours after payment confirmation.</div>`;

    const doneBtn = [...shell.querySelectorAll('button')].find(b => /^done$/i.test((b.textContent||'').trim()));
    if (doneBtn) doneBtn.insertAdjacentElement('beforebegin', guide); else shell.appendChild(guide);

    if (core.addressBox) {
      core.addressBox.style.wordBreak = 'break-all';
      core.addressBox.style.whiteSpace = 'normal';
    }
  }

  function inspect(node){
    if (!(node instanceof HTMLElement)) return;
    const candidates = [node, ...node.querySelectorAll(':scope > div')];
    for (const el of candidates) {
      if (el.dataset?.nxtFinalPay === '1') continue;
      const text = el.textContent || '';
      if (text.includes('Complete Your Payment') || text.includes('Crypto Payment')) {
        enhanceFinalPayment(el);
        break;
      }
    }
  }

  document.querySelectorAll('body > div').forEach(inspect);
  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) inspect(node);
  });
  observer.observe(document.body, { childList: true });
})();