import { renderSiteShell } from './ui/site-shell.js';
import { initI18n } from './services/i18n.js';
import { initMobileNav } from './ui/mobile-nav.js';
import { initCarousels } from './ui/carousels.js';
import { initHomePage } from './pages/home.js';
import { initAccommodationPage } from './pages/accommodation.js';
import { initGalleryPage } from './pages/gallery.js';

renderSiteShell();
await initI18n();
initMobileNav();
initCarousels();
initHomePage();
initAccommodationPage();
await initGalleryPage();
