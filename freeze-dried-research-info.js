(() => {
  const style = document.createElement('style');
  style.textContent = `
    .nxt-research-card{margin:12px 0 16px;padding:12px 13px;border:1px solid rgba(139,92,246,.18);border-radius:12px;background:linear-gradient(180deg,rgba(124,58,237,.055),rgba(255,255,255,.015))}
    .nxt-research-kicker{font:800 9px/1 'Space Grotesk',Inter,sans-serif;letter-spacing:1.3px;text-transform:uppercase;color:#a78bfa;margin-bottom:7px}
    .nxt-research-summary{font:500 12px/1.45 Inter,sans-serif;color:#c7c3d1;margin:0}
    .nxt-research-focus{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
    .nxt-research-focus span{padding:5px 7px;border-radius:999px;border:1px solid rgba(167,139,250,.18);background:rgba(124,58,237,.06);color:#d8d1e8;font:700 8px/1 Inter,sans-serif;text-transform:uppercase;letter-spacing:.5px}
    .nxt-modal-research{margin-bottom:22px;padding:18px;border:1px solid rgba(139,92,246,.20);border-radius:14px;background:linear-gradient(180deg,rgba(124,58,237,.06),rgba(255,255,255,.015))}
    .nxt-modal-research h3{margin:0 0 8px;color:#c4b5fd;font:800 15px/1.1 'Space Grotesk',Inter,sans-serif}
    .nxt-modal-research p{margin:0 0 12px;color:#bcb7c8;font-size:13px;line-height:1.6}
    .nxt-modal-research ul{margin:0;padding-left:18px;color:#e4e0ea}
    .nxt-modal-research li{margin:7px 0;line-height:1.45;font-size:13px}
    .nxt-evidence-note{margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);color:#8f899d;font-size:11px;line-height:1.5}
  `;
  document.head.appendChild(style);

  function getProducts(){
    try { if (typeof compounds !== 'undefined' && Array.isArray(compounds)) return compounds; } catch (_) {}
    return Array.isArray(window.compounds) ? window.compounds : [];
  }
  function cleanName(name){ return String(name||'').replace(/\s*[—-]\s*/g,' — ').trim(); }
  function esc(value){ return String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function productByName(name){
    const target=cleanName(name).toLowerCase();
    return getProducts().find(p=>cleanName(p.name).toLowerCase()===target)||null;
  }
  function researchSummary(p){
    const tags=(p.tags||[]).slice(0,4);
    if(!tags.length) return 'Research interest centers on the compound’s reported biological pathways and laboratory characterization.';
    return `Current research interest centers on ${tags.map(t=>String(t).toLowerCase()).join(', ')} and related biological pathways.`;
  }
  function researchBullets(p){
    const raw=(p.benefits||[]).slice(0,6);
    return raw.map(item=>{
      let text=String(item||'').trim().replace(/[.]+$/,'');
      if(!text) return '';
      text=text.charAt(0).toLowerCase()+text.slice(1);
      return `Investigated in relation to ${text}.`;
    }).filter(Boolean);
  }
  function cardMarkup(p){
    const tags=(p.tags||[]).slice(0,4);
    return `<div class="nxt-research-card">
      <div class="nxt-research-kicker">Research Focus</div>
      <p class="nxt-research-summary">${esc(researchSummary(p))}</p>
      ${tags.length?`<div class="nxt-research-focus">${tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:''}
    </div>`;
  }
  function modalMarkup(p){
    const bullets=researchBullets(p);
    return `<div class="nxt-modal-research">
      <h3>Research Highlights</h3>
      <p>${esc(researchSummary(p))} The points below summarize areas described in the product's existing research profile and are presented as research context rather than guaranteed human outcomes.</p>
      ${bullets.length?`<ul>${bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}
      <div class="nxt-evidence-note">Evidence strength varies by compound and may include preclinical, mechanistic, observational, or limited clinical research. These summaries are not medical claims or treatment recommendations.</div>
    </div>`;
  }
  function enhanceCards(){
    const grid=document.getElementById('compoundGrid');
    if(!grid) return;
    grid.querySelectorAll('.compound-card').forEach(card=>{
      if(card.querySelector('.nxt-research-card')) return;
      const title=card.querySelector('.card-name'); if(!title) return;
      const p=productByName(title.textContent); if(!p||p.category!=='freeze-dried'||p.id==='bac-water-10ml') return;
      const holder=document.createElement('div'); holder.innerHTML=cardMarkup(p);
      const node=holder.firstElementChild;
      const desc=card.querySelector('.card-desc');
      if(desc) desc.insertAdjacentElement('afterend',node); else title.insertAdjacentElement('afterend',node);
    });
  }
  function enhanceModal(){
    const modal=document.querySelector('#modalContent'); if(!modal||modal.querySelector('.nxt-modal-research')) return;
    const title=modal.querySelector('.modal-header h2'); if(!title) return;
    const p=productByName(title.textContent); if(!p||p.category!=='freeze-dried'||p.id==='bac-water-10ml') return;
    const body=modal.querySelector('.modal-body'); if(!body) return;
    const holder=document.createElement('div'); holder.innerHTML=modalMarkup(p);
    body.insertBefore(holder.firstElementChild,body.firstChild);
  }

  let queued=false;
  function run(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false; enhanceCards(); enhanceModal();});
  }

  function start(){
    enhanceCards();
    enhanceModal();
    const grid=document.getElementById('compoundGrid');
    if(grid){
      new MutationObserver(run).observe(grid,{childList:true,subtree:true});
    }
    const modal=document.getElementById('modalContent');
    if(modal){
      new MutationObserver(run).observe(modal,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
