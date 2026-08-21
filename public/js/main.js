import { renderSiteShell } from './ui/site-shell.js';
import { initI18n } from './services/i18n.js';
import { initMobileNav } from './ui/mobile-nav.js';

const PAGE_INITIALIZERS = {
  accommodation: () => import('./pages/accommodation.js').then(({ initAccommodationPage }) => initAccommodationPage()),
  booking: () => import('./pages/booking.js').then(({ initBookingPage }) => initBookingPage()),
  'booking-sent': () => import('./pages/booking-sent.js').then(({ initBookingSentPage }) => initBookingSentPage()),
  contact: () => import('./pages/contact.js').then(({ initContactPage }) => initContactPage()),
  gallery: () => import('./pages/gallery.js').then(({ initGalleryPage }) => initGalleryPage()),
  home: () => import('./pages/home.js').then(({ initHomePage }) => initHomePage())
};

renderSiteShell();
await initI18n();
initMobileNav();

const pageTasks = [];
const pageInitializer = PAGE_INITIALIZERS[document.body.dataset.page || ''];

if (document.querySelector('[data-carousel]')) {
  pageTasks.push(import('./ui/carousels.js').then(({ initCarousels }) => initCarousels()));
}

if (pageInitializer) {
  pageTasks.push(pageInitializer());
}

await Promise.all(pageTasks);
