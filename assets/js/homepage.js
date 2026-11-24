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
