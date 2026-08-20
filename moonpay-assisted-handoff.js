(() => {
  // Legacy MoonPay handoff is intentionally disabled.
  // Transak is now the customer-facing Apple Pay / card crypto checkout.
  try {
    sessionStorage.removeItem('nxtMoonpayPaymentV2');
  } catch (_) {}

  const removeLegacyMoonPay = () => {
    document.querySelectorAll('.nxt-moon-assist').forEach(el => el.remove());
  };

  removeLegacyMoonPay();
  window.addEventListener('pageshow', removeLegacyMoonPay);
  window.addEventListener('focus', removeLegacyMoonPay);
})();
