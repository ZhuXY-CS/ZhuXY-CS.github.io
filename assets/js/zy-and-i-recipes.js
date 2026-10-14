(() => {
  const cards = [...document.querySelectorAll('.recipe-card')];
  const tabs = [...document.querySelectorAll('.recipe-tabs [role="tab"]')];
  const thumbnails = [...document.querySelectorAll('.recipe-thumbnail')];
  const strip = document.querySelector('.recipe-thumbnails');
  if (!cards.length) return;
  let selected = [], index = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const day = new Date();
  const seed = Number(`${day.getFullYear()}${String(day.getMonth() + 1).padStart(2, '0')}${String(day.getDate()).padStart(2, '0')}`);
  // A local calendar date gives both of us the same recommendations all day.
  const featured = cards.find(card => card.id === 'sweet-sour-meatballs');
  const others = cards.filter(card => card !== featured);
  const start = seed % others.length;
  const daily = [featured, others[start], others[(start + 1) % others.length]].filter(Boolean);
  function show(nextIndex, updateHash = true) {
    index = (nextIndex + selected.length) % selected.length;
    const active = selected[index];
    cards.forEach(card => { card.hidden = card !== active; });
    thumbnails.forEach(button => {
      const current = button.dataset.recipe === active.id;
      button.setAttribute('aria-current', current ? 'true' : 'false');
    });
    document.querySelector('#recipe-position').textContent = `${index + 1} / ${selected.length}`;
    const thumb = thumbnails.find(button => button.dataset.recipe === active.id);
    if (thumb) strip.scrollTo({left: thumb.offsetLeft - strip.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: reduced ? 'auto' : 'smooth'});
    if (updateHash) history.replaceState(null, '', `#${active.id}`);
    const body = active.querySelector('.recipe-card__body');
    body.scrollTop = 0;
  }
  function selectMode(mode, wantedId) {
    selected = mode === 'daily' ? daily : cards.filter(card => card.dataset.group === mode);
    tabs.forEach(tab => {
      const active = tab.dataset.mode === mode;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    document.querySelector('#recipe-viewer').setAttribute('aria-labelledby', `tab-${mode}`);
    const found = selected.findIndex(card => card.id === wantedId);
    show(found < 0 ? 0 : found);
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectMode(tab.dataset.mode));
    tab.addEventListener('keydown', event => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus(); selectMode(tabs[next].dataset.mode);
    });
  });
  document.querySelector('#recipe-prev').addEventListener('click', () => show(index - 1));
  document.querySelector('#recipe-next').addEventListener('click', () => show(index + 1));
  thumbnails.forEach(button => button.addEventListener('click', () => {
    const found = selected.findIndex(card => card.id === button.dataset.recipe);
    if (found >= 0) show(found);
    else { const card = cards.find(card => card.id === button.dataset.recipe); selectMode(card.dataset.group, card.id); }
  }));
  for (const [id, direction] of [['preview-prev', -1], ['preview-next', 1]]) {
    document.getElementById(id).addEventListener('click', () => strip.scrollBy({left: direction * strip.clientWidth * .75, behavior: reduced ? 'auto' : 'smooth'}));
  }
  function fromHash() {
    const target = cards.find(card => `#${card.id}` === location.hash);
    selectMode(target ? target.dataset.group : 'daily', target?.id);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
