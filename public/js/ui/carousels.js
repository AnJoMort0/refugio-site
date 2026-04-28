export function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const initialCards = Array.from(carousel.children);
    const getCloneCount = () => {
      const firstCard = initialCards[0];
      if (!firstCard) return 0;

      const cardWidth = firstCard.getBoundingClientRect().width || 1;
      return Math.max(1, Math.ceil(carousel.clientWidth / cardWidth));
    };

    if (initialCards.length > 1) {
      const cloneCount = Math.min(initialCards.length, getCloneCount());
      const prependFragment = document.createDocumentFragment();
      const appendFragment = document.createDocumentFragment();

      initialCards.slice(-cloneCount).forEach((card, index) => {
        const clone = card.cloneNode(true);
        clone.dataset.carouselCloneOf = String(initialCards.length - cloneCount + index);
        prependFragment.append(clone);
      });

      initialCards.slice(0, cloneCount).forEach((card, index) => {
        const clone = card.cloneNode(true);
        clone.dataset.carouselCloneOf = String(index);
        appendFragment.append(clone);
      });

      carousel.prepend(prependFragment);
      carousel.append(appendFragment);
    }

    let autoScrollTimer;
    let pausedUntilPageMoves = false;
    let pauseScrollY = window.scrollY;
    const intervalMs = Number(carousel.dataset.carouselInterval || 7000);

    const getRealCards = () => Array.from(carousel.children).filter((card) => !card.dataset.carouselCloneOf);

    const getClosestCard = (cards) => {
      const carouselRect = carousel.getBoundingClientRect();
      const carouselCenter = carouselRect.left + (carouselRect.width / 2);

      return cards.reduce((closestCard, card) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + (cardRect.width / 2);
        const closestRect = closestCard.getBoundingClientRect();
        const closestCenter = closestRect.left + (closestRect.width / 2);

        return Math.abs(cardCenter - carouselCenter) < Math.abs(closestCenter - carouselCenter)
          ? card
          : closestCard;
      }, cards[0]);
    };

    const centerCard = (card, behavior = 'smooth') => {
      if (!card) return;

      const carouselRect = carousel.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const targetLeft = carousel.scrollLeft
        + cardRect.left
        - carouselRect.left
        - ((carousel.clientWidth - cardRect.width) / 2);

      carousel.scrollTo({
        left: targetLeft,
        behavior
      });
    };

    const correctInfiniteLoopPosition = () => {
      const cards = Array.from(carousel.children);
      if (cards.length <= 2) return;

      const closestCard = getClosestCard(cards);
      const cloneIndex = closestCard.dataset.carouselCloneOf;
      if (cloneIndex === undefined) return;

      const realCards = getRealCards();
      centerCard(realCards[Number(cloneIndex)], 'auto');
    };

    const pauseForManualScroll = () => {
      pausedUntilPageMoves = true;
      pauseScrollY = window.scrollY;
      window.clearInterval(autoScrollTimer);
    };

    const scrollToNextItem = () => {
      if (pausedUntilPageMoves) return;

      const cards = getRealCards();
      if (!cards.length) return;

      const currentCard = getClosestCard(cards);
      const currentIndex = cards.indexOf(currentCard);
      const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
      const loopClone = carousel.querySelector('[data-carousel-clone-of="0"]');
      centerCard(currentIndex === cards.length - 1 && loopClone ? loopClone : cards[nextIndex]);
    };

    const startAutoScroll = () => {
      window.clearInterval(autoScrollTimer);
      autoScrollTimer = window.setInterval(scrollToNextItem, intervalMs);
    };

    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((eventName) => {
      carousel.addEventListener(eventName, pauseForManualScroll, { passive: true });
    });

    window.addEventListener('scroll', () => {
      if (!pausedUntilPageMoves || Math.abs(window.scrollY - pauseScrollY) < 24) return;

      pausedUntilPageMoves = false;
      startAutoScroll();
    }, { passive: true });

    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(correctInfiniteLoopPosition, 130);
    }, { passive: true });

    requestAnimationFrame(() => {
      centerCard(getRealCards()[0], 'auto');
    });

    startAutoScroll();
  });
}
