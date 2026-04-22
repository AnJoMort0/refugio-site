export function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}
