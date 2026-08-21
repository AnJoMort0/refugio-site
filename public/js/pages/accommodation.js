import { initScrollReveal } from '../ui/scroll-reveal.js';

export function initAccommodationPage() {
  const page = document.body.querySelector('.accommodation-hero');
  if (!page) return;

  initScrollReveal(
    'main > .section, .highlight-card, .amenity-group, .info-card, .mini-gallery-grid img',
    0.14
  );
}
