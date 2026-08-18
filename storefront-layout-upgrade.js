(() => {
  const style=document.createElement('style');
  style.textContent=`
    :root{--nxt-card:#0e0e15;--nxt-card-2:#12121b;--nxt-line:rgba(255,255,255,.07);--nxt-soft:rgba(255,255,255,.62)}
    #menu{max-width:1480px!important;padding-left:34px!important;padding-right:34px!important}
    #compoundGrid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:22px!important;align-items:stretch!important}
    .compound-card{position:relative!important;display:flex!important;flex-direction:column!important;min-height:100%!important;padding:18px!important;border-radius:18px!important;background:linear-gradient(180deg,rgba(20,20,29,.96),rgba(10,10,15,.98))!important;border:1px solid rgba(255,255,255,.075)!important;box-shadow:0 12px 32px rgba(0,0,0,.18)!important;overflow:hidden!important;transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease!important}
    .compound-card::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#8b5cf6,#c4b5fd);opacity:.82}
    .compound-card[data-nxt-cat='freeze-dried']::before{background:linear-gradient(90deg,#8b5cf6,#a78bfa)}
    .compound-card[data-nxt-cat='injectables']::before{background:linear-gradient(90deg,#f59e0b,#fbbf24)}
    .compound-card[data-nxt-cat='capsules']::before{background:linear-gradient(90deg,#38bdf8,#60a5fa)}
    .compound-card:hover{transform:translateY(-4px)!important;border-color:rgba(167,139,250,.34)!important;box-shadow:0 20px 44px rgba(0,0,0,.32),0 0 0 1px rgba(124,58,237,.08)!important}
    .card-top{display:flex!important;justify-content:space-between!important;align-items:center!important;gap:10px!important;margin-bottom:10px!important}
    .card-category{font-size:10px!important;letter-spacing:1.25px!important;padding:5px 9px!important;border-radius:999px!important;background:rgba(124,58,237,.09)!important;border:1px solid rgba(167,139,250,.15)!important}
    .compound-card[data-nxt-cat='injectables'] .card-category{background:rgba(245,158,11,.08)!important;border-color:rgba(245,158,11,.18)!important;color:#f8d48a!important}
    .compound-card[data-nxt-cat='capsules'] .card-category{background:rgba(56,189,248,.08)!important;border-color:rgba(56,189,248,.16)!important;color:#9edfff!important}
    .card-name{font-size:1.18rem!important;line-height:1.18!important;margin:1px 0 5px!important;letter-spacing:.15px!important}
    .card-aka{font-size:.76rem!important;min-height:18px!important;color:rgba(255,255,255,.58)!important;margin-bottom:10px!important}
    .card-desc{font-size:.82rem!important;line-height:1.55!important;color:rgba(255,255,255,.74)!important;min-height:58px!important;margin-bottom:12px!important}
    .card-tags{display:flex!important;flex-wrap:wrap!important;gap:6px!important;margin-bottom:15px!important}
    .card-tag{font-size:8.5px!important;letter-spacing:.72px!important;padding:5px 7px!important;border-radius:6px!important;background:rgba(255,255,255,.035)!important;border-color:rgba(255,255,255,.08)!important}
    .card-footer{margin-top:auto!important;padding-top:13px!important;border-top:1px solid rgba(255,255,255,.055)!important;align-items:center!important}
    .card-price{font-size:1.12rem!important}
    .card-arrow{width:30px!important;height:30px!important;border-radius:50%!important;display:grid!important;place-items:center!important;background:rgba(124,58,237,.11)!important;color:#c4b5fd!important}
    .card-atc-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:9px!important;margin-top:11px!important;align-items:stretch!important}
    .card-atc-dropdown,.custom-select-trigger{min-width:0!important}
    .card-atc-row .custom-select-trigger{height:38px!important;border-radius:9px!important;background:#15151e!important;border:1px solid rgba(255,255,255,.08)!important;padding:0 11px!important}
    .card-atc-btn{height:38px!important;min-width:64px!important;padding:0 14px!important;border-radius:9px!important;font-weight:800!important;letter-spacing:.45px!important;background:linear-gradient(135deg,#8b5cf6,#6d28d9)!important;box-shadow:0 8px 20px rgba(109,40,217,.20)!important}
    .nxt-catalog-toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:18px 0 16px;padding:13px 15px;border:1px solid rgba(255,255,255,.065);border-radius:13px;background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.012));color:rgba(255,255,255,.68);font:600 12px/1.4 Inter,sans-serif}
    .nxt-catalog-count{color:#fff;font-weight:800}.nxt-catalog-hint{display:flex;align-items:center;gap:7px}.nxt-catalog-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px rgba(34,197,94,.45)}
    #filterBar{position:sticky!important;top:76px!important;z-index:110!important;padding:9px!important;border:1px solid rgba(255,255,255,.06)!important;border-radius:14px!important;background:rgba(10,10,15,.84)!important;backdrop-filter:blur(16px)!important;box-shadow:0 10px 28px rgba(0,0,0,.22)!important;margin-bottom:12px!important}
    .filter-btn{border-radius:10px!important;padding:11px 16px!important}
    #compoundSearch{border-radius:14px!important;background:rgba(17,17,25,.88)!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important}
    .modal-content{border-radius:20px!important;box-shadow:0 30px 90px rgba(0,0,0,.65)!important}
    .modal-body{padding-top:24px!important}
    @media(max-width:1120px){#compoundGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    @media(max-width:720px){#menu{padding-left:16px!important;padding-right:16px!important}#compoundGrid{grid-template-columns:1fr!important;gap:15px!important}.compound-card{padding:15px!important;border-radius:15px!important}.card-desc{min-height:0!important}.nxt-catalog-toolbar{align-items:flex-start;flex-direction:column}.nxt-catalog-hint{font-size:11px}#filterBar{top:64px!important;display:flex!important;overflow-x:auto!important;white-space:nowrap!important;justify-content:flex-start!important}.filter-btn{flex:0 0 auto!important}.card-atc-btn{min-width:72px!important}}
  `;
  document.head.appendChild(style);

  function getProducts(){
    try { if(typeof compounds!=='undefined' && Array.isArray(compounds)) return compounds; } catch(_) {}
    return Array.isArray(window.compounds)?window.compounds:[];
  }
  function clean(v){return String(v||'').replace(/\s+/g,' ').trim().toLowerCase()}
  function mapCards(){
    const list=getProducts(); if(!list.length) return;
    document.querySelectorAll('.compound-card').forEach(card=>{
      const title=card.querySelector('.card-name'); if(!title) return;
      const p=list.find(x=>clean(x.name)===clean(title.textContent));
      if(!p) return;
      card.dataset.nxtCat=p.category||'';
      card.dataset.nxtProduct=p.id||'';
    });
    updateToolbar();
  }
  function updateToolbar(){
    const grid=document.getElementById('compoundGrid'); if(!grid) return;
    let bar=document.querySelector('.nxt-catalog-toolbar');
    if(!bar){
      bar=document.createElement('div'); bar.className='nxt-catalog-toolbar';
      bar.innerHTML='<div><span class="nxt-catalog-count">0 products</span> in this view</div><div class="nxt-catalog-hint"><span class="nxt-catalog-dot"></span><span>Open a product for full details and quantity options</span></div>';
      grid.parentNode.insertBefore(bar,grid);
    }
    const count=grid.querySelectorAll('.compound-card').length;
    const countEl=bar.querySelector('.nxt-catalog-count'); if(countEl) countEl.textContent=`${count} product${count===1?'':'s'}`;
  }
  let queued=false;
  function run(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mapCards();});}
  const observer=new MutationObserver(run); observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true}); else setTimeout(run,0);
})();
