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

  function paymentDetails(modal) {
    const text = modal.textContent || '';
    const match = text.match(/([0-9]+(?:\.[0-9]+)?)\s+(BTC|LTC|ETH|USDTTRC20|USDT)/i);
    const copyButton = modal.querySelector('#copyCryptoAddress');
    const address = copyButton?.previousElementSibling?.textContent?.trim() || '';
    if (!match || !address) return null;
    return {
      amount: match[1],
      currency: match[2].toLowerCase(),
      address
    };
  }

  function walletUri(details) {
    if (details.currency === 'btc') {
      return `bitcoin:${details.address}?amount=${encodeURIComponent(details.amount)}`;
    }
    if (details.currency === 'ltc') {
      return `litecoin:${details.address}?amount=${encodeURIComponent(details.amount)}`;
    }
    return null;
  }

  function button(label, href, primary = false) {
    const a = document.createElement('a');
    a.textContent = label;
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.cssText = `
      display:flex;
      align-items:center;
      justify-content:center;
      min-height:48px;
      padding:12px 14px;
      border-radius:10px;
      text-decoration:none;
      text-align:center;
      font:700 13px Inter, sans-serif;
      color:#fff;
      border:1px solid ${primary ? 'rgba(196,181,253,.45)' : 'rgba(255,255,255,.10)'};
      background:${primary ? 'linear-gradient(135deg,#8b5cf6,#5b21b6)' : '#1d1d27'};
      box-shadow:${primary ? '0 10px 28px rgba(91,33,182,.28)' : 'none'};
      cursor:pointer;
    `;
    return a;
  }

  function enhancePaymentModal(modal) {
    if (modal.dataset.walletEnhanced === '1') return;
    const details = paymentDetails(modal);
    if (!details) return;
    modal.dataset.walletEnhanced = '1';

    const copyButton = modal.querySelector('#copyCryptoAddress');
    if (!copyButton) return;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,.08);text-align:left;';

    const title = document.createElement('div');
    title.textContent = 'Choose how you want to pay';
    title.style.cssText = 'font:800 15px Inter,sans-serif;color:#fff;margin-bottom:5px;';

    const sub = document.createElement('div');
    sub.textContent = 'Already have crypto? Open your wallet. Need crypto? Buy it with Apple Pay, debit, or credit card.';
    sub.style.cssText = 'font:500 11px/1.5 Inter,sans-serif;color:#9999aa;margin-bottom:12px;';

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;';

    const uri = walletUri(details);
    if (uri) grid.appendChild(button('Open Crypto Wallet', uri, true));

    const coinbaseAsset = assetNames[details.currency] || 'crypto';
    grid.appendChild(button('Open Coinbase', `https://www.coinbase.com/price/${coinbaseAsset}`, !uri));

    if (details.currency === 'btc') {
      grid.appendChild(button('Cash App — Buy / Send BTC', 'https://cash.app/bitcoin'));
    }

    const cardTitle = document.createElement('div');
    cardTitle.textContent = ' Apple Pay · Debit · Credit Card';
    cardTitle.style.cssText = 'font:800 14px Inter,sans-serif;color:#fff;margin:18px 0 8px;';

    const cardSub = document.createElement('div');
    cardSub.textContent = 'Buy crypto through MoonPay, then send it to the payment address above.';
    cardSub.style.cssText = 'font:500 11px/1.5 Inter,sans-serif;color:#9999aa;margin-bottom:10px;';

    const cardGrid = document.createElement('div');
    cardGrid.style.cssText = 'display:grid;grid-template-columns:1fr;gap:8px;';
    cardGrid.appendChild(button(' Buy Bitcoin (BTC) — Apple Pay / Card', moonPayLinks.btc, true));
    cardGrid.appendChild(button(' Buy Ethereum (ETH) — Apple Pay / Card', moonPayLinks.eth));
    cardGrid.appendChild(button(' Buy Tether (USDT) — Apple Pay / Card', moonPayLinks.usdt));

    const note = document.createElement('div');
    note.textContent = 'MoonPay may offer Apple Pay, debit/credit cards, Google Pay, PayPal, Venmo or other methods depending on the customer, device, region and verification status. After purchasing, the customer must send the exact crypto amount to the payment address shown above.';
    note.style.cssText = 'font:500 10px/1.45 Inter,sans-serif;color:#77778a;margin-top:11px;text-align:center;';

    wrap.append(title, sub, grid, cardTitle, cardSub, cardGrid, note);
    copyButton.insertAdjacentElement('afterend', wrap);
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll('body > div').forEach(el => {
      const text = el.textContent || '';
      if (text.includes('Crypto Payment') || text.includes('Complete Your Payment')) {
        enhancePaymentModal(el);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
