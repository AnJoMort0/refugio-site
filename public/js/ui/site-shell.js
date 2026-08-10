const NAV_ITEMS = [
  { key: 'accommodation', href: './alojamento.html', labelKey: 'nav.accommodation' },
  { key: 'gallery', href: './galeria.html', labelKey: 'nav.gallery' },
  { key: 'booking', href: './reservas.html', labelKey: 'nav.booking' },
  { key: 'contact', href: './contacto.html', labelKey: 'nav.contact' },
  { key: 'guide', href: './guia-local.html', labelKey: 'nav.guide' }
];
const GOOGLE_REVIEW_URL =
  'https://www.google.com/maps/place/O+Ref%C3%BAgio/@41.0204811,-8.3871842,646m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd24830c21a7821f:0x7babb9259b50311a!8m2!3d41.0204812!4d-8.3823133!16s%2Fg%2F11vqhfvg0k?entry=ttu&g_ep=EgoyMDI2MDQyMC4wIKXMDSoASAFQAw%3D%3D';
const FACEBOOK_URL = 'https://example.com/REFUGIO_FACEBOOK_URL_REPLACE_ME';
const INSTAGRAM_URL = 'https://example.com/REFUGIO_INSTAGRAM_URL_REPLACE_ME';
const CREATOR_URL = 'https://linktr.ee/anjomorto';

function icon(name) {
  const icons = {
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
    menu: '<path d="M4 12h16"></path><path d="M4 6h16"></path><path d="M4 18h16"></path>',
    chevronDown: '<path d="m6 9 6 6 6-6"></path>',
    external: '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>'
  };

  return `<svg class="lucide-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ''}</svg>`;
}

function buildHeader(activePage) {
  const navLinks = NAV_ITEMS.map(({ key, href, labelKey }) => {
    const isActive = activePage === key ? ' class="is-active"' : '';
    return `<a${isActive} href="${href}" data-i18n="${labelKey}"></a>`;
  }).join('');

  return `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="./index.html" data-i18n="brand.name"></a>

        <div class="header-actions">
          <a class="header-contact" href="./contacto.html">
            <span class="header-contact-icon" aria-hidden="true">${icon('mail')}</span>
            <span class="header-contact-label" data-i18n="nav.contact"></span>
          </a>

          <label class="sr-only" for="language-menu-button" data-i18n="languageSwitcher.label"></label>
          <div class="language-menu" data-language-menu>
            <button
              id="language-menu-button"
              class="language-menu-button"
              type="button"
              aria-label=""
              aria-haspopup="listbox"
              aria-expanded="false"
              data-i18n-attr='{"aria-label":"languageSwitcher.label"}'
            >
              <span class="language-menu-current"></span>
              <span class="language-menu-caret" aria-hidden="true">${icon('chevronDown')}</span>
            </button>
            <div class="language-menu-popover" role="listbox" aria-label="" data-i18n-attr='{"aria-label":"languageSwitcher.label"}'>
              <button class="language-menu-option" type="button" data-language-option="pt" data-i18n="languageNames.pt"></button>
              <button class="language-menu-option" type="button" data-language-option="en" data-i18n="languageNames.en"></button>
              <button class="language-menu-option" type="button" data-language-option="fr" data-i18n="languageNames.fr"></button>
              <button class="language-menu-option" type="button" data-language-option="es" data-i18n="languageNames.es"></button>
            </div>
          </div>

          <button
            class="nav-toggle"
            type="button"
            aria-label=""
            aria-expanded="false"
            aria-controls="site-nav"
            data-i18n-attr='{"aria-label":"nav.toggleLabel"}'
          >
            <span class="sr-only" data-i18n="nav.toggleText"></span>
            ${icon('menu')}
          </button>
        </div>

        <nav id="site-nav" class="site-nav">
          ${navLinks}
        </nav>
      </div>
    </header>
  `;
}

function buildFooter() {
  return `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <p data-i18n="footer.copyright"></p>
          <a class="footer-creator" href="${CREATOR_URL}" target="_blank" rel="noopener" data-i18n="footer.creator"></a>
        </div>
        <div class="footer-links">
          <a href="./contacto.html"><span data-i18n="nav.contact"></span></a>
          <a href="${GOOGLE_REVIEW_URL}" target="_blank" rel="noopener"><span data-i18n="footer.googleReview"></span>${icon('external')}</a>
          <a href="${FACEBOOK_URL}" target="_blank" rel="noopener"><span data-i18n="footer.facebook"></span>${icon('external')}</a>
          <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener"><span data-i18n="footer.instagram"></span>${icon('external')}</a>
          <a href="./admin.html"><span data-i18n="footer.admin"></span></a>
        </div>
      </div>
    </footer>
  `;
}

function buildStickyBookingCta() {
  return `<a class="sticky-booking-cta" href="./reservas.html" data-i18n="stickyBookingCta"></a>`;
}

export function renderSiteShell() {
  const activePage = document.body.dataset.page || '';
  const headerTarget = document.querySelector('[data-site-header]');
  const footerTarget = document.querySelector('[data-site-footer]');
  const stickyTarget = document.querySelector('[data-sticky-booking]');

  if (headerTarget) {
    headerTarget.outerHTML = buildHeader(activePage);
  }

  if (footerTarget) {
    footerTarget.outerHTML = buildFooter();
  }

  if (stickyTarget) {
    stickyTarget.outerHTML = buildStickyBookingCta();
  }
}
