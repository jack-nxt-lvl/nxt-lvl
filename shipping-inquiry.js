(() => {
  const form = document.getElementById('shipping-inquiry');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const field = form.elements.destination;
    const cityOrZip = field.value.trim();
    if (!cityOrZip) {
      field.value = '';
      field.reportValidity();
      return;
    }
    const destination = cityOrZip + ', ' + form.elements.state.value;
    const body = 'Hello NXT LVL Research,\n\nPlease confirm the shipping options and expected dispatch date for ' + destination + '.';
    window.location.href = 'mailto:payment@nxtlvl-research.com?subject=U.S.%20shipping%20inquiry&body=' + encodeURIComponent(body);
  });
  form.hidden = false;
})();
