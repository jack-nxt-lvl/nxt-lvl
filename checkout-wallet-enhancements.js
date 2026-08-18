(() => {
  const assetNames = {
    btc: 'bitcoin',
    ltc: 'litecoin',
    eth: 'ethereum',
    usdttrc20: 'tether',
    usdt: 'tether'
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
      min-height:46px;
      padding:11px 14px;
      border-radius:9px;
      text-decoration:none;
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
    wrap.style.cssText = 'margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);text-align:left;';

    const title = document.createElement('div');
    title.textContent = 'Fastest way to pay';
    title.style.cssText = 'font:800 14px Inter,sans-serif;color:#fff;margin-bottom:5px;';

    const sub = document.createElement('div');
    sub.textContent = 'Open your wallet, or buy crypto with a card and then send the exact amount above.';
    sub.style.cssText = 'font:500 11px/1.5 Inter,sans-serif;color:#9999aa;margin-bottom:12px;';

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';

    const uri = walletUri(details);
    if (uri) grid.appendChild(button('Open Crypto Wallet', uri, true));

    const coinbaseAsset = assetNames[details.currency] || 'crypto';
    grid.appendChild(button('Open Coinbase', `https://www.coinbase.com/price/${coinbaseAsset}`, !uri));

    if (details.currency === 'btc') {
      grid.appendChild(button('Open Cash App', 'https://cash.app/bitcoin'));
    }

    const cardTitle = document.createElement('div');
    cardTitle.textContent = 'Buy crypto with credit/debit card';
    cardTitle.style.cssText = 'font:800 13px Inter,sans-serif;color:#fff;margin:16px 0 8px;';

    const cardGrid = document.createElement('div');
    cardGrid.style.cssText = 'display:grid;grid-template-columns:1fr;gap:8px;';
    cardGrid.appendChild(button('Buy Bitcoin (BTC) with Card', 'https://www.coinbase.com/price/bitcoin'));
    cardGrid.appendChild(button('Buy Ethereum (ETH) with Card', 'https://www.coinbase.com/price/ethereum'));
    cardGrid.appendChild(button('Buy Tether (USDT) with Card', 'https://www.coinbase.com/price/tether'));

    const note = document.createElement('div');
    note.textContent = 'On Coinbase, choose Buy and select an eligible credit/debit card as the payment method. Card availability, identity verification, fees, and withdrawal timing depend on the customer and provider.';
    note.style.cssText = 'font:500 10px/1.45 Inter,sans-serif;color:#77778a;margin-top:10px;text-align:center;';

    wrap.append(title, sub, grid, cardTitle, cardGrid, note);
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
