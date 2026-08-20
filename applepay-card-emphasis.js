(() => {
  if (window.__nxtApplePayCardEmphasisLoaded) return;
  window.__nxtApplePayCardEmphasisLoaded = true;

  // Load the current embedded Transak checkout integration.
  if (!document.querySelector('script[data-nxt-transak]')) {
    const script = document.createElement('script');
    script.src = '/transak-checkout.js?v=20260820-3';
    script.async = false;
    script.dataset.nxtTransak = '1';
    document.body.appendChild(script);
  }
})();
