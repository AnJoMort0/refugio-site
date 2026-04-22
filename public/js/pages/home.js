export function initHomePage() {
  const isHome = document.body.querySelector('.hero');
  if (!isHome) return;

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    let autoScrollTimer;
    let pausedUntilPageMoves = false;
    let pauseScrollY = window.scrollY;

    const pauseForManualScroll = () => {
      pausedUntilPageMoves = true;
      pauseScrollY = window.scrollY;
      window.clearInterval(autoScrollTimer);
    };

    const scrollToNextItem = () => {
      if (pausedUntilPageMoves) return;

      const cards = Array.from(carousel.children);
      if (!cards.length) return;

      const carouselRect = carousel.getBoundingClientRect();
      const carouselCenter = carouselRect.left + (carouselRect.width / 2);
      const currentIndex = cards.reduce((closestIndex, card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + (cardRect.width / 2);
        const closestRect = cards[closestIndex].getBoundingClientRect();
        const closestCenter = closestRect.left + (closestRect.width / 2);

        return Math.abs(cardCenter - carouselCenter) < Math.abs(closestCenter - carouselCenter)
          ? index
          : closestIndex;
      }, 0);
      const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
      const nextCardRect = cards[nextIndex].getBoundingClientRect();
      const targetLeft = carousel.scrollLeft
        + nextCardRect.left
        - carouselRect.left
        - ((carousel.clientWidth - nextCardRect.width) / 2);

      carousel.scrollTo({
        left: targetLeft,
        behavior: 'smooth'
      });
    };

    const startAutoScroll = () => {
      window.clearInterval(autoScrollTimer);
      autoScrollTimer = window.setInterval(scrollToNextItem, 7000);
    };

    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((eventName) => {
      carousel.addEventListener(eventName, pauseForManualScroll, { passive: true });
    });

    window.addEventListener('scroll', () => {
      if (!pausedUntilPageMoves || Math.abs(window.scrollY - pauseScrollY) < 24) return;

      pausedUntilPageMoves = false;
      startAutoScroll();
    }, { passive: true });

    startAutoScroll();
  });

  document.addEventListener('language:changed', (event) => {
    console.log(`Homepage prototype loaded in ${event.detail.language}. Replace placeholder copy and image filenames before next step.`);
  });
}
