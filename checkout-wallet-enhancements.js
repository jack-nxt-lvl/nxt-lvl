(() => {
  const assetNames = {
    btc: 'bitcoin',
    ltc: 'litecoin',
    eth: 'ethereum',
    usdttrc20: 'tether',
    usdt: 'tether'
  };

  const moonPayLinks = {
    btc: 'https://www.moonpay.com/buy/btc',
    eth: 'https://www.moonpay.com/buy/eth',
    usdt: 'https://www.moonpay.com/buy/usdt',
    usdttrc20: 'https://www.moonpay.com/buy/usdt'
  };

  const css = document.createElement('style');
  css.textContent = `
    .nxt-checkout-main{
      width:min(760px,100%)!important;
      min-width:0!important;
    }
    .nxt-payment-options{
      margin-top:22px;
      padding-top:22px;
      border-top:1px solid rgba(255,255,255,.08);
      text-align:left;
      font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    }
    .nxt-pay-intro{
      display:flex;
      align-items:center;
      gap:10px;
      padding:13px 15px;
      margin-bottom:18px;
      border:1px solid rgba(139,92,246,.27);
      border-radius:12px;
      background:linear-gradient(135deg,rgba(91,33,182,.16),rgba(12,12,20,.72));
      color:#d6d3e3;
      font-size:12px;
      line-height:1.45;
    }
    .nxt-pay-intro b{color:#fff}
    .nxt-pay-intro-icon{font-size:19px;color:#a78bfa;filter:drop-shadow(0 0 9px rgba(139,92,246,.6))}
    .nxt-section-title{
      display:flex;
      align-items:center;
      gap:9px;
      margin:19px 0 5px;
      color:#fff;
      font-size:12px;
      font-weight:800;
      letter-spacing:.5px;
      text-transform:uppercase;
    }
    .nxt-step{
      width:25px;height:25px;display:inline-grid;place-items:center;
      border-radius:50%;
      background:linear-gradient(135deg,#a78bfa,#7c3aed);
      box-shadow:0 5px 18px rgba(124,58,237,.3);
      color:#09090e;
      font-size:12px;
      font-weight:900;
      flex:0 0 25px;
    }
    .nxt-section-sub{margin:0 0 11px 34px;color:#8f8fa2;font-size:11px;line-height:1.45}
    .nxt-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:4px}
    .nxt-pay-card{
      min-width:0;
      min-height:112px;
      padding:16px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.11);
      background:linear-gradient(145deg,rgba(25,25,36,.92),rgba(12,12,19,.96));
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      text-align:center;
      transition:.2s ease;
      box-shadow:inset 0 1px rgba(255,255,255,.025);
    }
    .nxt-pay-card.primary{border-color:rgba(167,139,250,.6);background:radial-gradient(circle at 50% 0,rgba(124,58,237,.17),transparent 58%),linear-gradient(145deg,rgba(24,21,38,.96),rgba(11,11,19,.97))}
    .nxt-pay-card:hover{transform:translateY(-2px);border-color:rgba(167,139,250,.45);box-shadow:0 12px 34px rgba(0,0,0,.3)}
    .nxt-card-icon{font-size:25px;line-height:1;margin-bottom:8px}
    .nxt-card-title{font-size:14px;font-weight:800;color:#fff}
    .nxt-card-sub{font-size:11px;color:#9a9aac;margin-top:3px;line-height:1.35}
    .nxt-chip{margin-top:8px;padding:3px 8px;border-radius:99px;background:rgba(124,58,237,.14);color:#c4b5fd;font-size:9px;font-weight:700}
    .nxt-wallet-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    .nxt-action{
      min-width:0;
      min-height:70px;
      padding:11px 10px;
      border-radius:11px;
      border:1px solid rgba(255,255,255,.11);
      background:linear-gradient(145deg,#1a1a25,#101018);
      color:#fff;
      text-decoration:none;
      display:flex;
      align-items:center;
      gap:10px;
      text-align:left;
      cursor:pointer;
      font-family:inherit;
      transition:.2s ease;
    }
    .nxt-action:hover{border-color:rgba(167,139,250,.5);transform:translateY(-1px)}
    .nxt-action.primary{border-color:#8b5cf6;box-shadow:0 0 0 1px rgba(139,92,246,.18),0 10px 30px rgba(91,33,182,.15)}
    .nxt-action-icon{width:35px;height:35px;flex:0 0 35px;border-radius:9px;display:grid;place-items:center;background:rgba(124,58,237,.18);font-size:18px}
    .nxt-action-text{min-width:0}
    .nxt-action-title{display:block;color:#fff;font-size:12px;font-weight:800;line-height:1.25}
    .nxt-action-sub{display:block;color:#8f8fa2;font-size:9px;margin-top:3px;line-height:1.3}
    .nxt-or{display:flex;align-items:center;gap:10px;margin:12px 0;color:#7d7d90;font-size:10px;font-weight:700}.nxt-or:before,.nxt-or:after{content:"";height:1px;background:rgba(255,255,255,.08);flex:1}
    .nxt-qr-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:#12121b}
    .nxt-qr-copy{display:flex;align-items:center;gap:11px;min-width:0}.nxt-qr-icon{font-size:22px}.nxt-qr-title{font-size:12px;font-weight:800;color:#fff}.nxt-qr-sub{font-size:10px;color:#9696a8;margin-top:3px}
    .nxt-qr{width:94px;height:94px;background:#fff;border-radius:8px;padding:5px;object-fit:contain;flex:0 0 94px}
    .nxt-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    .nxt-buy-card{padding:15px 10px 12px;border:1px solid rgba(255,255,255,.11);border-radius:12px;background:linear-gradient(145deg,#1a1a25,#101018);text-align:center;display:flex;flex-direction:column;align-items:center;min-width:0}
    .nxt-coin{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;margin-bottom:8px;font-size:20px;background:rgba(124,58,237,.17)}
    .nxt-buy-title{font-size:12px;color:#fff;font-weight:800;line-height:1.35}.nxt-buy-sub{font-size:9px;color:#9292a4;margin:4px 0 10px;line-height:1.4}
    .nxt-buy-btn{width:100%;min-height:36px;border:0;border-radius:8px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;text-decoration:none;display:grid;place-items:center;font-size:11px;font-weight:800;padding:8px}
    .nxt-methods{margin-top:8px;color:#bdbdca;font-size:9px;font-weight:700;letter-spacing:.3px}
    .nxt-secure{margin-top:15px;text-align:center;color:#77778a;font-size:9px;line-height:1.45}
    .nxt-after-send{margin-top:17px;padding:14px 16px;border:1px solid rgba(139,92,246,.35);border-radius:11px;background:linear-gradient(135deg,rgba(91,33,182,.17),rgba(20,16,32,.65));color:#bdbdca;font-size:10px;line-height:1.5}.nxt-after-send b{color:#fff;font-size:11px}
    .nxt-wallet-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,18px);z-index:1000001;background:#15151f;color:#fff;border:1px solid rgba(167,139,250,.35);padding:12px 16px;border-radius:10px;box-shadow:0 18px 55px rgba(0,0,0,.55);font:700 11px Inter,sans-serif;opacity:0;pointer-events:none;transition:.22s}.nxt-wallet-toast.show{opacity:1;transform:translate(-50%,0)}
    .nxt-wallet-dialog{position:fixed;inset:0;z-index:1000002;background:rgba(0,0,0,.82);display:grid;place-items:center;padding:18px}.nxt-wallet-dialog-card{width:min(460px,96vw);background:#101018;border:1px solid rgba(167,139,250,.28);border-radius:16px;padding:22px;box-shadow:0 30px 90px rgba(0,0,0,.7);color:#fff;font-family:Inter,sans-serif}.nxt-wallet-dialog-card h3{margin:0 0 7px;font-size:18px}.nxt-wallet-dialog-card p{margin:0 0 15px;color:#9b9bad;font-size:11px;line-height:1.5}.nxt-wallet-detail{background:#191925;border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:10px 12px;margin:8px 0;word-break:break-all;font-size:11px;color:#e4e4ec}.nxt-wallet-dialog-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.nxt-wallet-dialog-actions button{min-height:42px;border:0;border-radius:8px;cursor:pointer;font-weight:800;color:#fff;background:#242433}.nxt-wallet-dialog-actions button.primary{background:linear-gradient(135deg,#8b5cf6,#6d28d9)}

    /* Fix the existing payment-address row so it never collapses into a vertical column. */
    #copyCryptoAddress{white-space:nowrap!important;flex:0 0 auto!important;min-width:max-content!important}
    #copyCryptoAddress + .nxt-payment-options{clear:both}

    @media(max-width:760px){
      .nxt-wallet-grid,.nxt-card-grid{grid-template-columns:1fr}
      .nxt-choice-grid{grid-template-columns:1fr}
      .nxt-action{min-height:62px}
      .nxt-qr-row{align-items:flex-start}.nxt-qr{width:82px;height:82px;flex-basis:82px}
    }
  `;
  document.head.appendChild(css);

  function paymentDetails(modal) {
    const text = modal.textContent || '';
    const match = text.match(/([0-9]+(?:\.[0-9]+)?)\s+(BTC|LTC|ETH|USDTTRC20|USDT)/i);
    const copyButton = modal.querySelector('#copyCryptoAddress');
    const addressEl = copyButton?.previousElementSibling;
    const address = addressEl?.textContent?.trim() || '';
    if (!match || !address) return null;
    return { amount: match[1], currency: match[2].toLowerCase(), address, addressEl, copyButton };
  }

  function coinLabel(currency) {
    if (currency === 'btc') return 'Bitcoin (BTC)';
    if (currency === 'ltc') return 'Litecoin (LTC)';
    if (currency === 'eth') return 'Ethereum (ETH)';
    if (currency.includes('usdt')) return 'Tether (USDT)';
    return currency.toUpperCase();
  }

  function walletUri(details) {
    if (details.currency === 'btc') return `bitcoin:${details.address}?amount=${encodeURIComponent(details.amount)}`;
    if (details.currency === 'ltc') return `litecoin:${details.address}?amount=${encodeURIComponent(details.amount)}`;
    if (details.currency === 'eth') return `ethereum:${details.address}`;
    return null;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    ta.remove();
    return Promise.resolve();
  }

  function toast(message) {
    let el = document.querySelector('.nxt-wallet-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'nxt-wallet-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function openWalletDialog(details) {
    const old = document.querySelector('.nxt-wallet-dialog');
    if (old) old.remove();
    const uri = walletUri(details);
    const dialog = document.createElement('div');
    dialog.className = 'nxt-wallet-dialog';
    dialog.innerHTML = `
      <div class="nxt-wallet-dialog-card">
        <h3>Open your crypto wallet</h3>
        <p>We copied the payment address for you. If your device has a compatible wallet installed, use “Try Open Wallet.” If nothing opens, paste the address into Coinbase Wallet, Trust Wallet, Exodus, or another compatible wallet.</p>
        <div class="nxt-wallet-detail"><b>Amount:</b> ${details.amount} ${details.currency.toUpperCase()}</div>
        <div class="nxt-wallet-detail"><b>Address:</b> ${details.address}</div>
        <div class="nxt-wallet-dialog-actions">
          <button type="button" id="nxtWalletClose">Close</button>
          <button type="button" class="primary" id="nxtWalletTry">${uri ? 'Try Open Wallet' : 'Copy Address'}</button>
        </div>
      </div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('#nxtWalletClose').onclick = () => dialog.remove();
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.remove(); });
    dialog.querySelector('#nxtWalletTry').onclick = async () => {
      await copyText(details.address);
      if (uri) {
        try { window.location.href = uri; } catch (_) {}
        toast('Wallet requested. Address copied as backup.');
      } else {
        toast('Payment address copied.');
      }
    };
  }

  function actionButton(icon, title, sub, opts = {}) {
    const el = opts.href ? document.createElement('a') : document.createElement('button');
    el.className = 'nxt-action' + (opts.primary ? ' primary' : '');
    if (opts.href) {
      el.href = opts.href;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else {
      el.type = 'button';
    }
    el.innerHTML = `<span class="nxt-action-icon">${icon}</span><span class="nxt-action-text"><span class="nxt-action-title">${title}</span><span class="nxt-action-sub">${sub}</span></span>`;
    if (opts.onclick) el.onclick = opts.onclick;
    return el;
  }

  function buyCard(icon, title, href, buttonText) {
    const card = document.createElement('div');
    card.className = 'nxt-buy-card';
    card.innerHTML = `
      <div class="nxt-coin">${icon}</div>
      <div class="nxt-buy-title">${title}</div>
      <div class="nxt-buy-sub">Apple Pay / debit / credit card</div>
      <a class="nxt-buy-btn" href="${href}" target="_blank" rel="noopener noreferrer"> ${buttonText}</a>
      <div class="nxt-methods">VISA · Mastercard · Pay</div>`;
    return card;
  }

  function fixAddressLayout(details) {
    const { addressEl, copyButton } = details;
    if (!addressEl || !copyButton) return;

    addressEl.style.setProperty('display', 'block', 'important');
    addressEl.style.setProperty('width', '100%', 'important');
    addressEl.style.setProperty('min-width', '0', 'important');
    addressEl.style.setProperty('max-width', '100%', 'important');
    addressEl.style.setProperty('word-break', 'break-all', 'important');
    addressEl.style.setProperty('white-space', 'normal', 'important');
    addressEl.style.setProperty('line-height', '1.45', 'important');
    addressEl.style.setProperty('text-align', 'left', 'important');

    const parent = addressEl.parentElement;
    if (parent && parent !== copyButton.parentElement) return;
    if (parent) {
      parent.style.setProperty('display', 'flex', 'important');
      parent.style.setProperty('align-items', 'center', 'important');
      parent.style.setProperty('gap', '9px', 'important');
      parent.style.setProperty('width', '100%', 'important');
      parent.style.setProperty('min-width', '0', 'important');
      parent.style.setProperty('flex-wrap', 'nowrap', 'important');
    }
  }

  function enhancePaymentModal(modal) {
    if (modal.dataset.walletEnhanced === '2') return;
    const details = paymentDetails(modal);
    if (!details) return;
    modal.dataset.walletEnhanced = '2';

    const mainSection = modal.querySelector('section');
    if (mainSection) mainSection.classList.add('nxt-checkout-main');

    fixAddressLayout(details);

    const wrap = document.createElement('div');
    wrap.className = 'nxt-payment-options';

    const intro = document.createElement('div');
    intro.className = 'nxt-pay-intro';
    intro.innerHTML = `<span class="nxt-pay-intro-icon">⚡</span><span><b>Fastest way to pay:</b> Open your wallet if you already have crypto, or buy crypto with Apple Pay / card and send it to the address above.</span>`;
    wrap.appendChild(intro);

    const chooseTitle = document.createElement('div');
    chooseTitle.className = 'nxt-section-title';
    chooseTitle.innerHTML = '<span class="nxt-step">1</span><span>Choose how you want to pay</span>';
    wrap.appendChild(chooseTitle);

    const choiceGrid = document.createElement('div');
    choiceGrid.className = 'nxt-choice-grid';
    choiceGrid.innerHTML = `
      <div class="nxt-pay-card primary"><div class="nxt-card-icon">◈</div><div class="nxt-card-title">Pay with Crypto</div><div class="nxt-card-sub">If you already have crypto</div><div class="nxt-chip">Fast & low fees</div></div>
      <div class="nxt-pay-card"><div class="nxt-card-icon">💳</div><div class="nxt-card-title">Buy Crypto with Card</div><div class="nxt-card-sub">No crypto? Use Apple Pay or card</div><div class="nxt-chip">Easy & secure</div></div>`;
    wrap.appendChild(choiceGrid);

    const walletTitle = document.createElement('div');
    walletTitle.className = 'nxt-section-title';
    walletTitle.innerHTML = '<span class="nxt-step">2</span><span>Pay with crypto</span>';
    wrap.appendChild(walletTitle);
    const walletSub = document.createElement('div');
    walletSub.className = 'nxt-section-sub';
    walletSub.textContent = 'Use your favorite wallet or exchange.';
    wrap.appendChild(walletSub);

    const walletGrid = document.createElement('div');
    walletGrid.className = 'nxt-wallet-grid';
    const coinbaseAsset = assetNames[details.currency] || 'crypto';
    walletGrid.appendChild(actionButton('C', 'Open Coinbase', `Buy & send ${details.currency.toUpperCase()}`, { href: `https://www.coinbase.com/price/${coinbaseAsset}` }));
    if (details.currency === 'btc') walletGrid.appendChild(actionButton('$', 'Cash App', 'Buy / send BTC', { href: 'https://cash.app/bitcoin' }));
    walletGrid.appendChild(actionButton('▣', 'Open Crypto Wallet', 'Use any compatible wallet', {
      primary: true,
      onclick: async () => {
        await copyText(details.address);
        const uri = walletUri(details);
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && uri) {
          try { window.location.href = uri; } catch (_) {}
          setTimeout(() => { if (!document.hidden) openWalletDialog(details); }, 1100);
        } else {
          openWalletDialog(details);
        }
      }
    }));
    wrap.appendChild(walletGrid);

    wrap.insertAdjacentHTML('beforeend', '<div class="nxt-or">OR</div>');

    const qrRow = document.createElement('div');
    qrRow.className = 'nxt-qr-row';
    const uriForQr = walletUri(details) || details.address;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(uriForQr)}`;
    qrRow.innerHTML = `<div class="nxt-qr-copy"><div class="nxt-qr-icon">⌗</div><div><div class="nxt-qr-title">Scan QR Code to Pay</div><div class="nxt-qr-sub">Open in your wallet to send the exact amount</div></div></div><img class="nxt-qr" src="${qrSrc}" alt="Payment QR code">`;
    wrap.appendChild(qrRow);

    const cardTitle = document.createElement('div');
    cardTitle.className = 'nxt-section-title';
    cardTitle.innerHTML = '<span class="nxt-step">3</span><span>Buy crypto with Apple Pay or card</span>';
    wrap.appendChild(cardTitle);
    const cardSub = document.createElement('div');
    cardSub.className = 'nxt-section-sub';
    cardSub.textContent = 'Purchase through MoonPay, then send the crypto to the payment address above.';
    wrap.appendChild(cardSub);

    const cardGrid = document.createElement('div');
    cardGrid.className = 'nxt-card-grid';
    cardGrid.appendChild(buyCard('₿', 'Buy Bitcoin (BTC)', moonPayLinks.btc, 'Buy BTC'));
    cardGrid.appendChild(buyCard('◆', 'Buy Ethereum (ETH)', moonPayLinks.eth, 'Buy ETH'));
    cardGrid.appendChild(buyCard('₮', 'Buy Tether (USDT)', moonPayLinks.usdt, 'Buy USDT'));
    wrap.appendChild(cardGrid);

    const secure = document.createElement('div');
    secure.className = 'nxt-secure';
    secure.textContent = '🔒 Powered by trusted providers. Payment method availability depends on device, region and provider eligibility.';
    wrap.appendChild(secure);

    const afterSend = document.createElement('div');
    afterSend.className = 'nxt-after-send';
    afterSend.innerHTML = '<b>◷ After You Send</b><br>Once you send the exact amount, your payment can be detected and confirmed by the existing checkout payment processor.';
    wrap.appendChild(afterSend);

    details.copyButton.insertAdjacentElement('afterend', wrap);
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll('body > div').forEach(el => {
      const text = el.textContent || '';
      if (text.includes('Crypto Payment') || text.includes('Complete Your Payment')) enhancePaymentModal(el);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
