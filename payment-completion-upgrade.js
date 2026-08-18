(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-final-pay{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    .nxt-final-pay .nxt-pay-banner{margin:14px 0 16px;padding:15px 16px;border:1px solid rgba(52,211,153,.28);border-radius:12px;background:linear-gradient(135deg,rgba(16,185,129,.11),rgba(15,23,42,.72));display:flex;align-items:flex-start;gap:10px;color:#d1fae5;font-size:12px;line-height:1.55}
    .nxt-final-pay .nxt-pay-banner b{color:#fff;display:block;font-size:13px;margin-bottom:3px}
    .nxt-final-pay .nxt-pay-guide{margin-top:16px;padding:17px;border:1px solid rgba(167,139,250,.24);border-radius:14px;background:linear-gradient(145deg,rgba(23,23,35,.97),rgba(12,12,19,.99));box-shadow:0 18px 50px rgba(0,0,0,.22)}
    .nxt-final-pay .nxt-pay-guide-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}
    .nxt-final-pay .nxt-pay-guide-title strong{font-size:14px;color:#fff}.nxt-final-pay .nxt-pay-guide-title span{font-size:9px;font-weight:900;color:#ddd6fe;border:1px solid rgba(167,139,250,.3);border-radius:999px;padding:5px 9px;background:rgba(124,58,237,.13)}
    .nxt-final-pay .nxt-pay-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    .nxt-final-pay .nxt-pay-step{padding:13px;border:1px solid rgba(255,255,255,.09);border-radius:11px;background:#111722;min-height:110px}
    .nxt-final-pay .nxt-pay-step b{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;margin-bottom:8px;background:linear-gradient(135deg,#9f67ff,#6d28d9);color:#fff;font-size:10px;box-shadow:0 0 18px rgba(124,58,237,.24)}
    .nxt-final-pay .nxt-pay-step strong{display:block;color:#fff;font-size:11px;margin-bottom:4px}.nxt-final-pay .nxt-pay-step p{margin:0;color:#abb3c0;font-size:10px;line-height:1.5}
    .nxt-final-pay .nxt-pay-confidence{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
    .nxt-final-pay .nxt-confidence-item{padding:11px;border-radius:10px;text-align:center;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.028)}
    .nxt-final-pay .nxt-confidence-item strong{display:block;color:#fff;font-size:10px;margin-bottom:3px}.nxt-final-pay .nxt-confidence-item span{display:block;color:#959ead;font-size:9px;line-height:1.45}
    .nxt-final-pay .nxt-pay-reminder{margin-top:12px;padding:12px 13px;border-radius:10px;border:1px solid rgba(251,191,36,.2);background:rgba(120,53,15,.09);color:#fde68a;font-size:9.5px;line-height:1.55}
    .nxt-final-pay .nxt-pay-reminder strong{color:#fff}
    .nxt-final-pay .nxt-pay-after{margin-top:12px;padding:12px 13px;border-radius:10px;border:1px solid rgba(56,189,248,.2);background:rgba(8,47,73,.11);color:#bae6fd;font-size:9.5px;line-height:1.55}
    .nxt-final-pay .nxt-pay-after strong{color:#fff}
    @media(max-width:760px){.nxt-final-pay .nxt-pay-steps,.nxt-final-pay .nxt-pay-confidence{grid-template-columns:1fr}.nxt-final-pay .nxt-pay-step{min-height:0}}
  `;
  document.head.appendChild(style);

  function findPaymentCore(root){
    const text = root.textContent || '';
    const amountMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(BTC|ETH|LTC|USDT(?:\s*\(TRC20\)|TRC20)?)/i);
    const copyAddress = root.querySelector('#copyCryptoAddress') || [...root.querySelectorAll('button')].find(b => /copy address/i.test(b.textContent||''));
    if (!amountMatch || !copyAddress) return null;
    const addressBox = copyAddress.previousElementSibling;
    const currency = amountMatch[2].replace(/\s+/g,' ').toUpperCase();
    return { amount: amountMatch[1], currency, copyAddress, addressBox };
  }

  function findFinalPaymentRoot(){
    const headings = [...document.querySelectorAll('h1,h2,h3')];
    const heading = headings.find(h => /complete your payment|crypto payment/i.test(h.textContent||''));
    if (!heading) return null;
    let root = heading.closest('[class*="checkout"], [class*="payment"], .modal, .modal-overlay');
    if (!root) {
      root = heading.parentElement;
      for (let i=0;i<4 && root?.parentElement;i++) {
        if ((root.textContent||'').match(/payment address/i) && [...root.querySelectorAll('button')].some(b=>/copy address/i.test(b.textContent||''))) break;
        root = root.parentElement;
      }
    }
    return root || heading.parentElement;
  }

  function enhanceFinalPayment(root){
    if (!root || root.dataset.nxtFinalPay === '1') return false;
    const core = findPaymentCore(root);
    if (!core) return false;
    root.dataset.nxtFinalPay = '1';
    root.classList.add('nxt-final-pay');

    const firstHeading = [...root.querySelectorAll('h1,h2,h3')].find(h => /complete your payment|crypto payment/i.test(h.textContent||''));
    const anchor = firstHeading?.parentElement || firstHeading;

    const banner = document.createElement('div');
    banner.className = 'nxt-pay-banner';
    banner.innerHTML = '<span style="font-size:19px">✓</span><div><b>Your payment details are ready</b>Use the exact amount, coin and receiving address shown below. After sending, keep this checkout open while the network confirms your payment.</div>';
    if (anchor) anchor.insertAdjacentElement('afterend', banner); else root.prepend(banner);

    const guide = document.createElement('div');
    guide.className = 'nxt-pay-guide';
    guide.innerHTML = `
      <div class="nxt-pay-guide-title"><strong>Finish Payment in 3 Simple Steps</strong><span>${core.currency} PAYMENT</span></div>
      <div class="nxt-pay-steps">
        <div class="nxt-pay-step"><b>1</b><strong>Copy the exact details</strong><p>Copy the amount and receiving address exactly as shown on this checkout.</p></div>
        <div class="nxt-pay-step"><b>2</b><strong>Send from your wallet or app</strong><p>Use the same cryptocurrency and network shown here. Verify the address before you send.</p></div>
        <div class="nxt-pay-step"><b>3</b><strong>Keep this page open</strong><p>Confirmation can take a little time. The payment status can update automatically after the network and processor see the transaction.</p></div>
      </div>
      <div class="nxt-pay-confidence">
        <div class="nxt-confidence-item"><strong>Order-linked payment</strong><span>Your payment ID ties this checkout to this order.</span></div>
        <div class="nxt-confidence-item"><strong>Automatic status check</strong><span>The checkout can detect confirmation after the transaction is seen.</span></div>
        <div class="nxt-confidence-item"><strong>Processing after confirmation</strong><span>Confirmed orders move into fulfillment and tracking preparation.</span></div>
      </div>
      <div class="nxt-pay-reminder"><strong>Before sending:</strong> Confirm the coin, network and first/last characters of the receiving address. Crypto transfers are generally irreversible.</div>
      <div class="nxt-pay-after"><strong>After payment:</strong> Keep your payment ID for reference. The current fulfillment target is for tracking to be issued within 48 hours after payment confirmation.</div>`;

    const doneBtn = [...root.querySelectorAll('button')].find(b => /^done$/i.test((b.textContent||'').trim()));
    if (doneBtn) doneBtn.insertAdjacentElement('beforebegin', guide); else root.appendChild(guide);

    if (core.addressBox) {
      core.addressBox.style.wordBreak = 'break-all';
      core.addressBox.style.whiteSpace = 'normal';
    }
    return true;
  }

  function tryEnhance(){
    const root = findFinalPaymentRoot();
    return enhanceFinalPayment(root);
  }

  if (!tryEnhance()) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (tryEnhance() || attempts >= 120) clearInterval(timer);
    }, 500);
  }
})();