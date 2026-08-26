function normalizeProductSearch(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

if (typeof document !== 'undefined') (() => {
  // Add SLU-PP-332 to the same product database used by the storefront.
  if (typeof compounds !== 'undefined' && Array.isArray(compounds) && !compounds.some(p => p.id === 'slu-pp-332-10')) {
    compounds.push({
      id: 'slu-pp-332-10',
      name: 'SLU-PP-332 — 10mg',
      aka: 'Pan-ERR Agonist / Exercise-Mimetic Research Compound',
      category: 'freeze-dried',
      protocols: ['fat-loss', 'energy-vitality'],
      badge: 'NEW',
      tags: ['ERRα/β/γ Agonist', 'Mitochondrial Research', 'Oxidative Metabolism', 'Fatty Acid Oxidation', 'Exercise-Mimetic Research'],
      shortDesc: 'Preclinical pan-ERR agonist studied for mitochondrial activity, oxidative metabolism, fatty-acid oxidation, and exercise-response signaling.',
      description: 'SLU-PP-332 is a synthetic small-molecule agonist of estrogen-related receptors ERRα, ERRβ, and ERRγ, with the strongest reported activity at ERRα. Preclinical studies have investigated its effects on exercise-responsive gene programs, mitochondrial function and cellular respiration, oxidative skeletal-muscle characteristics, energy expenditure, and fatty-acid oxidation. In mouse studies, researchers reported increased oxidative type IIa muscle fibers and exercise endurance, while obesity-model studies reported increased energy expenditure and fatty-acid oxidation with reduced fat-mass accumulation. These findings are preclinical and do not establish human safety or efficacy.',
      benefits: [
        'Activates ERRα/β/γ signaling in preclinical research',
        'Studied for increased mitochondrial function and cellular respiration',
        'Studied for increased oxidative type IIa skeletal-muscle fibers',
        'Enhanced exercise endurance in mouse research models',
        'Studied for increased energy expenditure and fatty-acid oxidation',
        'Reduced fat-mass accumulation in mouse obesity models',
        'Useful research tool for exercise-responsive metabolic signaling'
      ],
      sideEffects: ['Human safety profile has not been established'],
      dosing: {},
      amount: '10mg per vial',
      form: 'Lyophilized / Freeze-Dried Research Compound',
      appearance: 'Research powder',
      purity: 'See batch COA',
      molecularFormula: 'C18H14N2O2',
      halfLife: 'Not established in humans',
      reconstitution: 'Follow laboratory handling procedures and batch documentation.',
      syringe: 'N/A — laboratory research compound',
      injectionSite: 'Not for human or veterinary use',
      storage: 'Store according to batch documentation and laboratory handling requirements.',
      administration: 'Laboratory research use only',
      warnings: 'For research use only. Not for human or veterinary use. SLU-PP-332 is preclinical and is not an FDA-approved drug.',
      suggestedCompanions: [],
      pricing: [
        { label: '1 Vial', price: 85 },
        { label: '5 Vials', price: 348.5 },
        { label: '10 Vials', price: 595 }
      ]
    });
  }

  const css = document.createElement('style');
  css.textContent = `
  :root{--lux:#c4b5fd;--lux2:#8b5cf6;--panel:#0d0d14}
  body{background:radial-gradient(ellipse at 50% -8%,rgba(139,92,246,.28),transparent 34%),radial-gradient(circle at 8% 24%,rgba(109,40,217,.15),transparent 25%),radial-gradient(circle at 92% 38%,rgba(167,139,250,.12),transparent 25%),linear-gradient(180deg,#05040a 0%,#020204 48%,#07040d 100%);background-attachment:fixed}
  body:before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background:linear-gradient(115deg,transparent 0 35%,rgba(255,255,255,.018) 43%,transparent 51% 100%),radial-gradient(circle at 50% 18%,rgba(196,181,253,.07),transparent 20%);mix-blend-mode:screen}
  #molBg{opacity:1!important;filter:drop-shadow(0 0 10px rgba(139,92,246,.24))}
  nav{background:rgba(3,3,7,.88)!important;border-bottom:1px solid rgba(167,139,250,.10)!important}
  .hero{min-height:100vh!important;isolation:isolate;background:radial-gradient(ellipse at 50% 38%,rgba(124,58,237,.13),transparent 47%);padding-top:130px!important}
  .hero:before{content:'';position:absolute;width:760px;height:760px;left:50%;top:47%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.19),rgba(76,29,149,.07) 36%,transparent 69%);filter:blur(14px);pointer-events:none;z-index:0}
  .hero:after{content:'';position:absolute;inset:86px 5% 8%;border:1px solid rgba(196,181,253,.06);border-radius:32px;pointer-events:none;box-shadow:inset 0 0 130px rgba(124,58,237,.035),0 0 90px rgba(124,58,237,.025)}
  .hero-content{position:relative;z-index:2;text-shadow:0 12px 55px rgba(0,0,0,.68);max-width:980px!important;width:100%!important}
  .hero-badge{margin-bottom:30px!important;background:rgba(17,13,27,.66)!important;border-color:rgba(196,181,253,.28)!important;box-shadow:0 12px 45px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.04);backdrop-filter:blur(16px);font-weight:700!important}
  .hero h1{font-family:'Space Grotesk','Inter',sans-serif!important;font-size:clamp(3.2rem,8vw,7rem)!important;line-height:.92!important;letter-spacing:-2px!important;margin-bottom:30px!important;text-transform:uppercase!important;font-style:italic!important}
  .hero h1 .purple{display:block;background:linear-gradient(180deg,#ffffff 0%,#e7e7ef 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;filter:drop-shadow(0 0 22px rgba(255,255,255,.08))!important}
  .hero h1 .silver{display:block;margin-top:8px;background:linear-gradient(135deg,#b794f6 0%,#8b5cf6 42%,#6d28d9 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;filter:drop-shadow(0 0 28px rgba(124,58,237,.30))!important}
  .hero p{max-width:700px!important;font-size:1.12rem!important;line-height:1.65!important;color:#c6c6d0!important;margin:0 auto 34px!important;font-weight:400!important}
  .hero p strong{color:#fff!important}
  .hero-buttons{align-items:stretch!important;gap:16px!important;margin-top:4px!important}
  .hero .btn-primary{min-height:58px;display:inline-flex;align-items:center;justify-content:center;padding:0 32px!important;font-weight:800!important;letter-spacing:1.4px!important;background:linear-gradient(135deg,#8b5cf6,#5b21b6)!important;border:1px solid rgba(196,181,253,.35)!important;box-shadow:0 16px 42px rgba(91,33,182,.35),inset 0 1px rgba(255,255,255,.12)!important}
  .hero-ai-cta{min-height:58px!important;padding:0 28px!important;border:1px solid rgba(196,181,253,.42)!important;border-radius:10px!important;background:linear-gradient(135deg,rgba(24,21,34,.96),rgba(12,11,18,.98))!important;color:#fff!important;box-shadow:0 12px 35px rgba(0,0,0,.32),inset 0 1px rgba(255,255,255,.06)!important;font-weight:800!important;letter-spacing:.9px!important;position:relative;overflow:hidden}
  .hero-ai-cta:before{content:'✦';font-size:16px;color:#c4b5fd;margin-right:9px;filter:drop-shadow(0 0 8px #8b5cf6)}
  .hero-ai-cta:after{content:'ONLINE';font-size:8px;letter-spacing:1.5px;color:#b8f7d2;background:rgba(34,197,94,.09);border:1px solid rgba(74,222,128,.25);border-radius:99px;padding:3px 6px;margin-left:10px}
  .hero-ai-cta:hover{transform:translateY(-3px)!important;border-color:#c4b5fd!important;box-shadow:0 18px 48px rgba(76,29,149,.35),0 0 28px rgba(139,92,246,.16)!important}
  .trust-bar{max-width:1120px!important;margin:-78px auto 85px!important;position:relative!important;z-index:5!important;grid-template-columns:repeat(4,1fr)!important;border:1px solid rgba(167,139,250,.18)!important;border-radius:18px!important;overflow:hidden!important;background:linear-gradient(145deg,rgba(17,16,24,.92),rgba(7,7,11,.95))!important;box-shadow:0 24px 70px rgba(0,0,0,.42),0 0 45px rgba(124,58,237,.05)!important;backdrop-filter:blur(16px)!important}
  .trust-item{padding:28px 18px!important;border-right:1px solid rgba(167,139,250,.12)!important;background:transparent!important}
  .trust-item:hover{background:rgba(124,58,237,.055)!important}
  .trust-item .num{font-family:'Space Grotesk','Inter',sans-serif!important;font-size:1.85rem!important;line-height:1!important;margin-bottom:12px!important;color:#a78bfa!important;text-shadow:0 0 20px rgba(139,92,246,.30)!important}
  .trust-item .label{font-size:.70rem!important;letter-spacing:1.6px!important;color:#f1f1f5!important;font-weight:800!important;margin-top:0!important}
  .trust-item .trust-sub{font-size:.70rem;color:#8f8f9f;margin-top:7px;line-height:1.45}
  .crypto-assurance{max-width:920px;margin:20px auto 0;display:flex;align-items:center;justify-content:center;gap:10px;color:#aaaabb;font:600 12px Inter;letter-spacing:.4px}.crypto-assurance b{color:#c4b5fd}.crypto-assurance span{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:rgba(124,58,237,.10);border:1px solid rgba(167,139,250,.18);color:#c4b5fd}
  .ai-chat-toggle{width:auto!important;min-width:150px!important;height:54px!important;border-radius:14px!important;padding:0 17px!important;gap:10px!important;background:linear-gradient(135deg,#8b5cf6,#5b21b6)!important;box-shadow:0 18px 50px rgba(76,29,149,.48),0 0 24px rgba(139,92,246,.20)!important}
  .ai-chat-toggle:after{content:'AI Assistant';font:800 12px Inter;letter-spacing:.4px;white-space:nowrap}
  .ai-chat-toggle svg{width:22px!important;height:22px!important}
  .compound-card{min-height:390px;border-color:rgba(167,139,250,.16);background:linear-gradient(145deg,rgba(19,17,28,.96),rgba(9,9,14,.96))!important;box-shadow:0 14px 42px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.025)}
  .compound-card:hover{transform:translateY(-6px);box-shadow:0 24px 70px rgba(0,0,0,.55),0 0 42px rgba(124,58,237,.13)}
  .card-atc-btn,.btn-primary{border-radius:9px!important;box-shadow:0 8px 24px rgba(124,58,237,.18)}
  .premium-search{max-width:720px;margin:-25px auto 28px;position:relative}.premium-search input{width:100%;padding:16px 18px 16px 48px;background:rgba(17,17,24,.9);border:1px solid rgba(167,139,250,.18);border-radius:12px;color:#fff;font:500 14px Inter;outline:none;box-shadow:0 16px 45px rgba(0,0,0,.22)}.premium-search input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(124,58,237,.1),0 16px 45px rgba(0,0,0,.3)}.premium-search:before{content:'⌕';position:absolute;left:18px;top:8px;font-size:27px;color:#a78bfa;z-index:2}
  .checkout-steps{display:flex;align-items:center;justify-content:center;gap:9px;margin:0 0 22px;font:700 11px Inter;letter-spacing:.5px;color:#77778a}.checkout-steps span{display:flex;align-items:center;gap:7px}.checkout-steps b{width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:#1c1c27;border:1px solid rgba(255,255,255,.1);color:#aaa}.checkout-steps .active{color:#fff}.checkout-steps .active b{background:linear-gradient(135deg,#8b5cf6,#6d28d9);border-color:#8b5cf6}.checkout-steps i{width:38px;height:1px;background:rgba(255,255,255,.1)}
  .cart-drawer{background:linear-gradient(180deg,#0e0e15,#09090f)!important;box-shadow:-30px 0 80px rgba(0,0,0,.55)}.cart-item{padding:18px 0!important}.cart-item-price{color:#c4b5fd!important}.cart-drawer-footer{background:rgba(10,10,16,.96)}
  .premium-cart-fees{font-size:12px;color:#9999aa;margin:12px 0 15px;padding:12px;border-radius:9px;background:#12121b;border:1px solid rgba(255,255,255,.05)}.premium-cart-fees div{display:flex;justify-content:space-between;margin:5px 0}.premium-cart-fees .total{padding-top:8px;margin-top:8px;border-top:1px solid rgba(255,255,255,.07);color:#fff;font-weight:800}
  .premium-footer-links{display:flex;justify-content:center;gap:22px;flex-wrap:wrap;margin:16px 0 4px}.premium-footer-links a{color:#9999aa;text-decoration:none;font-size:12px}.premium-footer-links a:hover{color:#a78bfa}
  .premium-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:#15151f;color:#fff;border:1px solid rgba(167,139,250,.22);padding:11px 16px;border-radius:10px;z-index:9999999;opacity:0;transition:.25s;box-shadow:0 18px 50px rgba(0,0,0,.5);font:600 12px Inter}.premium-toast.show{opacity:1;transform:translate(-50%,0)}
  @media(max-width:900px){.trust-bar{grid-template-columns:repeat(2,1fr)!important;margin:-55px 16px 70px!important}.trust-item:nth-child(2){border-right:none!important}.trust-item:nth-child(-n+2){border-bottom:1px solid rgba(167,139,250,.12)!important}}
  @media(max-width:700px){nav{padding:0 18px!important}.hero{padding-top:112px!important}.hero:after{inset:72px 10px 12px;border-radius:22px}.hero h1{font-size:clamp(2.65rem,16vw,4.1rem)!important;letter-spacing:-1px!important}.hero p{font-size:.98rem!important;padding:0 12px!important}.hero-buttons{flex-direction:column!important;width:min(100%,340px)!important;margin-left:auto!important;margin-right:auto!important}.hero .btn-primary,.hero-ai-cta{width:100%!important;min-height:54px!important}.trust-bar{margin:-30px 12px 55px!important;grid-template-columns:1fr 1fr!important}.trust-item{padding:22px 10px!important}.trust-item .num{font-size:1.55rem!important}.trust-item .label{font-size:.62rem!important;letter-spacing:1.1px!important}.trust-item .trust-sub{font-size:.62rem}.premium-search{margin:-18px 0 22px}.compound-grid{grid-template-columns:1fr!important}.compound-card{min-height:0;padding:22px!important}.card-atc-row{flex-direction:column}.card-atc-btn{height:44px}.cart-drawer{width:100%!important;max-width:100vw!important}.ai-chat-toggle{min-width:0!important;width:56px!important;height:56px!important;border-radius:50%!important;padding:0!important;right:14px!important;bottom:14px!important}.ai-chat-toggle:after{display:none}.checkout-steps i{width:18px}.checkout-steps{font-size:9px}.crypto-assurance{padding:0 14px;text-align:center;font-size:11px}}
  `;
  document.head.appendChild(css);

  // Homepage hero redesign.
  const hero = document.querySelector('.hero');
  if (hero) {
    const badge = hero.querySelector('.hero-badge');
    if (badge) badge.innerHTML = '<span class="hero-badge-dot"></span>Premium Research Compounds';
    const title = hero.querySelector('h1');
    if (title) title.innerHTML = '<span class="purple">NXT LVL</span><span class="silver">Research</span>';
    const copy = hero.querySelector('.hero-content > p');
    if (copy) copy.innerHTML = 'Ultra-pure peptides and research compounds. <strong>Trusted quality.</strong> USA company with fast USA shipping.';
    const primary = hero.querySelector('.btn-primary');
    if (primary) primary.textContent = 'View Compounds';
    if (!hero.querySelector('.crypto-assurance')) {
      const assurance = document.createElement('div');
      assurance.className = 'crypto-assurance';
      assurance.innerHTML = '<span>🔒</span><div><b>Direct crypto payments</b> · BTC, ETH, and USDT are verified independently on-chain. <a href="#crypto-guide">New to crypto? See how it works.</a></div>';
      hero.querySelector('.hero-buttons')?.insertAdjacentElement('afterend', assurance);
    }
  }

  // Replace number-focused trust bar with premium company/payment trust points.
  const trustBar = document.querySelector('.trust-bar');
  if (trustBar) {
    trustBar.innerHTML = `
      <div class="trust-item"><div class="num">◇</div><div class="label">Premium Quality</div><div class="trust-sub">Carefully sourced research compounds.</div></div>
      <div class="trust-item"><div class="num">🇺🇸</div><div class="label">USA Company</div><div class="trust-sub">Proudly based in the United States.</div></div>
      <div class="trust-item"><div class="num">↗</div><div class="label">Fast USA Shipping</div><div class="trust-sub">Domestic fulfillment and discreet packaging.</div></div>
      <div class="trust-item"><div class="num">🔒</div><div class="label">Direct Crypto Payments</div><div class="trust-sub">BTC, ETH and ERC-20 USDT checkout support.</div></div>`;
  }

  const heroAi=document.querySelector('.hero .btn-secondary[onclick*="toggleAiChat"]');if(heroAi){heroAi.classList.add('hero-ai-cta');heroAi.textContent='Ask NXT LVL AI';}
  const menu = document.querySelector('#menu .section-header');
  if(menu&&!document.querySelector('.premium-search, .nxt-product-search')){const wrap=document.createElement('div');wrap.className='premium-search';wrap.innerHTML='<input id="premiumProductSearch" type="search" placeholder="Search compounds and research products…" aria-label="Search products">';menu.insertAdjacentElement('afterend',wrap);wrap.querySelector('input').addEventListener('input',e=>{const q=normalizeProductSearch(e.target.value);document.querySelectorAll('.compound-card').forEach(card=>{card.style.display=!q||normalizeProductSearch(card.textContent).includes(q)?'flex':'none';});});}

  const footer=document.querySelector('footer');
  if(footer&&!footer.querySelector('.premium-footer-links')){const links=document.createElement('div');links.className='premium-footer-links';links.innerHTML='<a href="#menu">Products</a><a href="#crypto-guide">How to Pay</a><a href="#order">Ordering</a><a href="mailto:payment@nxtlvl-research.com">Contact</a><a href="#research-disclaimer">Research Disclaimer</a>';footer.prepend(links);}
  const disclaimer=document.querySelector('.disclaimer-section');if(disclaimer)disclaimer.id='research-disclaimer';

  function steps(active){return `<div class="checkout-steps"><span class="${active>=1?'active':''}"><b>1</b>Information</span><i></i><span class="${active>=2?'active':''}"><b>2</b>Payment</span><i></i><span class="${active>=3?'active':''}"><b>3</b>Confirmation</span></div>`}
  const observer=new MutationObserver(()=>{document.querySelectorAll('body > div').forEach(el=>{if(el.dataset.premiumChecked)return;const text=el.textContent||'';if(text.includes('Shipping or Local Pickup')){el.dataset.premiumChecked='1';const box=el.firstElementChild;if(box)box.insertAdjacentHTML('afterbegin',steps(1));}else if(text.includes('Choose your payment asset')){el.dataset.premiumChecked='1';const box=el.firstElementChild;if(box)box.insertAdjacentHTML('afterbegin',steps(2));}else if(text.includes('Pay directly with')){el.dataset.premiumChecked='1';const target=el.querySelector('.nxt-wallet-head');if(target)target.insertAdjacentHTML('afterend',steps(2));}})});observer.observe(document.body,{childList:true});

  function upgradeCart(){const footer=document.querySelector('.cart-drawer-footer');if(!footer||footer.querySelector('.premium-cart-fees'))return;const note=footer.querySelector('.cart-note');const box=document.createElement('div');box.className='premium-cart-fees';box.innerHTML='<div><span>Shipping</span><span>$10.00</span></div><div><span>Sales tax</span><span>Calculated at checkout</span></div><div class="total"><span>Secure crypto checkout</span><span>🔒</span></div>';note?.insertAdjacentElement('afterend',box)}upgradeCart();

  if(!document.querySelector('.premium-toast')){const toast=document.createElement('div');toast.className='premium-toast';toast.textContent='Added to cart ✓';document.body.appendChild(toast);document.addEventListener('click',e=>{if(e.target.closest('.card-atc-btn,.modal-atc-btn')){toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1400)}});}
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeProductSearch };
}
