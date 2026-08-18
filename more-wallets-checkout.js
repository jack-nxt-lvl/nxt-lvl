(() => {
  const OFFICIAL = {
    trust: 'https://trustwallet.com/',
    exodus: 'https://www.exodus.com/',
    metamask: 'https://metamask.io/',
    tronlink: 'https://www.tronlink.org/'
  };

  const style = document.createElement('style');
  style.textContent = `
    .nxt-more-wallets-row{width:100%;border:1px solid rgba(167,139,250,.34);border-radius:12px;background:linear-gradient(145deg,rgba(32,25,49,.92),rgba(14,14,22,.98));color:#fff;min-height:72px;padding:11px 13px;margin-top:8px;display:flex;align-items:center;gap:12px;cursor:pointer;text-align:left;transition:.2s ease}
    .nxt-more-wallets-row:hover{border-color:rgba(167,139,250,.65);transform:translateY(-1px)}
    .nxt-more-wallets-icon{width:43px;height:43px;border-radius:11px;display:grid;place-items:center;flex:0 0 43px;background:linear-gradient(145deg,#8b5cf6,#5b21b6);font-size:20px}
    .nxt-more-wallets-copy{min-width:0;flex:1}.nxt-more-wallets-copy strong{display:block;font-size:13px}.nxt-more-wallets-copy small{display:block;color:#9f9fb0;font-size:10px;margin-top:3px}.nxt-more-wallets-arrow{width:28px;height:28px;border-radius:50%;border:1px solid rgba(167,139,250,.45);display:grid;place-items:center;color:#c4b5fd;font-size:17px}
    .nxt-wallet-picker{display:none;margin-top:9px;padding:11px;border:1px solid rgba(139,92,246,.22);border-radius:11px;background:#0d0d15}.nxt-wallet-picker.show{display:block}
    .nxt-wallet-picker-note{font-size:10px;color:#aaaabb;line-height:1.45;margin:0 0 9px}.nxt-wallet-picker-note b{color:#fff}
    .nxt-wallet-choice{width:100%;min-height:56px;border:1px solid rgba(255,255,255,.09);border-radius:10px;background:#181822;color:#fff;padding:9px 11px;margin-top:7px;display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer}.nxt-wallet-choice:hover{border-color:rgba(167,139,250,.5)}
    .nxt-wallet-choice-logo{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;flex:0 0 34px;font-weight:900;background:#252536}.nxt-wallet-choice-text{flex:1;min-width:0}.nxt-wallet-choice-text strong{display:block;font-size:11px}.nxt-wallet-choice-text small{display:block;color:#9292a4;font-size:9px;margin-top:2px}.nxt-wallet-choice-tag{font-size:8px;font-weight:850;padding:3px 6px;border-radius:99px;background:rgba(124,58,237,.16);color:#c4b5fd;white-space:nowrap}
    .nxt-wallet-network{display:none;margin:7px 0 3px 44px;padding:8px;border-radius:9px;background:#11111a;border:1px solid rgba(255,255,255,.07)}.nxt-wallet-network.show{display:block}.nxt-wallet-network-title{font-size:9px;color:#b6b6c5;margin-bottom:6px}.nxt-wallet-network-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.nxt-wallet-network-grid button{min-height:34px;border:1px solid rgba(255,255,255,.09);border-radius:7px;background:#20202b;color:#fff;font-size:9px;font-weight:800;cursor:pointer}.nxt-wallet-network-grid button:hover{border-color:#8b5cf6}
    .nxt-wallet-pay-panel{margin-top:13px;padding:13px;border:1px solid rgba(139,92,246,.26);border-radius:12px;background:linear-gradient(145deg,rgba(21,18,32,.98),rgba(12,12,18,.98));text-align:left;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-wallet-pay-title{font-size:12px;font-weight:900;color:#fff}.nxt-wallet-pay-sub{font-size:9px;color:#9292a4;margin-top:3px;line-height:1.45}.nxt-wallet-pay-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px}.nxt-wallet-pay-btn{min-height:49px;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:#191923;color:#fff;display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;text-align:left}.nxt-wallet-pay-btn:hover{border-color:rgba(167,139,250,.55)}.nxt-wallet-pay-btn strong{display:block;font-size:10px}.nxt-wallet-pay-btn small{display:block;font-size:8px;color:#8d8d9f;margin-top:2px}.nxt-wallet-safety{margin-top:9px;font-size:8px;color:#727284;line-height:1.4;text-align:center}
    .nxt-wallet-toast2{position:fixed;left:50%;bottom:28px;transform:translate(-50%,16px);z-index:1000005;background:#15151f;color:#fff;border:1px solid rgba(167,139,250,.35);padding:11px 15px;border-radius:9px;opacity:0;pointer-events:none;transition:.2s;font:700 10px Inter,sans-serif;box-shadow:0 16px 50px rgba(0,0,0,.5)}.nxt-wallet-toast2.show{opacity:1;transform:translate(-50%,0)}
    @media(max-width:720px){.nxt-wallet-pay-grid{grid-template-columns:1fr}.nxt-wallet-network-grid{grid-template-columns:1fr 1fr}.nxt-wallet-choice-tag{display:none}}
  `;
  document.head.appendChild(style);

  function toast(msg){
    let t=document.querySelector('.nxt-wallet-toast2');
    if(!t){t=document.createElement('div');t.className='nxt-wallet-toast2';document.body.appendChild(t)}
    t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2600);
  }

  async function copyText(text){
    try{
      if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(text);return true}
      const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();return true;
    }catch(_){return false}
  }

  function clickPaymentRoute(label){
    const rows=[...document.querySelectorAll('.nxt-coin-row')];
    const hit=rows.find(r=>(r.textContent||'').toLowerCase().includes(label.toLowerCase()));
    if(hit){hit.click();return true}
    const netBtns=[...document.querySelectorAll('.nxt-network-grid button')];
    const nb=netBtns.find(b=>(b.textContent||'').trim().toLowerCase()===label.toLowerCase());
    if(nb){nb.click();return true}
    return false;
  }

  function routeNetwork(key){
    if(key==='btc') return clickPaymentRoute('Bitcoin');
    if(key==='eth') return clickPaymentRoute('Ethereum');
    if(key==='usdt') return clickPaymentRoute('Tether');
    if(key==='ltc') return clickPaymentRoute('LTC');
    return false;
  }

  function networkBox(allowed){
    const wrap=document.createElement('div');wrap.className='nxt-wallet-network';
    wrap.innerHTML='<div class="nxt-wallet-network-title">Choose what you are sending</div><div class="nxt-wallet-network-grid"></div>';
    const g=wrap.querySelector('.nxt-wallet-network-grid');
    const defs=[['BTC','btc'],['ETH','eth'],['LTC','ltc'],['USDT','usdt']];
    defs.filter(([,k])=>allowed.includes(k)).forEach(([label,key])=>{
      const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{if(!routeNetwork(key)) toast('Choose this coin from the payment list above.');};g.appendChild(b);
    });
    return wrap;
  }

  function walletChoice(initial,name,sub,tag,allowed){
    const holder=document.createElement('div');
    const b=document.createElement('button');b.type='button';b.className='nxt-wallet-choice';
    b.innerHTML=`<span class="nxt-wallet-choice-logo">${initial}</span><span class="nxt-wallet-choice-text"><strong>${name}</strong><small>${sub}</small></span><span class="nxt-wallet-choice-tag">${tag}</span>`;
    const nets=networkBox(allowed);b.onclick=()=>nets.classList.toggle('show');holder.append(b,nets);return holder;
  }

  function enhanceChooser(){
    const shell=document.querySelector('.nxt-method-shell');
    if(!shell || shell.dataset.moreWallets==='1') return;
    const panels=[...shell.querySelectorAll('.nxt-panel')];
    const other=panels.find(p=>(p.textContent||'').includes('Other Payment Options'));
    if(!other) return;
    shell.dataset.moreWallets='1';

    const existing=[...other.querySelectorAll('.nxt-other-row')].find(r=>(r.textContent||'').includes('Pay with Crypto Wallet'));
    if(existing){
      const next=existing.nextElementSibling;
      existing.style.display='none';
      if(next && next.classList.contains('nxt-network-box')) next.style.display='none';
    }

    const row=document.createElement('button');row.type='button';row.className='nxt-more-wallets-row';
    row.innerHTML='<span class="nxt-more-wallets-icon">▣</span><span class="nxt-more-wallets-copy"><strong>More Crypto Wallets</strong><small>Trust Wallet, Exodus, MetaMask & TronLink</small></span><span class="nxt-more-wallets-arrow">›</span>';
    const picker=document.createElement('div');picker.className='nxt-wallet-picker';
    picker.innerHTML='<div class="nxt-wallet-picker-note"><b>Already own crypto?</b> Pick your wallet, choose the coin you want to send, and we will create the exact payment amount and address.</div>';
    picker.appendChild(walletChoice('T','Trust Wallet','Multi-chain wallet for BTC, ETH, LTC and USDT','Popular',['btc','eth','ltc','usdt']));
    picker.appendChild(walletChoice('E','Exodus','Easy multi-chain wallet for desktop and mobile','Beginner friendly',['btc','eth','ltc','usdt']));
    picker.appendChild(walletChoice('M','MetaMask','Best fit for Ethereum payments','ETH',['eth']));
    picker.appendChild(walletChoice('TR','TronLink','Best fit for USDT on the TRON / TRC20 network','USDT TRC20',['usdt']));
    row.onclick=()=>picker.classList.toggle('show');

    const cancel=other.nextElementSibling;
    other.append(row,picker);
  }

  function paymentDetails(modal){
    const text=modal.textContent||'';
    const m=text.match(/([0-9]+(?:\.[0-9]+)?)\s+(BTC|LTC|ETH|USDTTRC20|USDT)/i);
    const copyBtn=modal.querySelector('#copyCryptoAddress');
    const address=copyBtn?.previousElementSibling?.textContent?.trim()||'';
    if(!m||!address)return null;
    return {amount:m[1],currency:m[2].toLowerCase(),address,copyBtn};
  }

  function walletPayButton(initial,name,sub,url,details){
    const b=document.createElement('button');b.type='button';b.className='nxt-wallet-pay-btn';
    b.innerHTML=`<span class="nxt-wallet-choice-logo">${initial}</span><span><strong>${name}</strong><small>${sub}</small></span>`;
    b.onclick=async()=>{
      await copyText(details.address);
      toast('Payment address copied. Opening '+name+'…');
      window.open(url,'_blank','noopener,noreferrer');
    };
    return b;
  }

  function enhancePayment(modal){
    if(modal.dataset.moreWalletPayment==='1') return;
    const d=paymentDetails(modal);if(!d)return;
    modal.dataset.moreWalletPayment='1';
    const anchor=modal.querySelector('.nxt-payment-layout') || d.copyBtn;
    if(!anchor)return;

    const panel=document.createElement('div');panel.className='nxt-wallet-pay-panel';
    panel.innerHTML='<div class="nxt-wallet-pay-title">Use a wallet you already have</div><div class="nxt-wallet-pay-sub">Tap a wallet below. We copy the payment address first so you can paste it immediately in the wallet.</div>';
    const grid=document.createElement('div');grid.className='nxt-wallet-pay-grid';

    grid.appendChild(walletPayButton('T','Trust Wallet','Address copied automatically',OFFICIAL.trust,d));
    grid.appendChild(walletPayButton('E','Exodus','Address copied automatically',OFFICIAL.exodus,d));
    if(d.currency==='eth') grid.appendChild(walletPayButton('M','MetaMask','Ethereum payment',OFFICIAL.metamask,d));
    if(d.currency.includes('usdt')) grid.appendChild(walletPayButton('TR','TronLink','USDT TRC20 payment',OFFICIAL.tronlink,d));

    panel.appendChild(grid);
    const safety=document.createElement('div');safety.className='nxt-wallet-safety';safety.textContent='For your security, this checkout will never ask for your wallet recovery phrase or private key. Confirm the network and exact amount before sending.';panel.appendChild(safety);
    if(anchor.classList && anchor.classList.contains('nxt-payment-layout')) anchor.appendChild(panel); else anchor.insertAdjacentElement('afterend',panel);
  }

  function scan(){
    enhanceChooser();
    document.querySelectorAll('body > div').forEach(el=>{
      const t=el.textContent||'';
      if(t.includes('Complete Your Payment')) enhancePayment(el);
    });
  }
  const obs=new MutationObserver(scan);obs.observe(document.body,{childList:true,subtree:true});scan();
})();
