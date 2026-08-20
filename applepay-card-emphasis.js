(() => {
  if (window.__nxtApplePayCardEmphasisLoaded) return;
  window.__nxtApplePayCardEmphasisLoaded = true;

  // Load the Transak checkout enhancement after the existing checkout UI.
  // This file is already included by index.html, so no markup change is needed.
  if (!document.querySelector('script[data-nxt-transak]')) {
    const script = document.createElement('script');
    script.src = '/transak-checkout.js?v=20260820-2';
    script.async = false;
    script.dataset.nxtTransak = '1';
    document.body.appendChild(script);
  }
})();
