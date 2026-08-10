export function initAccommodationPage() {
  const page = document.body.querySelector('.accommodation-hero');
  if (!page) return;

  const revealTargets = document.querySelectorAll(
    'main > .section, .highlight-card, .amenity-group, .info-card, .mini-gallery-grid img'
  );
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealTargets.forEach((target) => {
    target.classList.add('reveal-on-scroll');
    observer.observe(target);
  });
}
