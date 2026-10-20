(function () {
  'use strict';
  const select = document.getElementById('productPack');
  const total = document.getElementById('packTotal');
  const unit = document.getElementById('packUnit');
  if (!select || !total || !unit) return;
  function update() {
    const option = select.options[select.selectedIndex];
    const cents = Number(option.dataset.cents);
    const quantity = Number(option.value);
    if (!Number.isSafeInteger(cents) || cents <= 0 || !Number.isInteger(quantity) || quantity < 1) return;
    total.textContent = '$' + (cents / 100).toFixed(2);
    unit.textContent = '$' + (cents / 100 / quantity).toFixed(2) + ' per vial · ' + quantity + (quantity === 1 ? ' vial' : ' vials');
  }
  select.addEventListener('change', update);
  // Browsers can restore a previous native selection when returning to the page.
  window.addEventListener('pageshow', update);
  update();
})();
