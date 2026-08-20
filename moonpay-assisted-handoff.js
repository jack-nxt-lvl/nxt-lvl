(() => {
  // Legacy provider guard. Transak is the only customer-facing card/Apple Pay
  // crypto checkout. This removes stale provider state/UI from older pages.
  const clearLegacyState = () => {
    try {
      sessionStorage.removeItem('nxtMoonpayPaymentV2');
      sessionStorage.removeItem('nxtMoonpayPayment');
      localStorage.removeItem('nxtMoonpayPaymentV2');
      localStorage.removeItem('nxtMoonpayPayment');
    } catch (_) {}
  };

  const cleanLegacyUI = () => {
    clearLegacyState();
    document.querySelectorAll('.nxt-moon-assist,.moonpay-overlay,[data-moonpay]').forEach(el => el.remove());

    document.querySelectorAll('a[href*="moonpay.com"],button').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute?.('href') || '').toLowerCase();
      if (href.includes('moonpay.com') || text.includes('open moonpay')) {
        if (el.tagName === 'A') el.removeAttribute('href');
        el.remove();
      }
    });

    document.querySelectorAll('.nxt-panel-sub').forEach(el => {
      if ((el.textContent || '').toLowerCase().includes('moonpay')) {
        el.textContent = 'Choose BTC, ETH, or USDT. Transak handles the purchase securely inside this checkout.';
      }
    });
  };

  cleanLegacyUI();
  window.addEventListener('pageshow', cleanLegacyUI);
  window.addEventListener('focus', cleanLegacyUI);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) cleanLegacyUI(); });

  const observer = new MutationObserver(cleanLegacyUI);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (!window.__nxtTransakCheckoutLoaded && !document.querySelector('script[data-nxt-transak-bootstrap]')) {
    const script = document.createElement('script');
    script.src = '/transak-checkout.js?v=20260820-transak-only-2';
    script.async = false;
    script.dataset.nxtTransakBootstrap = '1';
    script.onerror = () => console.error('Unable to load Transak checkout.');
    document.head.appendChild(script);
  }
})();
