(() => {
  if (window.__nxtMobileAppUpgrade) return;
  window.__nxtMobileAppUpgrade = true;

  const style = document.createElement('style');
  style.id = 'nxt-mobile-app-styles';
  style.textContent = `
    @media(max-width:768px){
      :root{
        --nxt-mobile-safe-top:env(safe-area-inset-top,0px);
        --nxt-mobile-safe-bottom:env(safe-area-inset-bottom,0px);
        --nxt-mobile-viewport-top:0px;
        --nxt-mobile-viewport-height:100dvh;
      }

      html{
        width:100%;
        overflow-x:clip;
        scroll-padding-top:calc(72px + var(--nxt-mobile-safe-top));
        -webkit-text-size-adjust:100%;
        text-size-adjust:100%;
      }
      body{
        width:100%;
        min-width:0;
        overflow-x:clip!important;
        padding-bottom:var(--nxt-mobile-safe-bottom)!important;
        overscroll-behavior-x:none;
      }
      body.nxt-mobile-layer-open{overflow:hidden!important}
      body.nxt-mobile-layer-open #molBg,
      body.nxt-mobile-layer-open nav#mainNav,
      body.nxt-mobile-layer-open #filterBar{visibility:hidden!important}
      button,a,input{touch-action:manipulation}
      button,a{-webkit-tap-highlight-color:transparent}
      input,textarea,select{font-size:16px!important}

      body.miami-site nav#mainNav{
        position:sticky;
        top:0;
        height:auto;
        padding:var(--nxt-mobile-safe-top) 12px 0!important;
        background:#0b100e!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        transition:none;
      }
      body.miami-home .home-intro{--intro-top:36px}
      nav#mainNav .mobile-chat-shortcut{
        display:block;
        margin-left:auto;
        min-height:44px;
        padding:0 12px;
        white-space:nowrap;
        color:#edf5f3;
        background:#14201f;
        border:1px solid #304034;
        border-radius:7px;
        font:600 12px Inter,Arial,sans-serif;
        cursor:pointer;
      }
      nav#mainNav .cart-toggle{margin-left:0}
      nav#mainNav .nav-inner{height:60px!important;gap:8px!important}
      nav#mainNav .logo{min-width:0;font-size:.94rem!important;letter-spacing:1.6px!important;gap:4px!important}
      nav#mainNav .logo-icon{width:41px!important;height:34px!important;flex-basis:41px!important}
      nav#mainNav .cart-toggle,
      nav#mainNav .nav-toggle{width:42px!important;height:42px!important;flex:0 0 42px;border-radius:13px!important}
      body.miami-site nav#mainNav ul.open{
        top:100%!important;
        max-height:calc(100dvh - 60px - var(--nxt-mobile-safe-top));
        overflow:auto;
        padding:12px 12px calc(18px + var(--nxt-mobile-safe-bottom))!important;
      }

      .hero{
        min-height:auto!important;
        padding:calc(92px + var(--nxt-mobile-safe-top)) 16px 52px!important;
        overflow:clip!important;
      }
      .hero:before{width:145vw!important;height:145vw!important;top:43%!important}
      .hero:after{inset:calc(68px + var(--nxt-mobile-safe-top)) 8px 8px!important;border-radius:24px!important}
      .hero-content{width:100%!important;max-width:520px!important}
      .hero-badge{margin-bottom:22px!important;padding:7px 10px!important;font-size:.55rem!important;letter-spacing:1.35px!important;white-space:normal!important}
      .hero h1{font-size:clamp(2.75rem,15vw,4.15rem)!important;line-height:.91!important;letter-spacing:-1.4px!important;margin-bottom:22px!important}
      .hero h1 .silver{margin-top:5px!important}
      .hero p{margin:0 0 23px!important;padding:0!important;font-size:.95rem!important;line-height:1.55!important}
      .hero-buttons{width:100%!important;max-width:none!important;gap:10px!important;margin:0!important}
      .hero .btn-primary,.hero-ai-cta{min-height:52px!important;border-radius:13px!important}
      .hero-ai-cta{display:none!important}
      .crypto-assurance{justify-content:flex-start!important;margin-top:17px!important;padding:0 6px!important;text-align:left!important;font-size:10.5px!important;line-height:1.45!important}
      .crypto-assurance span{flex:0 0 28px!important;width:28px!important;height:28px!important}

      .trust-bar{
        width:calc(100% - 24px)!important;
        margin:-18px 12px 42px!important;
        border-radius:20px!important;
        box-shadow:0 22px 55px rgba(0,0,0,.46),0 0 35px rgba(124,58,237,.07)!important;
      }
      .trust-item{min-width:0!important;padding:17px 8px!important}
      .trust-item .num{font-size:1.25rem!important;margin-bottom:8px!important}
      .trust-item .label{font-size:.58rem!important;line-height:1.25!important;letter-spacing:.8px!important}
      .trust-item .trust-sub{font-size:.59rem!important;line-height:1.35!important}

      section,#protocols,#menu,#stacks,#order{padding-left:16px!important;padding-right:16px!important}
      .section-header{padding-inline:0!important}
      .section-header h2{font-size:clamp(1.65rem,7.5vw,2.1rem)!important}
      .protocol-card,.compound-card,.stack-card,.order-card{border-radius:18px!important}
      .protocol-card{min-height:138px!important;padding:16px 13px!important}
      .compound-grid{gap:13px!important}
      .compound-card{padding:17px!important;box-shadow:0 15px 35px rgba(0,0,0,.27),inset 0 1px rgba(255,255,255,.03)!important}
      .card-top{justify-content:space-between!important}
      .card-tags{justify-content:flex-start!important}
      .card-footer{justify-content:space-between!important;text-align:left!important}
      .card-atc-row{display:grid!important;grid-template-columns:minmax(0,1fr) 84px!important;gap:9px!important}
      .card-atc-btn,.custom-select-trigger{min-height:46px!important}

      .premium-search{margin:-7px 0 18px!important}
      .premium-search input{height:52px!important;padding:0 15px 0 45px!important;border-radius:15px!important;text-overflow:ellipsis!important}
      .premium-search:before{left:16px!important;top:8px!important}
      #filterBar.filter-bar{
        top:calc(60px + var(--nxt-mobile-safe-top))!important;
        width:calc(100% + 32px)!important;
        max-width:none!important;
        margin:0 -16px 18px!important;
        padding:8px 16px!important;
        gap:7px!important;
        justify-content:flex-start!important;
        overflow-x:auto!important;
        overscroll-behavior-inline:contain;
        scroll-snap-type:inline proximity;
        scrollbar-width:none;
      }
      #filterBar.filter-bar::-webkit-scrollbar{display:none}
      #filterBar .filter-btn{flex:0 0 auto!important;min-height:40px!important;scroll-snap-align:start;border-radius:11px!important}

      .ai-chat-toggle{display:none!important}
      .ai-chat-panel{
        inset:auto 8px auto 8px!important;
        top:calc(var(--nxt-mobile-viewport-top) + 8px + var(--nxt-mobile-safe-top))!important;
        width:auto!important;
        height:calc(var(--nxt-mobile-viewport-height) - 16px - var(--nxt-mobile-safe-top) - var(--nxt-mobile-safe-bottom))!important;
        max-height:none!important;
        border-radius:22px!important;
        overscroll-behavior:none;
        contain:strict;
        transform:translateZ(0);
      }
      .ai-chat-header{flex:0 0 auto;min-height:68px;padding:12px 16px!important}
      .ai-chat-close{width:42px!important;height:42px!important}
      .ai-chat-messages{min-height:0;padding:14px!important;scroll-padding-bottom:12px}
      .ai-chat-suggestion{min-height:36px;padding:0 12px!important;font-size:11px!important;touch-action:manipulation}
      .ai-chat-form{
        flex:0 0 auto;
        align-items:center;
        padding:10px 10px calc(10px + var(--nxt-mobile-safe-bottom))!important;
        background:rgba(10,8,13,.98)!important;
        box-shadow:0 -12px 32px rgba(0,0,0,.28);
      }
      .ai-chat-input{
        height:48px!important;
        border-radius:14px!important;
        padding:0 15px!important;
        background:#07060a!important;
      }
      .ai-chat-send{flex:0 0 48px;width:48px!important;height:48px!important;border-radius:14px!important}

      body.nxt-ai-keyboard-open .ai-chat-panel.open{
        left:0!important;
        right:0!important;
        top:calc(var(--nxt-mobile-viewport-top) + var(--nxt-mobile-safe-top))!important;
        height:calc(var(--nxt-mobile-viewport-height) - var(--nxt-mobile-safe-top))!important;
        border-left:0!important;
        border-right:0!important;
        border-radius:0!important;
      }
      body.nxt-ai-keyboard-open .ai-chat-header{min-height:54px;padding:6px 12px!important}
      body.nxt-ai-keyboard-open .ai-chat-close{width:40px!important;height:40px!important}
      body.nxt-ai-keyboard-open .ai-chat-messages{padding:10px 12px!important}
      body.nxt-ai-keyboard-open .ai-chat-form{padding:8px 10px!important}
      body.nxt-ai-keyboard-open .ai-chat-input,
      body.nxt-ai-keyboard-open .ai-chat-send{height:46px!important}
      body.nxt-ai-keyboard-open .ai-chat-send{flex-basis:46px;width:46px!important}

      .premium-toast{bottom:calc(16px + var(--nxt-mobile-safe-bottom))!important;max-width:calc(100% - 28px)!important;text-align:center!important}

      .cart-drawer{
        width:100dvw!important;
        max-width:none!important;
        height:100dvh!important;
        border-left:0!important;
      }
      .cart-drawer-header{
        position:sticky;
        top:0;
        z-index:2;
        min-height:72px;
        padding:calc(14px + var(--nxt-mobile-safe-top)) 18px 14px!important;
        background:rgba(14,14,21,.96)!important;
        backdrop-filter:blur(20px);
      }
      .cart-drawer-header h3{font-size:1.2rem!important}
      .cart-close{display:grid!important;place-items:center;width:44px!important;height:44px!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:13px!important;background:rgba(255,255,255,.035)!important;padding:0!important}
      .cart-items{padding:12px 18px!important;overscroll-behavior:contain}
      .cart-item{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:12px!important;padding:18px 0!important}
      .cart-item-controls{margin-top:11px!important;gap:9px!important}
      .cart-item-qty{border-radius:9px!important}
      .cart-item-qty button{width:36px!important;height:36px!important}
      .cart-item-qty span{width:34px!important}
      .cart-item-remove{min-height:36px!important;padding:0 8px!important}
      .cart-drawer-footer{
        position:sticky;
        bottom:0;
        z-index:2;
        padding:16px 18px calc(16px + var(--nxt-mobile-safe-bottom))!important;
        background:rgba(10,10,16,.97)!important;
        box-shadow:0 -18px 45px rgba(0,0,0,.35)!important;
      }
      .cart-checkout-btn{min-height:54px!important;border-radius:13px!important}

      .modal-overlay{align-items:flex-end!important;padding:0!important}
      .modal{
        width:100%!important;
        max-width:none!important;
        max-height:calc(100dvh - var(--nxt-mobile-safe-top) - 8px)!important;
        margin:0!important;
        border-radius:25px 25px 0 0!important;
        border-bottom:0!important;
        box-shadow:0 -22px 70px rgba(0,0,0,.74)!important;
      }
      .modal-close{top:12px!important;right:12px!important;width:44px!important;height:44px!important;border-radius:13px!important}
      .modal-header{padding:31px 56px 20px 18px!important;text-align:left!important}
      .modal-body{padding:20px 18px calc(28px + var(--nxt-mobile-safe-bottom))!important}
      .modal-atc-row{position:sticky;bottom:0;padding:12px 0 calc(4px + var(--nxt-mobile-safe-bottom));background:linear-gradient(180deg,transparent,#0b0910 24%)}

      .nxt-checkout-overlay,
      .nxt-wallet-overlay,
      .nxt-wallet-chooser,
      .nxt-wallet-loading{width:100dvw!important;height:100dvh!important;align-items:stretch!important;padding:0!important;overflow:hidden!important}
      .nxt-checkout-card,
      .nxt-wallet-chooser>.nxt-wallet-card,
      .nxt-wallet-overlay>.nxt-wallet-card{
        width:100%!important;
        max-width:none!important;
        height:100dvh!important;
        max-height:100dvh!important;
        border:0!important;
        border-radius:0!important;
        box-shadow:none!important;
      }
      .nxt-checkout-card{padding:calc(18px + var(--nxt-mobile-safe-top)) 16px calc(18px + var(--nxt-mobile-safe-bottom))!important;overscroll-behavior:contain}
      .nxt-checkout-card h2{font-size:25px!important;line-height:1.12!important}
      .nxt-checkout-intro{font-size:12px!important;line-height:1.55!important}
      .nxt-fulfillment-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;margin-bottom:15px!important}
      .nxt-fulfillment{min-width:0!important;min-height:112px!important;padding:13px!important;border-radius:14px!important}
      .nxt-fulfillment strong{font-size:12px!important;line-height:1.3!important}
      .nxt-field-grid{grid-template-columns:1fr!important;gap:8px!important}
      .nxt-field-grid .wide{grid-column:auto!important}
      .nxt-checkout-card input{min-height:52px!important;padding:0 14px!important;border-radius:12px!important}
      .nxt-checkout-actions{
        position:sticky;
        bottom:calc(-18px - var(--nxt-mobile-safe-bottom));
        z-index:3;
        grid-template-columns:88px minmax(0,1fr)!important;
        gap:8px!important;
        margin:18px -4px 0!important;
        padding:12px 4px calc(18px + var(--nxt-mobile-safe-bottom))!important;
        background:linear-gradient(180deg,transparent 0,#090910 22%,#090910 100%);
      }
      .nxt-checkout-actions button{min-height:52px!important;padding:8px!important;border-radius:13px!important;font-size:11px!important;line-height:1.25!important}
      .checkout-steps{gap:5px!important;margin-bottom:18px!important;font-size:8px!important;letter-spacing:.15px!important}
      .checkout-steps i{width:12px!important}
      .checkout-steps b{width:24px!important;height:24px!important}

      .nxt-wallet-card{overscroll-behavior:contain}
      .nxt-wallet-pad{padding:calc(18px + var(--nxt-mobile-safe-top)) 16px calc(22px + var(--nxt-mobile-safe-bottom))!important}
      .nxt-wallet-card h2{font-size:25px!important}
      .nxt-wallet-trust{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;margin:14px 0!important}
      .nxt-wallet-trust div{min-width:0!important;padding:9px 4px!important;font-size:7.5px!important}
      .nxt-wallet-trust b{font-size:8.5px!important}
      .nxt-wallet-funding-intro{margin:13px 0!important;padding:12px!important}
      .nxt-wallet-funding-intro ol{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}
      .nxt-wallet-funding-intro li{min-height:58px!important;padding:9px 7px 9px 31px!important;font-size:8.5px!important}
      .nxt-wallet-funding-intro li:before{left:7px!important}
      .nxt-wallet-coin{min-height:70px!important;padding:12px!important;border-radius:15px!important}
      .nxt-wallet-icon{width:42px!important;height:42px!important;flex-basis:42px!important}
      .nxt-wallet-coin strong{font-size:12.5px!important}
      .nxt-wallet-coin small{font-size:8.5px!important;line-height:1.35!important}

      .nxt-wallet-pay{display:flex!important;flex-direction:column!important;overflow:hidden!important}
      .nxt-wallet-head{position:sticky!important;top:0!important;z-index:4!important;padding:calc(10px + var(--nxt-mobile-safe-top)) 12px 10px!important}
      .nxt-wallet-head-copy strong{font-size:13px!important}
      .nxt-wallet-head-copy span{font-size:8.5px!important}
      .nxt-wallet-close{width:44px!important;height:44px!important;flex-basis:44px!important;border-radius:13px!important}
      .nxt-wallet-body{display:block!important;flex:1!important;min-height:0!important;overflow:auto!important;padding:14px 14px calc(22px + var(--nxt-mobile-safe-bottom))!important;overscroll-behavior:contain}
      .nxt-wallet-qr{width:min(176px,52vw)!important;margin:0 auto 14px!important;padding:10px!important;border-radius:15px!important}
      .nxt-wallet-order{gap:10px!important}
      .nxt-wallet-summary,.nxt-wallet-local{font-size:9px!important}
      .nxt-wallet-progress{gap:4px!important}
      .nxt-wallet-step{padding:7px 2px!important;font-size:7px!important}
      .nxt-wallet-field{padding:12px!important}
      .nxt-wallet-copyline{grid-template-columns:minmax(0,1fr) auto!important}
      .nxt-wallet-value{font-size:12px!important}
      .nxt-wallet-value.amount{font-size:18px!important}
      .nxt-wallet-copy{min-height:42px!important}
      .nxt-wallet-buy{padding:14px!important;border-radius:15px!important}
      .nxt-wallet-buy-head{gap:8px!important}
      .nxt-wallet-buy-badge{white-space:nowrap!important}
      .nxt-wallet-buy-confidence{display:flex!important;overflow-x:auto!important;flex-wrap:nowrap!important;padding-bottom:2px!important;scrollbar-width:none}
      .nxt-wallet-buy-confidence span{flex:0 0 auto!important}
      .nxt-wallet-buy-steps{grid-template-columns:1fr!important}
      .nxt-wallet-buy-step{min-height:48px!important}
      .nxt-wallet-actions{grid-template-columns:1fr!important}
      .nxt-wallet-actions a,.nxt-wallet-actions button{min-height:50px!important}
      .nxt-wallet-verify input{font-size:16px!important;height:50px!important}
      .nxt-wallet-verify button{min-height:46px!important}
      .nxt-wallet-resume{right:10px!important;bottom:calc(16px + var(--nxt-mobile-safe-bottom))!important;max-width:calc(100% - 20px)!important}

      .nxt-swaps-drawer{width:100dvw!important;height:100dvh!important;border-left:0!important}
      .nxt-swaps-header{padding:calc(10px + var(--nxt-mobile-safe-top)) 12px 10px!important}
      .nxt-swaps-guide ol{grid-template-columns:1fr!important}
      .nxt-swaps-launch-pane{padding:20px 16px!important;align-content:start!important;padding-top:34px!important}
      .nxt-swaps-launch-facts{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      .nxt-swaps-footer{padding:10px 12px calc(10px + var(--nxt-mobile-safe-bottom))!important}
    }

    @media(max-width:360px){
      nav#mainNav .logo{font-size:.84rem!important;letter-spacing:1.2px!important}
      nav#mainNav .logo-icon{width:37px!important;height:31px!important;flex-basis:37px!important}
      .hero{padding-left:13px!important;padding-right:13px!important}
      .hero h1{font-size:2.72rem!important}
      .hero-badge{font-size:.49rem!important}
      .protocols-grid{grid-template-columns:1fr 1fr!important}
      .protocol-card{padding:14px 10px!important}
      .nxt-wallet-funding-intro{padding:10px!important}
      .nxt-wallet-funding-intro-head{gap:8px!important}
      .nxt-wallet-funding-intro-icon{width:34px!important;height:34px!important;flex-basis:34px!important}
      .nxt-wallet-funding-intro li{padding-left:29px!important;font-size:8px!important}
      .checkout-steps{font-size:7.5px!important}
    }

    @media(max-width:768px) and (max-height:650px){
      .crypto-assurance{display:none!important}
    }

  `;
  document.head.appendChild(style);

  const aiChatPanel = document.getElementById('aiChatPanel');
  const aiChatInput = document.getElementById('aiChatInput');
  const aiChatMessages = document.getElementById('aiChatMessages');
  let mobileViewportCeiling = window.visualViewport?.height || window.innerHeight;
  let mobileViewportFrame = 0;
  let layerStateFrame = 0;
  let lastViewportTop = -1;
  let lastViewportHeight = -1;
  let lastKeyboardOpen = false;
  let lastMessageScrollHeight = -1;

  function syncMobileVisualViewport() {
    mobileViewportFrame = 0;
    const root = document.documentElement;

    const chatOpen = Boolean(aiChatPanel?.classList.contains('open'));
    if (window.innerWidth > 768 || !chatOpen) {
      if (!chatOpen) mobileViewportCeiling = window.visualViewport?.height || window.innerHeight;
      if (lastViewportHeight < 0) return;
      root.style.removeProperty('--nxt-mobile-viewport-top');
      root.style.removeProperty('--nxt-mobile-viewport-height');
      document.body.classList.remove('nxt-ai-keyboard-open');
      lastViewportTop = -1;
      lastViewportHeight = -1;
      lastKeyboardOpen = false;
      return;
    }

    const viewport = window.visualViewport;
    const viewportTop = Math.max(0, viewport?.offsetTop || 0);
    const viewportHeight = Math.max(1, viewport?.height || window.innerHeight);
    const inputFocused = document.activeElement === aiChatInput;

    if (Math.abs(viewportTop - lastViewportTop) > .5) {
      root.style.setProperty('--nxt-mobile-viewport-top', `${viewportTop.toFixed(2)}px`);
      lastViewportTop = viewportTop;
    }
    if (Math.abs(viewportHeight - lastViewportHeight) > .5) {
      root.style.setProperty('--nxt-mobile-viewport-height', `${viewportHeight.toFixed(2)}px`);
      lastViewportHeight = viewportHeight;
    }

    if (!inputFocused) {
      mobileViewportCeiling = Math.max(mobileViewportCeiling, viewportHeight);
    }

    const keyboardOpen = inputFocused || viewportHeight < mobileViewportCeiling - 80;
    if (keyboardOpen !== lastKeyboardOpen) {
      document.body.classList.toggle('nxt-ai-keyboard-open', keyboardOpen);
      lastKeyboardOpen = keyboardOpen;
    }

    const messageScrollHeight = aiChatMessages?.scrollHeight || 0;
    if (keyboardOpen && aiChatMessages && messageScrollHeight !== lastMessageScrollHeight) {
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
      lastMessageScrollHeight = messageScrollHeight;
    }
  }

  function scheduleMobileViewportSync() {
    if (mobileViewportFrame) return;
    mobileViewportFrame = requestAnimationFrame(syncMobileVisualViewport);
  }

  function syncLayerState() {
    layerStateFrame = 0;
    const layerOpen = Boolean(document.querySelector(
      '.cart-overlay.active,.modal-overlay.active,.ai-chat-panel.open,.nxt-checkout-overlay,.nxt-wallet-overlay,.nxt-wallet-chooser,.nxt-wallet-loading,.nxt-swaps-layer.open'
    ));
    document.body.classList.toggle('nxt-mobile-layer-open', layerOpen);
    scheduleMobileViewportSync();
  }

  function scheduleLayerStateSync() {
    if (layerStateFrame) return;
    layerStateFrame = requestAnimationFrame(syncLayerState);
  }

  aiChatInput?.addEventListener('focus', scheduleMobileViewportSync);
  aiChatInput?.addEventListener('blur', () => setTimeout(scheduleMobileViewportSync, 0));
  window.visualViewport?.addEventListener('resize', scheduleMobileViewportSync, { passive: true });
  window.visualViewport?.addEventListener('scroll', scheduleMobileViewportSync, { passive: true });
  window.addEventListener('resize', scheduleMobileViewportSync, { passive: true });
  window.addEventListener('orientationchange', () => {
    mobileViewportCeiling = 0;
    scheduleMobileViewportSync();
  });
  new MutationObserver(scheduleLayerStateSync).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', scheduleLayerStateSync, true);
  syncLayerState();
  syncMobileVisualViewport();
})();
