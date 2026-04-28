import { initI18n } from './services/i18n.js';
import { initMobileNav } from './ui/mobile-nav.js';
import { initHomePage } from './pages/home.js';
import { initAccommodationPage } from './pages/accommodation.js';

await initI18n();
initMobileNav();
initHomePage();
initAccommodationPage();
