(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-vial-visual{position:relative;height:144px;margin:10px 0 18px;border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden;background:radial-gradient(circle at 50% 30%,rgba(124,58,237,.15),transparent 48%),linear-gradient(180deg,#12121a,#0b0b11);display:flex;align-items:center;justify-content:center}
    .nxt-vial-visual::after{content:'';position:absolute;inset:auto 19% 9px;height:12px;border-radius:50%;background:rgba(0,0,0,.46);filter:blur(6px)}
    .nxt-vial{position:relative;border:1px solid rgba(255,255,255,.30);box-shadow:0 14px 34px rgba(0,0,0,.42),inset 0 0 18px rgba(255,255,255,.04);z-index:2;overflow:visible;background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.28) 28%,rgba(255,255,255,.07) 70%,rgba(255,255,255,.02))}
    .nxt-vial.vial-3ml{width:62px;height:92px;border-radius:9px 9px 15px 15px}
    .nxt-vial.vial-10ml{width:74px;height:104px;border-radius:10px 10px 17px 17px}
    .nxt-vial-cap{position:absolute;left:8px;right:8px;top:-15px;height:22px;border-radius:6px 6px 4px 4px;background:linear-gradient(180deg,#90919f,#4a4b56);border:1px solid rgba(255,255,255,.22);box-shadow:0 3px 7px rgba(0,0,0,.35);z-index:5}
    .nxt-vial-neck{position:absolute;left:13px;right:13px;top:5px;height:13px;border-radius:2px;background:rgba(255,255,255,.13);z-index:2}
    .nxt-vial-fill{position:absolute;left:4px;right:4px;bottom:4px;border-radius:4px 4px 12px 12px;overflow:hidden;z-index:1}
    .nxt-vial-fill.powder{height:21px;background:linear-gradient(180deg,#fff,#ececf1 58%,#d7d7df);box-shadow:inset 0 4px 7px rgba(255,255,255,.8),0 -1px 4px rgba(255,255,255,.35)}
    .nxt-vial-fill.powder::before{content:'';position:absolute;left:5px;right:5px;top:-3px;height:7px;border-radius:50%;background:#fafafd;box-shadow:0 2px 4px rgba(0,0,0,.12)}
    .nxt-vial-fill.water{height:48px;background:linear-gradient(180deg,rgba(218,241,255,.18),rgba(164,216,246,.30));border-top:1px solid rgba(220,245,255,.72);box-shadow:inset 8px 0 10px rgba(255,255,255,.08)}
    .nxt-vial-fill.oil{height:55px;background:linear-gradient(180deg,rgba(255,224,147,.38),rgba(214,165,67,.55));border-top:1px solid rgba(255,233,172,.75);box-shadow:inset 8px 0 10px rgba(255,255,255,.08)}
    .nxt-vial-fill.oil.tren{background:linear-gradient(180deg,rgba(255,215,74,.58),rgba(201,139,18,.78));border-top-color:rgba(255,233,124,.95);box-shadow:inset 9px 0 11px rgba(255,255,255,.10),0 0 12px rgba(225,163,27,.12)}
    .nxt-vial-label{position:absolute;left:5px;right:5px;top:27px;min-height:47px;padding:5px 3px;border-radius:5px;background:linear-gradient(135deg,rgba(248,248,252,.97),rgba(218,218,228,.97));color:#15151c;text-align:center;display:flex;flex-direction:column;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2);z-index:4}
    .vial-10ml .nxt-vial-label{top:30px;min-height:51px}
    .nxt-vial-brand{font:800 6.5px/1.05 'Space Grotesk',Inter,sans-serif;letter-spacing:.65px;color:#6d28d9;text-transform:uppercase;margin-bottom:3px}
    .nxt-vial-name{font:800 7.5px/1.08 Inter,sans-serif;text-transform:uppercase;word-break:break-word}
    .nxt-vial-amount{font:700 6.5px/1.1 Inter,sans-serif;color:#555568;margin-top:3px}
    .nxt-vial-ruo{font:700 4.8px/1 Inter,sans-serif;letter-spacing:.4px;color:#7a7a89;margin-top:4px;text-transform:uppercase}
    .nxt-vial-glow{position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(124,58,237,.14);filter:blur(28px)}
    .nxt-vial-caption{position:absolute;right:12px;bottom:10px;font:700 8px/1 Inter,sans-serif;letter-spacing:1px;color:#77778b;text-transform:uppercase;z-index:2}
    .nxt-modal-vial{height:206px;margin:0 0 24px}.nxt-modal-vial .nxt-vial{transform:scale(1.42)}
    @media(max-width:768px){.nxt-vial-visual{height:128px}.nxt-modal-vial{height:174px}}
  `;
  document.head.appendChild(style);

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
    if(!Array.isArray(window.compounds)) return null;
    const target = cleanName(name).toLowerCase();
    return window.compounds.find(p => cleanName(p.name).toLowerCase()===target) || null;
  }
  function enhanceCards(){
    if(!Array.isArray(window.compounds)) return;
    document.querySelectorAll('.compound-card').forEach(card=>{
      const title=card.querySelector('.card-name'); if(!title) return;
      const p=productByName(title.textContent); const type=visualType(p); if(!p||!type) return;
      const existing=card.querySelector('.nxt-vial-visual');
      if(existing) existing.remove();
      const holder=document.createElement('div'); holder.innerHTML=visualMarkup(p,false);
      const visual=holder.firstElementChild;
      const cardTop=card.querySelector('.card-top');
      if(cardTop && cardTop.nextSibling) card.insertBefore(visual,cardTop.nextSibling); else card.insertBefore(visual,title);
    });
  }
  function enhanceModal(){
    const modal=document.querySelector('#modalContent'); if(!modal) return;
    const title=modal.querySelector('.modal-header h2'); if(!title) return;
    const p=productByName(title.textContent); const type=visualType(p); if(!p||!type) return;
    const body=modal.querySelector('.modal-body'); if(!body) return;
    const old=modal.querySelector('.nxt-modal-vial'); if(old) old.remove();
    const holder=document.createElement('div'); holder.innerHTML=visualMarkup(p,true);
    body.insertBefore(holder.firstElementChild,body.firstChild);
  }
  let scheduled=false;
  function run(){ if(scheduled) return; scheduled=true; requestAnimationFrame(()=>{scheduled=false; enhanceCards(); enhanceModal();}); }
  const observer=new MutationObserver(run);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();
