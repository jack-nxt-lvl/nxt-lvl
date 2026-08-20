(() => {
  // Retired. Checkout is now handled only by customer-checkout-upgrade.js
  // and transak-checkout.js. Keeping this file inert prevents older payment
  // handoff listeners from competing with the Transak-only flow.
})();
