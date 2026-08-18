(() => {
  const MOONPAY = {
    btc: 'https://www.moonpay.com/buy/btc',
    eth: 'https://www.moonpay.com/buy/eth',
    usdt: 'https://www.moonpay.com/buy/usdt'
  };

  const CASH_APP_BTC = 'https://cash.app/bitcoin';
  const COINBASE = {
    btc: 'https://www.coinbase.com/price/bitcoin',
    eth: 'https://www.coinbase.com/price/ethereum',
    ltc: 'https://www.coinbase.com/price/litecoin',
    usdttrc20: 'https://www.coinbase.com/price/tether'
  };

  const style = document.createElement('style');
  style.textContent = `
    .nxt-method-shell{width:min(760px,94vw)!important;max-height:92vh;overflow:auto!important;padding:30px!important;border:1px solid rgba(167,139,250,.28)!important;border-radius:20px!important;background:radial-gradient(circle at 50% -10%,rgba(124,58,237,.15),transparent 38%),linear-gradient(180deg,#11111a,#090910)!important;box-shadow:0 32px 100px rgba(0,0,0,.72)!important;text-align:left!important;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    .nxt-method-shell *{box-sizing:border-box}.nxt-method-shell button,.nxt-method-shell a{font-family:inherit}
    .nxt-steps{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:22px;color:#7f7f91;font-size:11px;font-weight:800}.nxt-steps span{display:flex;align-items:center;gap:7px}.nxt-steps b{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(255,255,255,.14);background:#171721;color:#aaa}.nxt-steps .on{color:#fff}.nxt-steps .on b{background:linear-gradient(135deg,#9f67ff,#6d28d9);border-color:#9f67ff;color:#fff;box-shadow:0 0 24px rgba(124,58,237,.32)}.nxt-steps i{width:36px;height:1px;background:rgba(255,255,255,.11)}
    .nxt-kicker{color:#b783ff;font-size:11px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase}.nxt-method-shell h2{margin:7px 0 4px!important;font-size:28px!important;line-height:1.08!important;color:#fff!important}.nxt-lead{color:#9b9bad;font-size:12px;margin-bottom:16px}
    .nxt-security{display:flex;align-items:center;justify-content:center;gap:9px;padding:12px 14px;margin-bottom:16px;border-radius:12px;border:1px solid rgba(139,92,246,.28);background:linear-gradient(135deg,rgba(91,33,182,.16),rgba(13,13,20,.76));color:#d6d3df;font-size:11px}.nxt-security strong{color:#fff}
    .nxt-panel{border:1px solid rgba(255,255,255,.09);border-radius:15px;background:linear-gradient(145deg,rgba(18,18,28,.96),rgba(9,9,15,.98));padding:16px;margin-top:12px}.nxt-panel-title{display:flex;align-items:center;gap:8px;color:#b783ff;font-size:12px;font-weight:900;letter-spacing:.6px;text-transform:uppercase}.nxt-panel-sub{color:#8f8fa1;font-size:10px;margin:3px 0 11px 27px;line-height:1.45}
    .nxt-coin-row,.nxt-other-row,.nxt-buy-link{width:100%;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:linear-gradient(145deg,#191924,#101017);color:#fff;min-height:72px;padding:11px 13px;margin-top:8px;display:flex;align-items:center;gap:12px;cursor:pointer;text-align:left;text-decoration:none;transition:.2s ease}.nxt-coin-row:hover,.nxt-other-row:hover,.nxt-buy-link:hover{border-color:rgba(167,139,250,.52);transform:translateY(-1px);box-shadow:0 10px 30px rgba(0,0,0,.25)}
    .nxt-coin-icon{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;flex:0 0 43px;font-size:21px;font-weight:900}.nxt-btc{background:#f7931a}.nxt-eth{background:linear-gradient(145deg,#647cff,#4155c9)}.nxt-usdt{background:#26a17b}.nxt-ltc{background:#64748b}.nxt-cash{background:#00d64f;border-radius:11px}.nxt-wallet{background:linear-gradient(145deg,#8b5cf6,#5b21b6);border-radius:11px}.nxt-cb{background:#1652f0;border-radius:11px}.nxt-moon{background:linear-gradient(145deg,#8b5cf6,#d946ef);border-radius:11px}
    .nxt-row-copy{min-width:0;flex:1}.nxt-row-title{display:block;font-size:13px;font-weight:850;color:#fff}.nxt-row-sub{display:block;font-size:10px;color:#a0a0b1;margin-top:3px;line-height:1.35}.nxt-row-fast{display:block;color:#a56cff;font-size:9px;font-weight:800;margin-top:4px}.nxt-badges{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.nxt-badge{background:#f5f5f7;color:#111;border-radius:6px;padding:5px 7px;font-size:9px;font-weight:900;white-space:nowrap}.nxt-badge.apple:before{content:' '}.nxt-arrow{width:28px;height:28px;border-radius:50%;border:1px solid rgba(167,139,250,.4);display:grid;place-items:center;color:#b783ff;font-size:17px;flex:0 0 28px}
    .nxt-network-box{display:none;margin-top:10px;padding:11px;border:1px solid rgba(139,92,246,.22);border-radius:11px;background:#0e0e16}.nxt-network-box.show{display:block}.nxt-network-title{font-size:10px;font-weight:850;color:#fff;margin-bottom:8px}.nxt-network-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.nxt-network-grid button{min-height:38px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:#1b1b26;color:#fff;font-size:10px;font-weight:800;cursor:pointer}.nxt-network-grid button:hover{border-color:#8b5cf6;background:rgba(124,58,237,.16)}
    .nxt-buy-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.nxt-buy-link{min-height:82px;margin-top:0}.nxt-provider-note{margin-top:11px;color:#747486;font-size:9px;text-align:center;line-height:1.45}.nxt-cancel{width:100%;min-height:44px;margin-top:13px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#242431;color:#fff;font-size:11px;font-weight:800;cursor:pointer}
    @media(max-width:720px){.nxt-method-shell{padding:20px!important}.nxt-method-shell h2{font-size:23px!important}.nxt-badges{display:none}.nxt-network-grid,.nxt-buy-grid{grid-template-columns:1fr}.nxt-steps i{width:18px}.nxt-steps{font-size:9px}}
  `;
  document.head.appendChild(style);

  function nativeCryptoButtons(modal){
    const map={};
    modal.querySelectorAll('[data-crypto]').forEach(btn=>{map[(btn.dataset.crypto||'').toLowerCase()]=btn;});
    return map;
  }
  function triggerNative(btn){ if(btn) btn.click(); }
  function iconRow(icon,iconClass,title,sub,handler,badges=''){
    const b=document.createElement('button');
    b.type='button'; b.className='nxt-other-row';
    b.innerHTML=`<span class="nxt-coin-icon ${iconClass}">${icon}</span><span class="nxt-row-copy"><span class="nxt-row-title">${title}</span><span class="nxt-row-sub">${sub}</span></span>${badges}<span class="nxt-arrow">›</span>`;
    b.onclick=handler; return b;
  }
  function coinRow(icon,iconClass,title,sub,key,map){
    const badges='<span class="nxt-badges"><span class="nxt-badge">PAY</span></span>';
    return iconRow(icon,iconClass,title,sub,()=>triggerNative(map[key]),badges);
  }
  function buyLink(icon,iconClass,title,sub,href,badges=''){
    const a=document.createElement('a'); a.className='nxt-buy-link'; a.href=href; a.target='_blank'; a.rel='noopener noreferrer';
    a.innerHTML=`<span class="nxt-coin-icon ${iconClass}">${icon}</span><span class="nxt-row-copy"><span class="nxt-row-title">${title}</span><span class="nxt-row-sub">${sub}</span></span>${badges}<span class="nxt-arrow">›</span>`;
    return a;
  }
  function networkSelector(map){
    const box=document.createElement('div'); box.className='nxt-network-box';
    box.innerHTML='<div class="nxt-network-title">Choose the network you want to send from</div><div class="nxt-network-grid"></div>';
    const grid=box.querySelector('.nxt-network-grid');
    [['BTC','btc'],['ETH','eth'],['LTC','ltc'],['USDT','usdttrc20']].forEach(([label,key])=>{
      if(!map[key]) return; const b=document.createElement('button'); b.type='button'; b.textContent=label; b.onclick=()=>triggerNative(map[key]); grid.appendChild(b);
    });
    return box;
  }
  function enhanceChooser(modal){
    if(!modal || modal.dataset.nxtChooser==='1') return;
    const map=nativeCryptoButtons(modal);
    if(!map.btc||!map.eth||!map.ltc) return;
    const cancel=modal.querySelector('#cancelCrypto');
    const shell=modal.firstElementChild; if(!shell) return;
    modal.dataset.nxtChooser='1';
    Object.values(map).forEach(btn=>btn.style.display='none'); if(cancel) cancel.style.display='none';
    shell.classList.add('nxt-method-shell'); shell.innerHTML='';

    shell.insertAdjacentHTML('beforeend','<div class="nxt-steps"><span class="on"><b>1</b>Information</span><i></i><span class="on"><b>2</b>Payment</span><i></i><span><b>3</b>Confirmation</span></div><div class="nxt-kicker">Crypto Checkout</div><h2>Choose Your Payment Method</h2><div class="nxt-lead">Select the fastest and easiest way to pay.</div><div class="nxt-security">🛡️ <strong>Secure Checkout</strong> — choose a payment route below.</div>');

    const pay=document.createElement('div'); pay.className='nxt-panel'; pay.innerHTML='<div class="nxt-panel-title">⚡ Pay With Crypto</div><div class="nxt-panel-sub">Choose the crypto you already have. This creates the exact payment amount and address for your order.</div>';
    pay.appendChild(coinRow('₿','nxt-btc','Bitcoin (BTC)','Create BTC payment details','btc',map));
    pay.appendChild(coinRow('♦','nxt-eth','Ethereum (ETH)','Create ETH payment details','eth',map));
    if(map.usdttrc20) pay.appendChild(coinRow('₮','nxt-usdt','Tether (USDT)','Create USDT payment details','usdttrc20',map));
    pay.appendChild(coinRow('Ł','nxt-ltc','Litecoin (LTC)','Create LTC payment details','ltc',map));
    shell.appendChild(pay);

    const buy=document.createElement('div'); buy.className='nxt-panel'; buy.innerHTML='<div class="nxt-panel-title">💳 Need Crypto? Buy It First</div><div class="nxt-panel-sub">Open a provider in a new tab, buy the crypto, then return here and choose that same coin to create the payment address.</div>';
    const grid=document.createElement('div'); grid.className='nxt-buy-grid';
    const cardBadges='<span class="nxt-badges"><span class="nxt-badge apple">Pay</span><span class="nxt-badge">VISA</span><span class="nxt-badge">MC</span></span>';
    grid.appendChild(buyLink('M','nxt-moon','MoonPay — Buy BTC','Apple Pay / debit / credit card',MOONPAY.btc,cardBadges));
    grid.appendChild(buyLink('M','nxt-moon','MoonPay — Buy ETH','Apple Pay / debit / credit card',MOONPAY.eth,cardBadges));
    grid.appendChild(buyLink('M','nxt-moon','MoonPay — Buy USDT','Apple Pay / debit / credit card',MOONPAY.usdt,cardBadges));
    grid.appendChild(buyLink('$','nxt-cash','Cash App — Buy Bitcoin','Use Cash App funding methods available on your account',CASH_APP_BTC));
    buy.appendChild(grid); shell.appendChild(buy);

    const other=document.createElement('div'); other.className='nxt-panel'; other.innerHTML='<div class="nxt-panel-title">▣ Wallets & Exchanges</div><div class="nxt-panel-sub">Already have crypto? Use Coinbase, Cash App for BTC, or your own private wallet.</div>';
    other.appendChild(iconRow('$','nxt-cash','Cash App','Pay with Bitcoin using Cash App',()=>triggerNative(map.btc)));
    const walletSelect=networkSelector(map); other.appendChild(iconRow('▣','nxt-wallet','Pay with Crypto Wallet','Choose a network and send from your private wallet',()=>walletSelect.classList.toggle('show'))); other.appendChild(walletSelect);
    const cbSelect=networkSelector(map); other.appendChild(iconRow('C','nxt-cb','Open Coinbase','Choose a network, then use Coinbase to send',()=>cbSelect.classList.toggle('show'))); other.appendChild(cbSelect);
    shell.appendChild(other);

    const note=document.createElement('div'); note.className='nxt-provider-note'; note.textContent='Apple Pay, card and Cash App purchase availability can depend on device, region, account and verification status. After buying crypto, return here and choose the same coin to create the exact order payment address.'; shell.appendChild(note);
    const c=document.createElement('button'); c.type='button'; c.className='nxt-cancel'; c.textContent='Cancel'; c.onclick=()=>{if(cancel)cancel.click();else modal.remove();}; shell.appendChild(c);
  }

  function inspectAdded(node){
    if(!(node instanceof HTMLElement)) return;
    const candidates=[node,...node.querySelectorAll(':scope > div')];
    for(const el of candidates){
      if(el.dataset?.nxtChooser==='1') continue;
      const text=el.textContent||'';
      if(text.includes('Choose Cryptocurrency')) { enhanceChooser(el); break; }
    }
  }

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes) inspectAdded(node);
    }
  });
  observer.observe(document.body,{childList:true});
})();