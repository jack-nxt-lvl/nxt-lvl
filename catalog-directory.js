(function () {
  'use strict';
  const search = document.getElementById('directorySearch');
  const count = document.getElementById('directoryCount');
  const empty = document.getElementById('directoryEmpty');
  if (!search || !count || !empty) return;
  const cards = Array.from(document.querySelectorAll('.directory-card'));
  const normalize = value => String(value).normalize('NFKD').replace(/[^a-z0-9]+/gi, '').toLowerCase();
  const indexed = cards.map(card => ({card, text:normalize(card.dataset.search)}));
  function filter() {
    const query = normalize(search.value);
    let shown = 0;
    indexed.forEach(({card,text}) => {
      card.hidden = !text.includes(query);
      if (!card.hidden) shown++;
    });
    count.textContent = shown + (shown === 1 ? ' material' : ' materials') + (query ? ' found' : '');
    empty.hidden = shown !== 0;
  }
  search.closest('.directory-search').hidden = false;
  search.addEventListener('input', filter);
  search.addEventListener('keydown', event => { if (event.key === 'Escape') { search.value = ''; filter(); } });
  window.addEventListener('pageshow', filter);
  filter();
})();
