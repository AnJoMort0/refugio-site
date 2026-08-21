import { initScrollReveal } from '../ui/scroll-reveal.js';

export function initHomePage() {
  const isHome = document.body.querySelector('.hero');
  if (!isHome) return;

  initScrollReveal('main > .section, .sponsor-card', 0.16);
}
