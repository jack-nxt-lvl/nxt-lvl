(() => {
  // Legacy MoonPay is fully retired. This guard removes any stale MoonPay
  // UI/state that may be created by an older cached page and keeps Transak as
  // the only customer-facing card/Apple Pay crypto checkout.
  const clearMoonPayState = () => {
    try {
      sessionStorage.removeItem('nxtMoonpayPaymentV2');
      sessionStorage.removeItem('nxtMoonpayPayment');
      localStorage.removeItem('nxtMoonpayPaymentV2');
      localStorage.removeItem('nxtMoonpayPayment');
    } catch (_) {}
  };

  const removeLegacyMoonPay = () => {
    clearMoonPayState();
    document.querySelectorAll('.nxt-moon-assist,.moonpay-overlay,[data-moonpay]').forEach(el => el.remove());

    document.querySelectorAll('a[href*="moonpay.com"],button').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute?.('href') || '').toLowerCase();
      if (href.includes('moonpay.com') || text.includes('open moonpay')) {
        if (el.tagName === 'A') el.removeAttribute('href');
        el.style.display = 'none';
        el.setAttribute('aria-hidden','true');
      }
    });
  };

  removeLegacyMoonPay();
  window.addEventListener('pageshow', removeLegacyMoonPay);
  window.addEventListener('focus', removeLegacyMoonPay);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) removeLegacyMoonPay(); });

  const observer = new MutationObserver(removeLegacyMoonPay);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (!window.__nxtTransakCheckoutLoaded && !document.querySelector('script[data-nxt-transak-bootstrap]')) {
    const script = document.createElement('script');
    script.src = '/transak-checkout.js?v=20260820-transak-only-1';
    script.async = false;
    script.dataset.nxtTransakBootstrap = '1';
    script.onerror = () => console.error('Unable to load Transak checkout.');
    document.head.appendChild(script);
  }
})();
