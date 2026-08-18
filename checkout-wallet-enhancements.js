(() => {
  const MOONPAY = {
    btc: 'https://www.moonpay.com/buy/btc',
    eth: 'https://www.moonpay.com/buy/eth',
    usdt: 'https://www.moonpay.com/buy/usdt'
  };

  const COINBASE = {
    btc: 'https://www.coinbase.com/price/bitcoin',
    eth: 'https://www.coinbase.com/price/ethereum',
    ltc: 'https://www.coinbase.com/price/litecoin',
    usdttrc20: 'https://www.coinbase.com/price/tether'
  };

  const style = document.createElement('style');
  style.textContent = `
    .nxt-method-shell{width:min(720px,94vw)!important;max-height:92vh;overflow:auto!important;padding:30px!important;border:1px solid rgba(167,139,250,.28)!important;border-radius:20px!important;background:radial-gradient(circle at 50% -10%,rgba(124,58,237,.15),transparent 38%),linear-gradient(180deg,#11111a,#090910)!important;box-shadow:0 32px 100px rgba(0,0,0,.72)!important;text-align:left!important;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    .nxt-method-shell *{box-sizing:border-box}
    .nxt-method-shell button,.nxt-method-shell a{font-family:inherit}
    .nxt-steps{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:22px;color:#7f7f91;font-size:11px;font-weight:800}
    .nxt-steps span{display:flex;align-items:center;gap:7px}.nxt-steps b{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(255,255,255,.14);background:#171721;color:#aaa}.nxt-steps .on{color:#fff}.nxt-steps .on b{background:linear-gradient(135deg,#9f67ff,#6d28d9);border-color:#9f67ff;color:#fff;box-shadow:0 0 24px rgba(124,58,237,.32)}.nxt-steps i{width:36px;height:1px;background:rgba(255,255,255,.11)}
    .nxt-kicker{color:#b783ff;font-size:11px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase}.nxt-method-shell h2{margin:7px 0 4px!important;font-size:28px!important;line-height:1.08!important;color:#fff!important}.nxt-lead{color:#9b9bad;font-size:12px;margin-bottom:16px}
    .nxt-security{display:flex;align-items:center;justify-content:center;gap:9px;padding:12px 14px;margin-bottom:16px;border-radius:12px;border:1px solid rgba(139,92,246,.28);background:linear-gradient(135deg,rgba(91,33,182,.16),rgba(13,13,20,.76));color:#d6d3df;font-size:11px}.nxt-security strong{color:#fff}
    .nxt-panel{border:1px solid rgba(255,255,255,.09);border-radius:15px;background:linear-gradient(145deg,rgba(18,18,28,.96),rgba(9,9,15,.98));padding:16px;margin-top:12px}
    .nxt-panel-title{display:flex;align-items:center;gap:8px;color:#b783ff;font-size:12px;font-weight:900;letter-spacing:.6px;text-transform:uppercase}.nxt-panel-sub{color:#8f8fa1;font-size:10px;margin:3px 0 11px 27px}
    .nxt-coin-row,.nxt-other-row{width:100%;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:linear-gradient(145deg,#191924,#101017);color:#fff;min-height:72px;padding:11px 13px;margin-top:8px;display:flex;align-items:center;gap:12px;cursor:pointer;text-align:left;text-decoration:none;transition:.2s ease}.nxt-coin-row:hover,.nxt-other-row:hover{border-color:rgba(167,139,250,.52);transform:translateY(-1px);box-shadow:0 10px 30px rgba(0,0,0,.25)}
    .nxt-coin-icon{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;flex:0 0 43px;font-size:21px;font-weight:900}.nxt-btc{background:#f7931a}.nxt-eth{background:linear-gradient(145deg,#647cff,#4155c9)}.nxt-usdt{background:#26a17b}.nxt-ltc{background:#64748b}.nxt-cash{background:#00d64f;border-radius:11px}.nxt-wallet{background:linear-gradient(145deg,#8b5cf6,#5b21b6);border-radius:11px}.nxt-cb{background:#1652f0;border-radius:11px}
    .nxt-row-copy{min-width:0;flex:1}.nxt-row-title{display:block;font-size:13px;font-weight:850;color:#fff}.nxt-row-sub{display:block;font-size:10px;color:#a0a0b1;margin-top:3px}.nxt-row-fast{display:block;color:#a56cff;font-size:9px;font-weight:800;margin-top:4px}.nxt-badges{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.nxt-badge{background:#f5f5f7;color:#111;border-radius:6px;padding:5px 7px;font-size:9px;font-weight:900;white-space:nowrap}.nxt-badge.apple:before{content:' ';}.nxt-arrow{width:28px;height:28px;border-radius:50%;border:1px solid rgba(167,139,250,.4);display:grid;place-items:center;color:#b783ff;font-size:17px;flex:0 0 28px}
    .nxt-network-box{display:none;margin-top:10px;padding:11px;border:1px solid rgba(139,92,246,.22);border-radius:11px;background:#0e0e16}.nxt-network-box.show{display:block}.nxt-network-title{font-size:10px;font-weight:850;color:#fff;margin-bottom:8px}.nxt-network-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.nxt-network-grid button{min-height:38px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:#1b1b26;color:#fff;font-size:10px;font-weight:800;cursor:pointer}.nxt-network-grid button:hover{border-color:#8b5cf6;background:rgba(124,58,237,.16)}
    .nxt-provider-note{margin-top:11px;color:#747486;font-size:9px;text-align:center;line-height:1.45}.nxt-cancel{width:100%;min-height:44px;margin-top:13px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#242431;color:#fff;font-size:11px;font-weight:800;cursor:pointer}

    .nxt-payment-layout{margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);text-align:left;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-payment-layout .nxt-panel{margin-top:10px}.nxt-payment-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.nxt-payment-link{border:1px solid rgba(255,255,255,.1);border-radius:11px;background:linear-gradient(145deg,#191924,#101017);min-height:78px;padding:12px;color:#fff;text-decoration:none;display:flex;align-items:center;gap:9px;transition:.2s}.nxt-payment-link:hover{border-color:rgba(167,139,250,.5);transform:translateY(-1px)}.nxt-payment-link strong{display:block;font-size:11px}.nxt-payment-link small{display:block;color:#9292a4;font-size:9px;margin-top:3px;line-height:1.35}
    .nxt-wallet-btn{width:100%;border:1px solid rgba(167,139,250,.45);border-radius:11px;background:linear-gradient(135deg,rgba(91,33,182,.26),rgba(20,18,31,.95));min-height:64px;padding:12px;color:#fff;display:flex;align-items:center;gap:10px;cursor:pointer;text-align:left}.nxt-wallet-btn strong{display:block;font-size:12px}.nxt-wallet-btn small{display:block;color:#aaa9bc;font-size:9px;margin-top:3px}
    .nxt-address-fix{word-break:break-all!important;white-space:normal!important;min-width:0!important;width:100%!important;display:block!important}
    #copyCryptoAddress{white-space:nowrap!important;display:inline-flex!important;align-items:center!important;justify-content:center!important}
    .nxt-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,18px);z-index:1000003;background:#15151f;color:#fff;border:1px solid rgba(167,139,250,.34);padding:12px 16px;border-radius:10px;opacity:0;pointer-events:none;transition:.2s;font:700 11px Inter,sans-serif}.nxt-toast.show{opacity:1;transform:translate(-50%,0)}
    .nxt-wallet-dialog{position:fixed;inset:0;z-index:1000002;background:rgba(0,0,0,.82);display:grid;place-items:center;padding:18px}.nxt-wallet-dialog-card{width:min(460px,96vw);background:#101018;border:1px solid rgba(167,139,250,.28);border-radius:16px;padding:22px;box-shadow:0 30px 90px rgba(0,0,0,.7);color:#fff;font-family:Inter,sans-serif}.nxt-wallet-dialog-card h3{margin:0 0 7px;font-size:18px}.nxt-wallet-dialog-card p{margin:0 0 14px;color:#9b9bad;font-size:11px;line-height:1.5}.nxt-wallet-detail{background:#191925;border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:10px 12px;margin:8px 0;word-break:break-all;font-size:11px}.nxt-wallet-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}.nxt-wallet-actions button{min-height:42px;border:0;border-radius:8px;background:#272735;color:#fff;font-weight:800;cursor:pointer}.nxt-wallet-actions .primary{background:linear-gradient(135deg,#8b5cf6,#6d28d9)}
    @media(max-width:720px){.nxt-method-shell{padding:20px!important}.nxt-method-shell h2{font-size:23px!important}.nxt-badges{display:none}.nxt-network-grid{grid-template-columns:1fr 1fr}.nxt-payment-grid{grid-template-columns:1fr}.nxt-steps i{width:18px}.nxt-steps{font-size:9px}}
  `;
  document.head.appendChild(style);

  function nativeCryptoButtons(modal){
    const map = {};
    modal.querySelectorAll('[data-crypto]').forEach(btn => { map[(btn.dataset.crypto || '').toLowerCase()] = btn; });
    return map;
  }

  function triggerNative(btn){ if (btn) btn.click(); }

  function networkSelector(map){
    const box = document.createElement('div');
    box.className = 'nxt-network-box';
    box.innerHTML = '<div class="nxt-network-title">Choose the network you want to send from</div><div class="nxt-network-grid"></div>';
    const grid = box.querySelector('.nxt-network-grid');
    [['BTC','btc'],['ETH','eth'],['LTC','ltc'],['USDT','usdttrc20']].forEach(([label,key]) => {
      if (!map[key]) return;
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label; b.onclick = () => triggerNative(map[key]); grid.appendChild(b);
    });
    return box;
  }

  function coinRow(icon, iconClass, title, sub, key, map){
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'nxt-coin-row';
    b.innerHTML = `<span class="nxt-coin-icon ${iconClass}">${icon}</span><span class="nxt-row-copy"><span class="nxt-row-title">${title}</span><span class="nxt-row-sub">${sub}</span><span class="nxt-row-fast">Fast • Secure • Easy</span></span><span class="nxt-badges"><span class="nxt-badge apple">Pay</span><span class="nxt-badge">VISA</span><span class="nxt-badge">MC</span></span><span class="nxt-arrow">›</span>`;
    b.onclick = () => triggerNative(map[key]);
    return b;
  }

  function otherRow(icon, iconClass, title, sub, handler){
    const b = document.createElement('button');
    b.type='button'; b.className='nxt-other-row';
    b.innerHTML=`<span class="nxt-coin-icon ${iconClass}">${icon}</span><span class="nxt-row-copy"><span class="nxt-row-title">${title}</span><span class="nxt-row-sub">${sub}</span></span><span class="nxt-arrow">›</span>`;
    b.onclick=handler; return b;
  }

  function enhanceChooser(modal){
    if (modal.dataset.nxtChooser === '1') return;
    const map = nativeCryptoButtons(modal);
    if (!map.btc || !map.eth || !map.ltc) return;
    const cancel = modal.querySelector('#cancelCrypto');
    const shell = modal.firstElementChild;
    if (!shell) return;
    modal.dataset.nxtChooser='1';

    Object.values(map).forEach(btn => btn.style.display='none');
    if (cancel) cancel.style.display='none';
    shell.classList.add('nxt-method-shell');
    shell.innerHTML='';

    shell.insertAdjacentHTML('beforeend', `<div class="nxt-steps"><span class="on"><b>1</b>Information</span><i></i><span class="on"><b>2</b>Payment</span><i></i><span><b>3</b>Confirmation</span></div><div class="nxt-kicker">Crypto Checkout</div><h2>Choose Your Payment Method</h2><div class="nxt-lead">Select the fastest and easiest way to pay.</div><div class="nxt-security">🛡️ <strong>Secure Checkout</strong> — choose a payment route below.</div>`);

    const instant = document.createElement('div'); instant.className='nxt-panel'; instant.innerHTML='<div class="nxt-panel-title">⚡ Buy Crypto Instantly</div><div class="nxt-panel-sub">Choose the crypto you want to use. Apple Pay, debit and credit card options are available through the purchase provider on the next step.</div>';
    instant.appendChild(coinRow('₿','nxt-btc','Buy Bitcoin (BTC)','Apple Pay, Debit/Credit Card','btc',map));
    instant.appendChild(coinRow('♦','nxt-eth','Buy Ethereum (ETH)','Apple Pay, Debit/Credit Card','eth',map));
    if (map.usdttrc20) instant.appendChild(coinRow('₮','nxt-usdt','Buy Tether (USDT)','Apple Pay, Debit/Credit Card','usdttrc20',map));
    shell.appendChild(instant);

    const other=document.createElement('div'); other.className='nxt-panel'; other.innerHTML='<div class="nxt-panel-title">▣ Other Payment Options</div><div class="nxt-panel-sub">Pay from Cash App, Coinbase, or your own private wallet.</div>';
    other.appendChild(otherRow('$','nxt-cash','Cash App','Pay with Bitcoin using Cash App',()=>triggerNative(map.btc)));
    const walletSelect=networkSelector(map); const walletBtn=otherRow('▣','nxt-wallet','Pay with Crypto Wallet','Send from your private wallet',()=>walletSelect.classList.toggle('show')); other.appendChild(walletBtn); other.appendChild(walletSelect);
    const cbSelect=networkSelector(map); const cbBtn=otherRow('C','nxt-cb','Open Coinbase','Choose a network, then use Coinbase to send',()=>cbSelect.classList.toggle('show')); other.appendChild(cbBtn); other.appendChild(cbSelect);
    shell.appendChild(other);

    const note=document.createElement('div'); note.className='nxt-provider-note'; note.textContent='Apple Pay and card availability depends on the provider, device, region and verification status. Selecting a network creates the exact payment address for this order.'; shell.appendChild(note);
    const c=document.createElement('button'); c.type='button'; c.className='nxt-cancel'; c.textContent='Cancel'; c.onclick=()=>{ if(cancel) cancel.click(); else modal.remove(); }; shell.appendChild(c);
  }

  function paymentDetails(modal){
    const text=modal.textContent||'';
    const match=text.match(/([0-9]+(?:\.[0-9]+)?)\s+(BTC|LTC|ETH|USDTTRC20|USDT)/i);
    const copy=modal.querySelector('#copyCryptoAddress');
    const addressEl=copy?.previousElementSibling;
    const address=addressEl?.textContent?.trim()||'';
    if(!match||!copy||!address) return null;
    return {amount:match[1],currency:match[2].toLowerCase(),address,addressEl,copy};
  }

  function walletUri(d){
    if(d.currency==='btc') return `bitcoin:${d.address}?amount=${encodeURIComponent(d.amount)}`;
    if(d.currency==='ltc') return `litecoin:${d.address}?amount=${encodeURIComponent(d.amount)}`;
    if(d.currency==='eth') return `ethereum:${d.address}`;
    return '';
  }

  function copyText(text){
    if(navigator.clipboard&&window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy')}catch(_){ } ta.remove(); return Promise.resolve();
  }

  function toast(msg){
    let t=document.querySelector('.nxt-toast'); if(!t){t=document.createElement('div');t.className='nxt-toast';document.body.appendChild(t)} t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2500);
  }

  function openWallet(d){
    copyText(d.address);
    const old=document.querySelector('.nxt-wallet-dialog'); if(old) old.remove();
    const uri=walletUri(d); const dialog=document.createElement('div'); dialog.className='nxt-wallet-dialog';
    dialog.innerHTML=`<div class="nxt-wallet-dialog-card"><h3>Pay with your crypto wallet</h3><p>The payment address has been copied. On mobile, “Try Open Wallet” can launch a compatible wallet. On desktop, paste the address into your preferred wallet or exchange.</p><div class="nxt-wallet-detail"><b>Amount:</b> ${d.amount} ${d.currency.toUpperCase()}</div><div class="nxt-wallet-detail"><b>Address:</b> ${d.address}</div><div class="nxt-wallet-actions"><button id="nxtWalletClose">Close</button><button class="primary" id="nxtWalletOpen">${uri?'Try Open Wallet':'Copy Address'}</button></div></div>`;
    document.body.appendChild(dialog); dialog.querySelector('#nxtWalletClose').onclick=()=>dialog.remove(); dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.remove()}); dialog.querySelector('#nxtWalletOpen').onclick=async()=>{await copyText(d.address); if(uri){window.location.href=uri;toast('Wallet requested. Address copied as backup.')}else toast('Payment address copied.')};
  }

  function paymentLink(icon,title,sub,href){
    const a=document.createElement('a');a.className='nxt-payment-link';a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.innerHTML=`<span class="nxt-coin-icon nxt-wallet">${icon}</span><span><strong>${title}</strong><small>${sub}</small></span>`;return a;
  }

  function enhancePayment(modal){
    if(modal.dataset.nxtPayment==='1') return;
    const d=paymentDetails(modal); if(!d) return; modal.dataset.nxtPayment='1';
    d.addressEl.classList.add('nxt-address-fix');
    const wrap=document.createElement('div');wrap.className='nxt-payment-layout';
    wrap.innerHTML='<div class="nxt-security">⚡ <strong>Fastest way to pay:</strong> use your wallet, Coinbase, Cash App for BTC, or buy crypto with Apple Pay/card.</div>';

    const wallet=document.createElement('button');wallet.type='button';wallet.className='nxt-wallet-btn';wallet.innerHTML='<span class="nxt-coin-icon nxt-wallet">▣</span><span><strong>Pay with Private Crypto Wallet</strong><small>Open a compatible wallet or copy the exact payment address</small></span>';wallet.onclick=()=>openWallet(d);wrap.appendChild(wallet);

    const p=document.createElement('div');p.className='nxt-panel';p.innerHTML='<div class="nxt-panel-title">▣ Wallets & Exchanges</div><div class="nxt-panel-sub">Use an app you already have.</div><div class="nxt-payment-grid"></div>';const pg=p.querySelector('.nxt-payment-grid');
    pg.appendChild(paymentLink('C','Open Coinbase','Buy or send the selected crypto',COINBASE[d.currency]||'https://www.coinbase.com/'));
    if(d.currency==='btc') pg.appendChild(paymentLink('$','Cash App','Buy or send Bitcoin','https://cash.app/bitcoin'));
    const uri=walletUri(d); if(uri) pg.appendChild(paymentLink('▣','Open Wallet','Launch a compatible wallet',uri)); wrap.appendChild(p);

    const buy=document.createElement('div');buy.className='nxt-panel';buy.innerHTML='<div class="nxt-panel-title">⚡ Apple Pay · Debit · Credit Card</div><div class="nxt-panel-sub">Buy crypto through MoonPay, then send it to the exact address above.</div><div class="nxt-payment-grid"></div>';const bg=buy.querySelector('.nxt-payment-grid');
    bg.appendChild(paymentLink('₿','Buy Bitcoin (BTC)','Apple Pay / Debit / Credit',MOONPAY.btc));bg.appendChild(paymentLink('♦','Buy Ethereum (ETH)','Apple Pay / Debit / Credit',MOONPAY.eth));bg.appendChild(paymentLink('₮','Buy Tether (USDT)','Apple Pay / Debit / Credit',MOONPAY.usdt));wrap.appendChild(buy);
    const n=document.createElement('div');n.className='nxt-provider-note';n.textContent='Purchase methods and withdrawal timing depend on the provider, device, region and account verification. Always send the exact currency and amount shown above.';wrap.appendChild(n);
    d.copy.insertAdjacentElement('afterend',wrap);
  }

  const observer=new MutationObserver(()=>{
    document.querySelectorAll('body > div').forEach(el=>{
      const text=el.textContent||'';
      if(text.includes('Choose Cryptocurrency')) enhanceChooser(el);
      if(text.includes('Crypto Payment')||text.includes('Complete Your Payment')) enhancePayment(el);
    });
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
