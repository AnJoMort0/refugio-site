import { SITE_CONFIG, buildWhatsAppUrl } from '../config/site-config.js';

const NAV_ITEMS = [
  { key: 'accommodation', href: './alojamento.html', labelKey: 'nav.accommodation' },
  { key: 'gallery', href: './galeria.html', labelKey: 'nav.gallery' },
  { key: 'booking', href: './reservas.html', labelKey: 'nav.booking' },
  { key: 'contact', href: './contacto.html', labelKey: 'nav.contact' },
  { key: 'guide', href: './guia-local.html', labelKey: 'nav.guide' }
];
function icon(name) {
  const icons = {
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
    menu: '<path d="M4 12h16"></path><path d="M4 6h16"></path><path d="M4 18h16"></path>',
    chevronDown: '<path d="m6 9 6 6 6-6"></path>',
    external: '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>',
    mapPin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z"></path>'
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
              <span class="language-menu-current-code" aria-hidden="true"></span>
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
        <div class="footer-identity">
          <a class="footer-logo" href="./index.html">${SITE_CONFIG.property.name}</a>
          <a class="footer-address" href="${SITE_CONFIG.property.mapsUrl}" data-site-link="maps" target="_blank" rel="noopener">
            ${icon('mapPin')}
            <span data-site-value="address">${SITE_CONFIG.property.address}</span>
          </a>
        </div>
        <div class="footer-contact" aria-labelledby="footer-contact-title">
          <p class="footer-heading" id="footer-contact-title" data-i18n="footer.contactTitle"></p>
          <a href="mailto:${SITE_CONFIG.contact.email}" data-site-link="email">${icon('mail')}<span data-site-value="email">${SITE_CONFIG.contact.email}</span></a>
          <a href="tel:${SITE_CONFIG.contact.phoneHref}" data-site-link="phone">${icon('phone')}<span data-site-value="phone">${SITE_CONFIG.contact.phoneDisplay}</span></a>
        </div>
        <div class="footer-links" aria-labelledby="footer-follow-title">
          <p class="footer-heading" id="footer-follow-title" data-i18n="footer.followTitle"></p>
          <div class="footer-social-links">
            <a href="${SITE_CONFIG.social.facebook}" data-site-link="facebook" target="_blank" rel="noopener"><span data-i18n="footer.facebook"></span>${icon('external')}</a>
            <a href="${SITE_CONFIG.social.instagram}" data-site-link="instagram" target="_blank" rel="noopener"><span data-i18n="footer.instagram"></span>${icon('external')}</a>
          </div>
          <a href="${SITE_CONFIG.property.reviewUrl}" data-site-link="review" target="_blank" rel="noopener"><span data-i18n="footer.googleReview"></span>${icon('external')}</a>
        </div>
        <div class="footer-meta">
          <p data-i18n="footer.copyright"></p>
          <a class="footer-creator" href="${SITE_CONFIG.creator.url}" data-site-link="creator" target="_blank" rel="noopener" data-i18n="footer.creator"></a>
        </div>
      </div>
    </footer>
  `;
}

function buildStickyActions(activePage) {
  return `
    <div class="floating-site-actions">
      <a
        class="floating-whatsapp-cta"
        href="${buildWhatsAppUrl()}"
        data-site-whatsapp
        target="_blank"
        rel="noopener"
        data-i18n-attr='{"aria-label":"footer.whatsappLabel","title":"footer.whatsappLabel"}'
      ><img class="floating-whatsapp-icon" src="./assets/icons/Digital_Glyph_White_RGB_2026.svg" alt="" aria-hidden="true" /></a>
      ${activePage === 'booking' ? '' : `
        <a class="sticky-booking-cta" href="./reservas.html">
          <span data-i18n="stickyBookingCta"></span>
          <span class="sticky-booking-sale" data-promotion-sale-badge data-i18n="promotion.saleBadge" hidden></span>
        </a>
      `}
    </div>
  `;
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
    stickyTarget.outerHTML = buildStickyActions(activePage);
  }
}
