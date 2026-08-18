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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeDuplicateOrderLink, { once: true });
  } else {
    removeDuplicateOrderLink();
  }
})();
