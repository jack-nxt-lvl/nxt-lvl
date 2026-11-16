(function () {
  'use strict';
  const dialog = document.getElementById('nxt-entry');
  if (!dialog) return;
  const form = dialog.querySelector('form');
  const button = form.querySelector('button');
  const error = form.querySelector('.nxt-entry-error');
  const denied = document.getElementById('nxt-entry-denied');
  let saving = false;
  function update() {
    denied.hidden = form.elements.age.value !== 'no';
    button.disabled = saving || form.elements.age.value !== 'yes' || !form.elements.research.checked;
  }
  function open() {
    if (typeof dialog.showModal === 'function') {
      if (dialog.open) dialog.close();
      dialog.showModal();
    } else dialog.setAttribute('open', '');
  }
  function accepted() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    window.dispatchEvent(new Event('nxt:entry-ready'));
  }
  async function checkSession() {
    try {
      const response = await fetch('/api/visitor-entry', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
      if (response.ok && (await response.json()).accepted === true) accepted();
      else if (!dialog.open) open();
    } catch (_) { /* Keep confirmation available if the session check is unavailable. */ }
  }
  dialog.addEventListener('cancel', event => event.preventDefault());
  form.elements.returnTo.value = location.pathname + location.search + location.hash;
  form.addEventListener('change', update);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (saving || form.elements.age.value !== 'yes' || !form.elements.research.checked) return;
    saving = true; error.hidden = true; update(); button.textContent = 'Confirming…';
    try {
      const response = await fetch('/api/visitor-entry', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ age: 'yes', research: 'yes' })
      });
      if (!response.ok || (await response.json()).accepted !== true) throw new Error('Entry not confirmed');
      accepted();
    } catch (_) {
      error.textContent = 'We could not save your confirmation. Please try again.';
      error.hidden = false;
    } finally { saving = false; button.textContent = 'Enter site'; update(); }
  });
  open(); update(); checkSession();
  window.addEventListener('pageshow', event => { if (event.persisted) checkSession(); });
})();
