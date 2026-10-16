(function (root, factory) {
  const rates = factory();
  if (typeof module === 'object' && module.exports) module.exports = rates;
  else root.NxtFulfillment = rates;
})(typeof window !== 'undefined' ? window : this, function () {
  const VERSION = '2026-10-16-rates';
  const FREE_ABOVE_CENTS = 47500;
  const OPTIONS = Object.freeze({
    shipping: Object.freeze({ label: 'Standard Priority Mail', cents: 1200, note: 'Ships in 1–2 business days after acceptance and payment; transit is additional.' }),
    overnight: Object.freeze({ label: 'Overnight shipping', cents: 3000, note: 'Confirm destination, cutoff and dispatch date before payment.' }),
    pickup: Object.freeze({ label: 'Local pickup', cents: 0, note: 'Free. Appointment and location require confirmation.' }),
    'local-delivery': Object.freeze({ label: 'Same-day local delivery', cents: 2500, note: 'Around 33137 and 33315; coverage and same-day availability require confirmation.' }),
  });
  function normalizeMode(value) {
    const mode = String(value || 'shipping').toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(OPTIONS, mode)) throw new Error('Choose an available fulfillment option.');
    return mode;
  }
  function feeCents(value, subtotalCents) {
    const mode = normalizeMode(value);
    if (!Number.isSafeInteger(subtotalCents) || subtotalCents < 0) throw new Error('Invalid merchandise subtotal.');
    return subtotalCents > FREE_ABOVE_CENTS ? 0 : OPTIONS[mode].cents;
  }
  function label(value) { return OPTIONS[normalizeMode(value)].label; }
  return Object.freeze({ VERSION, FREE_ABOVE_CENTS, OPTIONS, normalizeMode, feeCents, label });
});
