(() => {
  const form = document.getElementById('coa-inquiry');
  if (!form) return;

  function inquirySource() {
    const via = new URLSearchParams(window.location.search).get('via');
    if (via === 'worksheet') return 'Worksheet PDF';
    if (via === 'lab-share') return 'Shared worksheet link';
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host === window.location.hostname) return 'NXT LVL website';
      if (host === 'www.google.com' || host === 'google.com') return 'Google search';
      if (host === 'www.bing.com' || host === 'bing.com') return 'Bing search';
    }
    return 'Guide visit';
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = form.elements;
    for (const field of [fields.organization, fields.material]) {
      if (!field.value.trim()) {
        field.value = '';
        field.reportValidity();
        return;
      }
    }
    const source = inquirySource();
    const lines = [
      'Hello NXT LVL Research,', '',
      'I am requesting: ' + fields.request.value + '.',
      'Laboratory or organization: ' + fields.organization.value.trim(),
      'Material and labeled amount: ' + fields.material.value.trim()
    ];
    if (fields.lot.value.trim()) lines.push('Lot or report: ' + fields.lot.value.trim());
    if (fields.quantity.value.trim()) lines.push('Requested quantity: ' + fields.quantity.value.trim());
    lines.push('', 'Inquiry source: ' + source);
    const subject = 'COA worksheet inquiry | ' + fields.request.value;
    window.location.href = 'mailto:payment@nxtlvl-research.com?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(lines.join('\r\n'));
  });
  form.hidden = false;
})();
