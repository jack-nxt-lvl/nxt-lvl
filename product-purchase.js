(function () {
  'use strict';
  const select = document.getElementById('productPack');
  const total = document.getElementById('packTotal');
  const unit = document.getElementById('packUnit');
  if (!select || !total || !unit) return;
  const form = select.closest('form');
  const button = form.querySelector('button[type="submit"]');
  const feedback = document.getElementById('packFulfillment');
  const requested = new URLSearchParams(window.location.search).get('qty');
  if (/^(?:[1-9]|10)$/.test(requested || '')) select.value = requested;
  function update() {
    const option = select.options[select.selectedIndex];
    const cents = Number(option.dataset.cents);
    const quantity = Number(option.value);
    if (!Number.isSafeInteger(cents) || cents <= 0 || !Number.isInteger(quantity) || quantity < 1) return;
    total.textContent = '$' + (cents / 100).toFixed(2);
    unit.textContent = '$' + (cents / 100 / quantity).toFixed(2) + ' per vial · ' + quantity + (quantity === 1 ? ' vial' : ' vials');
    if (feedback) feedback.textContent = Number(option.dataset.shipping) === 0
      ? 'This pack qualifies for free standard U.S. shipping.'
      : 'Standard U.S. shipping: $12. Free on cart subtotals over $200 after discounts.';
  }
  if (window.NxtCartStorage) {
    button.textContent = 'Add to cart →';
    form.addEventListener('submit', event => {
      if (button.disabled) { event.preventDefault(); return; }
      const id = form.querySelector('[name="product"]').value;
      const quantity = Number(select.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return;
      try {
        window.NxtCartStorage.add(window.localStorage, id, quantity - 1);
      } catch (_) {
        // Native GET fallback retains the selected product/pack for review.
        return;
      }
      event.preventDefault();
      button.disabled = true;
      button.textContent = 'Opening your cart…';
      window.location.assign('/?cart=review');
    });
    window.addEventListener('pageshow', () => { button.disabled = false; button.textContent = 'Add to cart →'; });
  }
  select.addEventListener('change', update);
  // Browsers can restore a previous native selection when returning to the page.
  window.addEventListener('pageshow', update);
  update();
})();
