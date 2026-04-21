export function initHomePage() {
  const isHome = document.body.querySelector('.hero');
  if (!isHome) return;

  document.addEventListener('language:changed', (event) => {
    console.log(`Homepage prototype loaded in ${event.detail.language}. Replace placeholder copy and image filenames before next step.`);
  });
}
