export function initHomePage() {
  const isHome = document.body.querySelector('.hero');
  if (!isHome) return;

  const revealTargets = document.querySelectorAll('main > .section, .sponsor-card');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16 });

    revealTargets.forEach((target) => {
      target.classList.add('reveal-on-scroll');
      observer.observe(target);
    });
  }

  document.addEventListener('language:changed', (event) => {
    console.log(`Homepage prototype loaded in ${event.detail.language}. Replace placeholder copy and image filenames before next step.`);
  });
}
