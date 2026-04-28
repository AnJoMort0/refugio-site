const NAV_ITEMS = [
  { key: 'accommodation', href: './alojamento.html', labelKey: 'nav.accommodation' },
  { key: 'gallery', href: './galeria.html', labelKey: 'nav.gallery' },
  { key: 'booking', href: './reservas.html', labelKey: 'nav.booking' },
  { key: 'contact', href: './contacto.html', labelKey: 'nav.contact' },
  { key: 'guide', href: './guia-local.html', labelKey: 'nav.guide' }
];

function buildHeader(activePage) {
  const navLinks = NAV_ITEMS.map(({ key, href, labelKey }) => {
    const isActive = activePage === key ? ' class="is-active"' : '';
    return `<a${isActive} href="${href}" data-i18n="${labelKey}">${getPortugueseLabel(labelKey)}</a>`;
  }).join('');

  return `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="./index.html" data-i18n="brand.name">Refúgio</a>

        <div class="header-actions">
          <a class="header-contact" href="./contacto.html">
            <span class="header-contact-icon" aria-hidden="true">✉</span>
            <span class="header-contact-label" data-i18n="nav.contact">Contacto</span>
          </a>

          <label class="sr-only" for="language-menu-button" data-i18n="languageSwitcher.label">Escolher idioma</label>
          <div class="language-menu" data-language-menu>
            <button
              id="language-menu-button"
              class="language-menu-button"
              type="button"
              aria-label="Escolher idioma"
              aria-haspopup="listbox"
              aria-expanded="false"
              data-i18n-attr='{"aria-label":"languageSwitcher.label"}'
            >
              <span class="language-menu-current">Português</span>
              <span class="language-menu-caret" aria-hidden="true"></span>
            </button>
            <div class="language-menu-popover" role="listbox" aria-label="Escolher idioma">
              <button class="language-menu-option" type="button" data-language-option="pt">Português</button>
              <button class="language-menu-option" type="button" data-language-option="en">English</button>
              <button class="language-menu-option" type="button" data-language-option="fr">Français</button>
              <button class="language-menu-option" type="button" data-language-option="es">Español</button>
            </div>
          </div>

          <button
            class="nav-toggle"
            type="button"
            aria-label="Abrir menu"
            aria-expanded="false"
            aria-controls="site-nav"
            data-i18n-attr='{"aria-label":"nav.toggleLabel"}'
          >
            <span class="sr-only" data-i18n="nav.toggleText">Abrir menu</span>
            ☰
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
        <p data-i18n="footer.copyright">© Refúgio — Família Rodrigues</p>
        <div class="footer-links">
          <a href="./contacto.html" data-i18n="nav.contact">Contacto</a>
          <a href="./admin.html" data-i18n="footer.admin">Área de gestão</a>
        </div>
      </div>
    </footer>
  `;
}

function buildStickyBookingCta() {
  return `<a class="sticky-booking-cta" href="./reservas.html" data-i18n="stickyBookingCta">Reservar</a>`;
}

function getPortugueseLabel(key) {
  const labels = {
    'nav.accommodation': 'Alojamento',
    'nav.gallery': 'Galeria',
    'nav.booking': 'Reservas',
    'nav.contact': 'Contacto',
    'nav.guide': 'Guia Local'
  };

  return labels[key] || '';
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
