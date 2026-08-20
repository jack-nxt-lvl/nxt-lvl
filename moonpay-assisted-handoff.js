(() => {
  // Retire the legacy MoonPay handoff and use this already-loaded asset as
  // the stable bootstrap for the current Transak checkout.
  try { sessionStorage.removeItem('nxtMoonpayPaymentV2'); } catch (_) {}

  const removeLegacyMoonPay = () => {
    document.querySelectorAll('.nxt-moon-assist').forEach(el => el.remove());
  };
  removeLegacyMoonPay();
  window.addEventListener('pageshow', removeLegacyMoonPay);
  window.addEventListener('focus', removeLegacyMoonPay);

  if (!window.__nxtTransakCheckoutLoaded && !document.querySelector('script[data-nxt-transak-bootstrap]')) {
    const script = document.createElement('script');
    script.src = '/transak-checkout.js?v=20260820-4';
    script.async = false;
    script.dataset.nxtTransakBootstrap = '1';
    script.onerror = () => console.error('Unable to load Transak checkout.');
    document.head.appendChild(script);
  }
})();
