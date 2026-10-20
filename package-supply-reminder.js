// Optional, separately priced laboratory supply. Never preselected or auto-added.
(() => {
  'use strict';
  const WATER_ID = 'bac-water-10ml';

  function render(items, materials) {
    document.getElementById('packageSupplyReminder')?.remove();
    const hasPackage = items.some(item => Number(item.qty) > 0 &&
      materials.some(product => product.id === item.productId && product.category === 'research-packages'));
    if (!hasPackage) return;
    const product = materials.find(item => item.id === WATER_ID);
    const optionIndex = product?.pricing?.findIndex(option => /^1 Vial\b/i.test(option.label));
    const option = optionIndex >= 0 ? product.pricing[optionIndex] : null;
    if (!option || !Number.isFinite(option.price) || option.price <= 0) return;
    const container = document.getElementById('cartItems');
    if (!container) return;

    const alreadyAdded = items.some(item => item.productId === WATER_ID && Number(item.qty) > 0);
    const box = document.createElement('aside');
    box.id = 'packageSupplyReminder';
    box.className = 'package-supply-reminder';
    box.setAttribute('aria-label', 'Optional laboratory supply');
    if (alreadyAdded) {
      box.innerHTML = '<p id="packageSupplyStatus" role="status" tabindex="-1"><strong>10mL bacteriostatic water is in your cart.</strong> Review its quantity in the item above.</p>';
    } else {
      box.innerHTML = `<p class="package-supply-label">Optional · sold separately</p>
        <h4>Need 10mL bacteriostatic water?</h4>
        <p>It is not included in your research package. Add only if your laboratory requires it.</p>
        <button type="button" id="addPackageWater">Add 1 × 10mL vial · $${option.price.toFixed(2)}</button>
        <p class="package-supply-note">Package savings apply to the package only. Review suitability and lot documentation separately.</p>`;
    }
    const details = document.createElement('a');
    details.href = '/research/bacteriostatic-water-10ml.html';
    details.textContent = 'Water details & documentation ↗';
    box.appendChild(details);
    container.appendChild(box);

    box.querySelector('button')?.addEventListener('click', () => {
      // Read the current cart again so an old button cannot add a duplicate.
      if (typeof cart === 'undefined' || typeof addLineToCart !== 'function') return;
      if (cart.some(item => item.productId === WATER_ID && Number(item.qty) > 0)) return;
      addLineToCart(product, optionIndex, 1);
      document.getElementById('packageSupplyStatus')?.focus({ preventScroll: true });
    });
  }

  window.NxtPackageSupplyReminder = Object.freeze({ render });
  if (typeof cart !== 'undefined' && typeof compounds !== 'undefined') render(cart, compounds);
})();
