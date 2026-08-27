import { renderSiteShell } from './ui/site-shell.js';
import { getCurrentDictionary, initI18n } from './services/i18n.js';
import { initMobileNav } from './ui/mobile-nav.js';
import { applySiteConfig } from './config/site-config.js';

const PAGE_INITIALIZERS = {
  accommodation: () => import('./pages/accommodation.js').then(({ initAccommodationPage }) => initAccommodationPage()),
  booking: () => import('./pages/booking.js').then(({ initBookingPage }) => initBookingPage()),
  'booking-sent': () => import('./pages/booking-sent.js').then(({ initBookingSentPage }) => initBookingSentPage()),
  contact: () => import('./pages/contact.js').then(({ initContactPage }) => initContactPage()),
  gallery: () => import('./pages/gallery.js').then(({ initGalleryPage }) => initGalleryPage()),
  guide: () => import('./pages/guide.js').then(({ initGuidePage }) => initGuidePage()),
  'guest-stay': () => import('./pages/qr.js').then(({ initGuestStayPage }) => initGuestStayPage()),
  home: () => import('./pages/home.js').then(({ initHomePage }) => initHomePage())
};

renderSiteShell();
await initI18n();
applySiteConfig(document, getCurrentDictionary());
document.addEventListener('language:changed', ({ detail }) => applySiteConfig(document, detail.dictionary));
initMobileNav();

const pageTasks = [];
const pageInitializer = PAGE_INITIALIZERS[document.body.dataset.page || ''];

if (document.querySelector('[data-carousel]')) {
  pageTasks.push(import('./ui/carousels.js').then(({ initCarousels }) => initCarousels()));
}

if (
  document.body.dataset.page !== 'booking' &&
  document.querySelector('[data-promotion-sale-badge], [data-promotion-announcement]')
) {
  pageTasks.push(
    import('./ui/pricing-promotion.js').then(({ initPricingPromotionUi }) => initPricingPromotionUi())
  );
}

if (pageInitializer) {
  pageTasks.push(pageInitializer());
}

await Promise.all(pageTasks);

const { initCustomSelects } = await import('./ui/custom-selects.js');
initCustomSelects();
