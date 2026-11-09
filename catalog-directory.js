(function () {
  'use strict';
  const search = document.getElementById('directorySearch');
  const count = document.getElementById('directoryCount');
  const clear = document.getElementById('directoryClear');
  const empty = document.getElementById('directoryEmpty');
  if (!search || !count || !clear || !empty || !window.NxtCatalogMatcher) return;

  const { indexText, matchesTerms } = window.NxtCatalogMatcher;
  const cards = Array.from(document.querySelectorAll('.directory-card'), card => ({
    card, words: indexText(card.dataset.search)
  }));

  function filter() {
    const query = search.value.trim();
    let shown = 0;
    for (const {card, words} of cards) {
      card.hidden = !matchesTerms(words, query);
      if (!card.hidden) shown++;
    }
    count.textContent = shown + (shown === 1 ? ' product' : ' products') + (query ? ' found' : '');
    clear.hidden = !query;
    empty.hidden = shown !== 0;
  }

  function reset() {
    search.value = '';
    filter();
    search.focus();
  }

  search.closest('.directory-search').hidden = false;
  search.addEventListener('input', filter);
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape') reset();
  });
  clear.addEventListener('click', reset);
  window.addEventListener('pageshow', filter);
  filter();
})();
