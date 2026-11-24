(() => {
  const profileButton = document.querySelector('.author__links-toggle');
  const profileLinks = document.getElementById('author-links');
  const nav = document.getElementById('site-nav');
  const overflow = document.getElementById('site-nav-overflow');
  if (!profileButton || !profileLinks || !nav || !overflow) return;

  const navButton = nav.querySelector('button');

  const profileIsOpen = () => profileButton.getAttribute('aria-expanded') === 'true';
  const menuIsOpen = () => !overflow.classList.contains('hidden');
  const syncMenuState = () => navButton.setAttribute('aria-expanded', String(menuIsOpen()));

  profileButton.addEventListener('click', () => {
    profileButton.setAttribute('aria-expanded', String(!profileIsOpen()));
  });

  new MutationObserver(syncMenuState).observe(overflow, {
    attributes: true,
    attributeFilter: ['class']
  });
  syncMenuState();

  const homeLink = nav.querySelector('.masthead__menu-item--lg a');
  const sectionLinks = [...nav.querySelectorAll('a[href]')]
    .map(link => ({link, section: document.getElementById(link.hash.slice(1))}))
    .filter(item => item.section);
  let pendingHighlight;
  const updateHighlight = () => {
    const guide = nav.getBoundingClientRect().bottom + 32;
    let selected;
    for (const item of sectionLinks) {
      if (item.section.getBoundingClientRect().top > guide) break;
      selected = item;
    }
    if (selected) homeLink.removeAttribute('aria-current');
    else homeLink.setAttribute('aria-current', 'page');
    sectionLinks.forEach(({link}) => {
      if (link === selected?.link) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    pendingHighlight = undefined;
  };
  const queueHighlight = () => {
    if (pendingHighlight === undefined) pendingHighlight = requestAnimationFrame(updateHighlight);
  };
  addEventListener('scroll', queueHighlight, {passive: true});
  addEventListener('resize', queueHighlight);
  addEventListener('pageshow', queueHighlight);
  queueHighlight();

  nav.addEventListener('click', event => {
    if (menuIsOpen() && event.target.closest('a')) navButton.click();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    if (menuIsOpen()) {
      navButton.click();
      navButton.focus();
    } else if (profileIsOpen() && (
      document.activeElement === profileButton || profileLinks.contains(document.activeElement)
    )) {
      profileButton.click();
      profileButton.focus();
    }
  });
})();
