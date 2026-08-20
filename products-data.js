// NXT LVL data loader + checkout override
// Load the original product database synchronously so index.html can use compounds/categories/stacks immediately.
document.write('<script src="/products-data-original.js?v=' + Date.now() + '"><\/script>');
document.write('<script defer src="/premium-enhancements.js?v=2"><\/script>');

window.addEventListener('DOMContentLoaded', () => {
  // Brand mark: angular white N with a purple slash, based on the selected NXT LVL concept.
  const navLogo = document.querySelector('.logo-icon');
  if (navLogo) {
    navLogo.setAttribute('aria-hidden', 'true');
    navLogo.style.cssText = 'width:46px;height:38px;background:transparent;border-radius:0;box-shadow:none;display:flex;align-items:center;justify-content:center;flex:0 0 auto;overflow:visible;';
    navLogo.innerHTML = `<svg viewBox="0 0 92 70" width="46" height="38" role="img" aria-label="NXT LVL mark" style="display:block;overflow:visible;filter:drop-shadow(0 0 9px rgba(124,58,237,.24));">
      <defs>
        <linearGradient id="nxtLogoPurple" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#5B21B6"/>
          <stop offset="0.52" stop-color="#7C3AED"/>
          <stop offset="1" stop-color="#A78BFA"/>
        </linearGradient>
        <linearGradient id="nxtLogoWhite" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#D7D7E0"/>
        </linearGradient>
      </defs>
      <path fill="url(#nxtLogoWhite)" d="M8 60 20 10h17l24 31 8-31h15L72 60H57L32 29 25 60Z"/>
      <path fill="url(#nxtLogoPurple)" d="M4 62 82 13 88 20 10 68Z"/>
      <path fill="rgba(255,255,255,.34)" d="M15 57 76 19 79 22 18 60Z"/>
    </svg>`;
  }

  // Upgrade the NXT LVL wordmark to match the sharper logo mark.
  const navWordmark = document.querySelector('.logo');
  if (navWordmark) {
    navWordmark.style.fontFamily = "'Space Grotesk','Inter',sans-serif";
    navWordmark.style.fontWeight = '800';
    navWordmark.style.fontSize = '1.38rem';
    navWordmark.style.letterSpacing = '2.6px';
    navWordmark.style.textTransform = 'uppercase';
    navWordmark.style.fontStyle = 'italic';
    navWordmark.style.transform = 'skewX(-5deg)';
    navWordmark.style.textShadow = '0 0 14px rgba(255,255,255,.06)';
  }
  const navAccent = document.querySelector('.logo .accent');
  if (navAccent) {
    navAccent.style.background = 'linear-gradient(135deg,#c4b5fd 0%,#8b5cf6 45%,#6d28d9 100%)';
    navAccent.style.webkitBackgroundClip = 'text';
    navAccent.style.backgroundClip = 'text';
    navAccent.style.webkitTextFillColor = 'transparent';
    navAccent.style.textShadow = 'none';
  }

  // Checkout is owned exclusively by customer-checkout-upgrade.js and
  // transak-checkout.js. Product presentation code must not attach a payment
  // handler or call a payment-provider endpoint.
});
