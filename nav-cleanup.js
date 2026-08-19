(() => {
  function removeDuplicateOrderLink() {
    const navLinks = Array.from(document.querySelectorAll('nav ul li a'));
    const duplicate = navLinks.find((link) => {
      const label = (link.textContent || '').trim().toLowerCase();
      return label === 'order' && !link.classList.contains('nav-cta');
    });

    if (duplicate) {
      const item = duplicate.closest('li');
      if (item) item.remove();
      else duplicate.remove();
    }
  }

  function updateCryptoPaymentNotice() {
    const notice = document.querySelector('.crypto-notice');
    if (!notice) return;

    const title = notice.querySelector('.crypto-text strong');
    const copy = notice.querySelector('.crypto-text span');

    if (title) title.textContent = 'Crypto Payments Accepted';
    if (copy) {
      copy.textContent = 'Pay with crypto. If you need to buy crypto first, you may be able to use Apple Pay, Cash App, or a debit card through a supported crypto provider.';
    }
  }

  function applyUpdates() {
    removeDuplicateOrderLink();
    updateCryptoPaymentNotice();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUpdates, { once: true });
  } else {
    applyUpdates();
  }
})();
