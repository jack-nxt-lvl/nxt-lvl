(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-vial-visual{position:relative;height:154px;margin:4px 0 18px;border:1px solid rgba(255,255,255,.07);border-radius:16px;overflow:hidden;background:radial-gradient(circle at 50% 28%,rgba(124,58,237,.18),transparent 50%),linear-gradient(180deg,#15151e,#0b0b11);display:flex;align-items:center;justify-content:center}
    .nxt-vial-visual::after{content:'';position:absolute;left:24%;right:24%;bottom:10px;height:12px;border-radius:50%;background:rgba(0,0,0,.5);filter:blur(7px)}
    .nxt-vial{position:relative;border:1px solid rgba(255,255,255,.34);box-shadow:0 16px 34px rgba(0,0,0,.48),inset 0 0 18px rgba(255,255,255,.05);z-index:2;overflow:visible;background:linear-gradient(90deg,rgba(255,255,255,.07),rgba(255,255,255,.30) 28%,rgba(255,255,255,.08) 70%,rgba(255,255,255,.02))}
    .nxt-vial.vial-3ml{width:64px;height:94px;border-radius:9px 9px 16px 16px}
    .nxt-vial.vial-10ml{width:78px;height:108px;border-radius:10px 10px 18px 18px}
    .nxt-vial-cap{position:absolute;left:8px;right:8px;top:-15px;height:22px;border-radius:6px 6px 4px 4px;background:linear-gradient(180deg,#a1a2af,#4a4b56);border:1px solid rgba(255,255,255,.24);box-shadow:0 3px 7px rgba(0,0,0,.38);z-index:5}
    .nxt-vial-neck{position:absolute;left:13px;right:13px;top:5px;height:13px;border-radius:2px;background:rgba(255,255,255,.14);z-index:2}
    .nxt-vial-fill{position:absolute;left:4px;right:4px;bottom:4px;border-radius:4px 4px 12px 12px;overflow:hidden;z-index:1}
    .nxt-vial-fill.powder{height:22px;background:linear-gradient(180deg,#fff,#eeeeF3 58%,#d5d5de);box-shadow:inset 0 4px 7px rgba(255,255,255,.8),0 -1px 4px rgba(255,255,255,.35)}
    .nxt-vial-fill.powder::before{content:'';position:absolute;left:5px;right:5px;top:-3px;height:7px;border-radius:50%;background:#fbfbfd;box-shadow:0 2px 4px rgba(0,0,0,.12)}
    .nxt-vial-fill.water{height:51px;background:linear-gradient(180deg,rgba(222,244,255,.18),rgba(164,216,246,.30));border-top:1px solid rgba(226,248,255,.78);box-shadow:inset 8px 0 10px rgba(255,255,255,.09)}
    .nxt-vial-fill.oil{height:58px;background:linear-gradient(180deg,rgba(255,225,157,.34),rgba(205,161,76,.56));border-top:1px solid rgba(255,235,184,.75);box-shadow:inset 8px 0 10px rgba(255,255,255,.09)}
    .nxt-vial-fill.oil.tren{background:linear-gradient(180deg,rgba(255,216,70,.60),rgba(197,133,12,.82));border-top-color:rgba(255,237,127,.96);box-shadow:inset 9px 0 11px rgba(255,255,255,.10),0 0 14px rgba(225,163,27,.15)}
    .nxt-vial-label{position:absolute;left:5px;right:5px;top:27px;min-height:48px;padding:5px 3px;border-radius:5px;background:linear-gradient(135deg,rgba(250,250,253,.98),rgba(219,219,229,.98));color:#15151c;text-align:center;display:flex;flex-direction:column;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.22);z-index:4}
    .vial-10ml .nxt-vial-label{top:30px;min-height:52px}
    .nxt-vial-brand{font:800 6.5px/1.05 'Space Grotesk',Inter,sans-serif;letter-spacing:.65px;color:#6d28d9;text-transform:uppercase;margin-bottom:3px}
    .nxt-vial-name{font:800 7.5px/1.08 Inter,sans-serif;text-transform:uppercase;word-break:break-word}
    .nxt-vial-amount{font:700 6.5px/1.1 Inter,sans-serif;color:#555568;margin-top:3px}
    .nxt-vial-ruo{font:700 4.8px/1 Inter,sans-serif;letter-spacing:.4px;color:#7a7a89;margin-top:4px;text-transform:uppercase}
    .nxt-vial-glow{position:absolute;width:130px;height:130px;border-radius:50%;background:rgba(124,58,237,.15);filter:blur(30px)}
    .nxt-vial-caption{position:absolute;right:12px;bottom:10px;font:700 8px/1 Inter,sans-serif;letter-spacing:.9px;color:#858599;text-transform:uppercase;z-index:2}
    .nxt-modal-vial{height:218px;margin:0 0 26px}.nxt-modal-vial .nxt-vial{transform:scale(1.48)}
    @media(max-width:768px){.nxt-vial-visual{height:138px}.nxt-modal-vial{height:184px}}
  `;
  document.head.appendChild(style);

  function getProducts(){
    try { if (typeof compounds !== 'undefined' && Array.isArray(compounds)) return compounds; } catch (_) {}
    return Array.isArray(window.compounds) ? window.compounds : [];
  }
  function cleanName(name){ return String(name||'').replace(/\s*[—-]\s*/g,' — ').trim(); }
  function amountFromProduct(p){
    if(!p) return '';
    if(p.id==='bac-water-10ml') return '10 mL';
    if(p.category==='injectables') return '10 mL Vial';
    const amount = String(p.amount || '').split(' per ')[0].trim();
    if(amount) return amount;
    const m = String(p.name || '').match(/(?:—|-)\s*([^—-]+)$/);
    return m ? m[1].trim() : '';
  }
  function shortLabel(name){ return cleanName(name).replace(/\s*—\s*/,'\n'); }
  function visualType(p){
    if(!p) return null;
    if(p.id==='bac-water-10ml' || /bacteriostatic\s+water/i.test(p.name||'')) return {size:'vial-10ml',fill:'water',caption:'10 mL Clear Water Vial'};
    if(p.category==='injectables') {
      const tren = /\btren/i.test(p.name||'') || /trenbolone/i.test(p.aka||'');
      return {size:'vial-10ml',fill:tren?'oil tren':'oil',caption:tren?'10 mL Yellow Oil Vial':'10 mL Oil Vial'};
    }
    if(p.category==='freeze-dried') return {size:'vial-3ml',fill:'powder',caption:'3 mL Lyophilized Vial'};
    return null;
  }
  function visualMarkup(p, modal=false){
    const type=visualType(p); if(!type) return '';
    const name = shortLabel(p.name).replace(/\n/g,'<br>');
    const amount = amountFromProduct(p);
    const aria = String(p.name||'').replace(/"/g,'&quot;');
    return `<div class="nxt-vial-visual${modal?' nxt-modal-vial':''}" aria-label="${aria} product vial visual">
      <div class="nxt-vial-glow"></div>
      <div class="nxt-vial ${type.size}">
        <div class="nxt-vial-cap"></div><div class="nxt-vial-neck"></div><div class="nxt-vial-fill ${type.fill}"></div>
        <div class="nxt-vial-label"><div class="nxt-vial-brand">NXT LVL Research</div><div class="nxt-vial-name">${name}</div><div class="nxt-vial-amount">${amount}</div><div class="nxt-vial-ruo">Research Use Only</div></div>
      </div>
      <div class="nxt-vial-caption">${type.caption}</div>
    </div>`;
  }
  function productByName(name){
    const list=getProducts();
    const target = cleanName(name).toLowerCase();
    return list.find(p => cleanName(p.name).toLowerCase()===target) || null;
  }
  function enhanceCards(){
    const list=getProducts(); if(!list.length) return;
    document.querySelectorAll('.compound-card').forEach(card=>{
      const title=card.querySelector('.card-name'); if(!title) return;
      const p=productByName(title.textContent); const type=visualType(p); if(!p||!type) return;
      const existing=card.querySelector('.nxt-vial-visual'); if(existing) return;
      const holder=document.createElement('div'); holder.innerHTML=visualMarkup(p,false);
      const visual=holder.firstElementChild;
      const cardTop=card.querySelector('.card-top');
      if(cardTop) cardTop.insertAdjacentElement('afterend',visual); else card.insertBefore(visual,title);
    });
  }
  function enhanceModal(){
    const modal=document.querySelector('#modalContent'); if(!modal) return;
    const title=modal.querySelector('.modal-header h2'); if(!title) return;
    const p=productByName(title.textContent); const type=visualType(p); if(!p||!type) return;
    const body=modal.querySelector('.modal-body'); if(!body || modal.querySelector('.nxt-modal-vial')) return;
    const holder=document.createElement('div'); holder.innerHTML=visualMarkup(p,true);
    body.insertBefore(holder.firstElementChild,body.firstChild);
  }
  let scheduled=false;
  function run(){ if(scheduled) return; scheduled=true; requestAnimationFrame(()=>{scheduled=false; enhanceCards(); enhanceModal();}); }
  const observer=new MutationObserver(run);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true}); else setTimeout(run,0);
})();
