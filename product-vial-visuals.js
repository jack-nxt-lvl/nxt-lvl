(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-vial-visual{position:relative;margin:6px 0 20px;padding:14px;border:1px solid rgba(139,92,246,.24);border-radius:18px;overflow:hidden;background:radial-gradient(circle at 18% 0%,rgba(124,58,237,.16),transparent 36%),linear-gradient(180deg,#12121a,#09090f);box-shadow:inset 0 1px 0 rgba(255,255,255,.035)}
    .nxt-label-art{position:relative;min-height:142px;border:1px solid rgba(167,139,250,.42);border-radius:15px;overflow:hidden;background:linear-gradient(112deg,#080b12 0%,#10121c 52%,#080a11 100%);box-shadow:0 18px 42px rgba(0,0,0,.38),inset 0 0 0 1px rgba(255,255,255,.025);display:grid;grid-template-columns:1.08fr 1fr .58fr;isolation:isolate}
    .nxt-label-art::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 12% 36%,rgba(124,58,237,.16),transparent 22%),linear-gradient(90deg,transparent 0 48%,rgba(124,58,237,.04) 49% 50%,transparent 51%);pointer-events:none;z-index:-1}
    .nxt-label-art::after{content:'';position:absolute;left:0;right:0;bottom:0;height:15px;background:linear-gradient(90deg,#43208d,#6d28d9 48%,#7c3aed 72%,#3d1b7c);box-shadow:0 -1px 0 rgba(167,139,250,.28)}
    .nxt-label-left,.nxt-label-middle,.nxt-label-right{position:relative;padding:15px 16px 25px;min-width:0}
    .nxt-label-middle,.nxt-label-right{border-left:1px solid rgba(139,92,246,.36)}
    .nxt-label-brand{display:flex;align-items:center;gap:9px;margin-bottom:13px}
    .nxt-label-logo{width:31px;height:31px;border-radius:8px;background:linear-gradient(145deg,#8b5cf6,#4c1d95);display:grid;place-items:center;color:#fff;font:900 18px/1 'Space Grotesk',Inter,sans-serif;box-shadow:0 7px 18px rgba(124,58,237,.30)}
    .nxt-label-wordmark{font:800 13px/.95 'Space Grotesk',Inter,sans-serif;letter-spacing:1.1px;text-transform:uppercase;color:#f6f4ff}
    .nxt-label-wordmark span{color:#8b5cf6}
    .nxt-label-name{font:900 clamp(20px,2.2vw,31px)/.94 'Space Grotesk',Inter,sans-serif;letter-spacing:-.7px;color:#fff;text-transform:uppercase;word-break:break-word;text-shadow:0 2px 18px rgba(255,255,255,.035)}
    .nxt-label-strength{font:900 18px/1 'Space Grotesk',Inter,sans-serif;color:#8b5cf6;margin-top:8px;text-transform:uppercase;letter-spacing:.5px}
    .nxt-label-category{display:inline-block;max-width:100%;padding:6px 9px;border-radius:5px;background:linear-gradient(90deg,#412080,#5730aa);color:#eee9ff;font:800 8.5px/1 'Space Grotesk',Inter,sans-serif;letter-spacing:1.2px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:10px}
    .nxt-label-aka{font:700 10.5px/1.2 Inter,sans-serif;color:#dad6e6;font-style:italic;min-height:25px;margin-bottom:7px;overflow:hidden}
    .nxt-label-form{font:800 9.5px/1.1 'Space Grotesk',Inter,sans-serif;color:#8b5cf6;letter-spacing:1.35px;text-transform:uppercase;padding:7px 0;border-top:1px solid rgba(124,58,237,.35);border-bottom:1px solid rgba(124,58,237,.35);margin-bottom:8px}
    .nxt-label-meta{display:grid;gap:6px;color:#f2f0f7;font:700 9px/1.15 Inter,sans-serif}
    .nxt-label-meta div{display:flex;align-items:center;gap:7px}
    .nxt-label-icon{width:19px;height:19px;border-radius:50%;border:1px solid rgba(139,92,246,.5);display:grid;place-items:center;color:#a78bfa;font-size:10px;flex:0 0 auto}
    .nxt-label-batch{font:700 8px/1.2 'Space Grotesk',Inter,sans-serif;letter-spacing:.7px;text-transform:uppercase;color:#8e89a0;margin-bottom:4px}
    .nxt-label-batch-value{min-height:27px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.018);padding:6px 7px;margin-bottom:7px;color:#f3f1f8;font:800 11px/1.1 'Space Grotesk',Inter,sans-serif}
    .nxt-label-sku{margin-top:9px;padding-top:8px;border-top:1px solid rgba(255,255,255,.07);font:700 6.8px/1.2 monospace;color:#8d8998;word-break:break-all;text-transform:uppercase}
    .nxt-label-footer{position:absolute;left:0;right:0;bottom:2px;text-align:center;z-index:3;color:#e9e5f5;font:900 7.5px/1 'Space Grotesk',Inter,sans-serif;letter-spacing:2.2px;text-transform:uppercase}
    .nxt-label-caption{margin-top:8px;text-align:right;color:#747083;font:700 7px/1 Inter,sans-serif;letter-spacing:1.1px;text-transform:uppercase}
    .nxt-modal-vial{padding:18px;margin:0 0 26px}.nxt-modal-vial .nxt-label-art{min-height:190px}.nxt-modal-vial .nxt-label-name{font-size:35px}.nxt-modal-vial .nxt-label-strength{font-size:22px}
    @media(max-width:900px){.nxt-label-art{grid-template-columns:1.05fr .95fr}.nxt-label-right{grid-column:1/-1;border-left:0;border-top:1px solid rgba(139,92,246,.36);display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding-top:10px}.nxt-label-right .nxt-label-sku{grid-column:1/-1;margin-top:0}.nxt-label-art::after{height:14px}}
    @media(max-width:620px){.nxt-vial-visual{padding:10px}.nxt-label-art{grid-template-columns:1fr;min-height:0}.nxt-label-middle,.nxt-label-right{border-left:0;border-top:1px solid rgba(139,92,246,.34)}.nxt-label-right{grid-column:auto;grid-template-columns:1fr 1fr}.nxt-label-left,.nxt-label-middle,.nxt-label-right{padding:13px 13px 23px}.nxt-label-name{font-size:25px}.nxt-modal-vial .nxt-label-name{font-size:28px}.nxt-label-footer{font-size:6.5px;letter-spacing:1.5px}}
  `;
  document.head.appendChild(style);

  function getProducts(){
    try { if (typeof compounds !== 'undefined' && Array.isArray(compounds)) return compounds; } catch (_) {}
    return Array.isArray(window.compounds) ? window.compounds : [];
  }
  function esc(value){ return String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function cleanName(name){ return String(name||'').replace(/\s*[—-]\s*/g,' — ').trim(); }
  function splitProductName(p){
    const raw=cleanName(p && p.name);
    const parts=raw.split(/\s+—\s+/);
    return {name:(parts[0]||raw).trim(),strength:(parts.slice(1).join(' — ')||amountFromProduct(p)).trim()};
  }
  function amountFromProduct(p){
    if(!p) return '';
    if(p.id==='bac-water-10ml') return '10 mL';
    if(p.category==='injectables') return '10 mL';
    const amount=String(p.amount||'').split(' per ')[0].trim();
    if(amount) return amount;
    const m=String(p.name||'').match(/(?:—|-)\s*([^—-]+)$/);
    return m?m[1].trim():'';
  }
  function labelProfile(p){
    if(!p) return null;
    if(p.id==='bac-water-10ml'||/bacteriostatic\s+water/i.test(p.name||'')) return {category:'Laboratory Supply',form:'Bacteriostatic Water',vial:'10 mL Vial',detail:'0.9% Benzyl Alcohol',caption:'10 mL Clear Water Vial'};
    if(p.category==='injectables'){
      const tren=/\btren/i.test(p.name||'')||/trenbolone/i.test(p.aka||'');
      return {category:'Injectable',form:tren?'Yellow Oil Injectable':'Oil-Based Injectable',vial:'10 mL Vial',detail:tren?'Yellow / Golden Oil':'Oil Solution',caption:tren?'10 mL Yellow Oil Vial':'10 mL Oil Vial'};
    }
    if(p.category==='freeze-dried') return {category:'Peptide (Freeze-Dried)',form:'Lyophilized Peptide',vial:'3 mL Vial',detail:'White Lyophilized Powder',caption:'3 mL Lyophilized Vial'};
    return null;
  }
  function productByName(name){
    const list=getProducts(),target=cleanName(name).toLowerCase();
    return list.find(p=>cleanName(p.name).toLowerCase()===target)||null;
  }
  function labelMarkup(p,modal=false){
    const profile=labelProfile(p); if(!profile) return '';
    const split=splitProductName(p);
    const sku=String(p.id||'product').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toUpperCase();
    return `<div class="nxt-vial-visual${modal?' nxt-modal-vial':''}" aria-label="${esc(p.name)} professional product label preview">
      <div class="nxt-label-art">
        <section class="nxt-label-left">
          <div class="nxt-label-brand"><div class="nxt-label-logo">N</div><div class="nxt-label-wordmark">NXT <span>LVL</span><br>RESEARCH</div></div>
          <div class="nxt-label-name">${esc(split.name)}</div>
          <div class="nxt-label-strength">${esc(split.strength)}</div>
        </section>
        <section class="nxt-label-middle">
          <div class="nxt-label-category">${esc(profile.category)}</div>
          <div class="nxt-label-aka">${esc(p.aka||'Research Compound')}</div>
          <div class="nxt-label-form">${esc(profile.form)}</div>
          <div class="nxt-label-meta">
            <div><span class="nxt-label-icon">▣</span><span>${esc(profile.vial)}</span></div>
            <div><span class="nxt-label-icon">◆</span><span>${esc(profile.detail)}</span></div>
          </div>
        </section>
        <section class="nxt-label-right">
          <div><div class="nxt-label-batch">Lot</div><div class="nxt-label-batch-value">—</div></div>
          <div><div class="nxt-label-batch">Exp</div><div class="nxt-label-batch-value">—</div></div>
          <div class="nxt-label-sku">SKU ${esc(sku)}</div>
        </section>
        <div class="nxt-label-footer">For Research Use Only</div>
      </div>
      <div class="nxt-label-caption">${esc(profile.caption)} · Label Preview</div>
    </div>`;
  }
  function enhanceCards(){
    const list=getProducts(); if(!list.length) return;
    document.querySelectorAll('.compound-card').forEach(card=>{
      const title=card.querySelector('.card-name'); if(!title) return;
      const p=productByName(title.textContent); if(!p||!labelProfile(p)) return;
      const old=card.querySelector('.nxt-vial-visual'); if(old) old.remove();
      const holder=document.createElement('div'); holder.innerHTML=labelMarkup(p,false);
      const visual=holder.firstElementChild;
      const cardTop=card.querySelector('.card-top');
      if(cardTop) cardTop.insertAdjacentElement('afterend',visual); else card.insertBefore(visual,title);
    });
  }
  function enhanceModal(){
    const modal=document.querySelector('#modalContent'); if(!modal) return;
    const title=modal.querySelector('.modal-header h2'); if(!title) return;
    const p=productByName(title.textContent); if(!p||!labelProfile(p)) return;
    const body=modal.querySelector('.modal-body'); if(!body) return;
    const old=modal.querySelector('.nxt-modal-vial'); if(old) old.remove();
    const holder=document.createElement('div'); holder.innerHTML=labelMarkup(p,true);
    body.insertBefore(holder.firstElementChild,body.firstChild);
  }
  let scheduled=false;
  function run(){ if(scheduled) return; scheduled=true; requestAnimationFrame(()=>{scheduled=false;enhanceCards();enhanceModal();}); }
  const observer=new MutationObserver(run);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true}); else setTimeout(run,0);
})();
