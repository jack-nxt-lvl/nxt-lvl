(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-vial-visual{position:relative;height:132px;margin:10px 0 18px;border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden;background:radial-gradient(circle at 50% 30%,rgba(124,58,237,.18),transparent 48%),linear-gradient(180deg,#12121a,#0b0b11);display:flex;align-items:center;justify-content:center}
    .nxt-vial-visual::after{content:'';position:absolute;inset:auto 20% 9px;height:12px;border-radius:50%;background:rgba(0,0,0,.45);filter:blur(6px)}
    .nxt-vial{position:relative;width:70px;height:98px;border-radius:10px 10px 16px 16px;background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.3) 28%,rgba(255,255,255,.08) 70%,rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.28);box-shadow:0 14px 34px rgba(0,0,0,.42),inset 0 0 18px rgba(255,255,255,.04);z-index:2}
    .nxt-vial-cap{position:absolute;left:9px;right:9px;top:-15px;height:22px;border-radius:6px 6px 4px 4px;background:linear-gradient(180deg,#8f90a1,#4b4c58);border:1px solid rgba(255,255,255,.22);box-shadow:0 3px 7px rgba(0,0,0,.35)}
    .nxt-vial-neck{position:absolute;left:14px;right:14px;top:5px;height:13px;border-radius:2px;background:rgba(255,255,255,.14)}
    .nxt-vial-label{position:absolute;left:6px;right:6px;top:28px;min-height:50px;padding:6px 4px;border-radius:5px;background:linear-gradient(135deg,#f7f7fb,#d9d9e4);color:#15151c;text-align:center;display:flex;flex-direction:column;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2)}
    .nxt-vial-brand{font:800 7px/1.05 'Space Grotesk',Inter,sans-serif;letter-spacing:.7px;color:#6d28d9;text-transform:uppercase;margin-bottom:3px}
    .nxt-vial-name{font:800 8px/1.08 Inter,sans-serif;text-transform:uppercase;word-break:break-word}
    .nxt-vial-amount{font:700 7px/1.1 Inter,sans-serif;color:#555568;margin-top:3px}
    .nxt-vial-ruo{font:700 5px/1 Inter,sans-serif;letter-spacing:.45px;color:#7a7a89;margin-top:4px;text-transform:uppercase}
    .nxt-vial-glow{position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(124,58,237,.16);filter:blur(28px)}
    .nxt-vial-caption{position:absolute;right:12px;bottom:10px;font:700 8px/1 Inter,sans-serif;letter-spacing:1px;color:#77778b;text-transform:uppercase;z-index:2}
    .nxt-modal-vial{height:190px;margin:0 0 24px}.nxt-modal-vial .nxt-vial{transform:scale(1.35)}
    @media(max-width:768px){.nxt-vial-visual{height:118px}.nxt-modal-vial{height:160px}}
  `;
  document.head.appendChild(style);

  function cleanName(name){ return String(name||'').replace(/\s*[—-]\s*/g,' — ').trim(); }
  function amountFromProduct(p){
    if(!p) return '';
    const amount = String(p.amount || '').split(' per ')[0].trim();
    if(amount) return amount;
    const m = String(p.name || '').match(/(?:—|-)\s*([^—-]+)$/);
    return m ? m[1].trim() : '';
  }
  function shortLabel(name){
    return cleanName(name).replace(/\s*—\s*/,'\n');
  }
  function visualMarkup(p, modal=false){
    const name = shortLabel(p.name).replace(/\n/g,'<br>');
    const amount = amountFromProduct(p);
    return `<div class="nxt-vial-visual${modal?' nxt-modal-vial':''}" aria-label="${String(p.name).replace(/"/g,'&quot;')} product label visual">
      <div class="nxt-vial-glow"></div>
      <div class="nxt-vial">
        <div class="nxt-vial-cap"></div><div class="nxt-vial-neck"></div>
        <div class="nxt-vial-label"><div class="nxt-vial-brand">NXT LVL Research</div><div class="nxt-vial-name">${name}</div><div class="nxt-vial-amount">${amount}</div><div class="nxt-vial-ruo">Research Use Only</div></div>
      </div>
      <div class="nxt-vial-caption">Label Preview</div>
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
      if(card.querySelector('.nxt-vial-visual')) return;
      const title=card.querySelector('.card-name');
      if(!title) return;
      const p=productByName(title.textContent);
      if(!p || p.category!=='freeze-dried') return;
      const holder=document.createElement('div'); holder.innerHTML=visualMarkup(p,false);
      const visual=holder.firstElementChild;
      const cardTop=card.querySelector('.card-top');
      if(cardTop && cardTop.nextSibling) card.insertBefore(visual,cardTop.nextSibling); else card.insertBefore(visual,title);
    });
  }
  function enhanceModal(){
    const modal=document.querySelector('#modalContent');
    if(!modal || modal.querySelector('.nxt-modal-vial')) return;
    const title=modal.querySelector('.modal-header h2');
    if(!title) return;
    const p=productByName(title.textContent);
    if(!p || p.category!=='freeze-dried') return;
    const body=modal.querySelector('.modal-body'); if(!body) return;
    const holder=document.createElement('div'); holder.innerHTML=visualMarkup(p,true);
    body.insertBefore(holder.firstElementChild,body.firstChild);
  }
  function run(){ enhanceCards(); enhanceModal(); }
  const observer=new MutationObserver(run);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();
