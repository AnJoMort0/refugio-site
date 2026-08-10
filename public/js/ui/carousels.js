const DEFAULT_LANGUAGE = 'pt';
const SUPPORTED_LANGUAGES = ['pt', 'en', 'fr', 'es'];

function getNestedValue(object, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object);
}

function mergeDictionaries(baseDictionary, overrideDictionary) {
  if (!baseDictionary || typeof baseDictionary !== 'object') return overrideDictionary;
  if (!overrideDictionary || typeof overrideDictionary !== 'object') return baseDictionary;

  const mergedDictionary = { ...baseDictionary };

  Object.entries(overrideDictionary).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      baseDictionary[key] &&
      typeof baseDictionary[key] === 'object' &&
      !Array.isArray(baseDictionary[key])
    ) {
      mergedDictionary[key] = mergeDictionaries(baseDictionary[key], value);
      return;
    }

    mergedDictionary[key] = value;
  });

  return mergedDictionary;
}

async function loadLocale(language) {
  const safeLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
  const response = await fetch(`./locales/${safeLanguage}.json`);

  if (!response.ok) throw new Error(`Could not load locale file for ${safeLanguage}`);
  return response.json();
}

async function loadResolvedDictionary() {
  const selectedLanguage = (localStorage.getItem('refugio-language') || document.documentElement.lang || DEFAULT_LANGUAGE)
    .slice(0, 2)
    .toLowerCase();
  const safeLanguage = SUPPORTED_LANGUAGES.includes(selectedLanguage) ? selectedLanguage : DEFAULT_LANGUAGE;
  const fallbackDictionary = await loadLocale(DEFAULT_LANGUAGE);

  if (safeLanguage === DEFAULT_LANGUAGE) return fallbackDictionary;

  return mergeDictionaries(fallbackDictionary, await loadLocale(safeLanguage));
}

function getText(dictionary, path) {
  return getNestedValue(dictionary, path) || '';
}

function updateCarouselControlLabels(dictionary) {
  document.querySelectorAll('.carousel-edge-control-prev').forEach((button) => {
    button.setAttribute('aria-label', getText(dictionary, 'carousel.previous'));
  });

  document.querySelectorAll('.carousel-edge-control-next').forEach((button) => {
    button.setAttribute('aria-label', getText(dictionary, 'carousel.next'));
  });
}

function ensureCarouselShell(carousel) {
  if (carousel.parentElement?.classList.contains('carousel-shell')) {
    return carousel.parentElement;
  }

  const shell = document.createElement('div');
  shell.className = 'carousel-shell';
  carousel.parentNode?.insertBefore(shell, carousel);
  shell.append(carousel);
  return shell;
}

function createCarouselButton(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `carousel-edge-control carousel-edge-control-${direction}`;
  button.textContent = direction === 'prev' ? '<' : '>';
  button.setAttribute('aria-label', label);
  return button;
}

export function initCarousels() {
  loadResolvedDictionary()
    .then(updateCarouselControlLabels)
    .catch(() => {});

  document.addEventListener('language:changed', (event) => {
    updateCarouselControlLabels(event.detail?.dictionary || {});
  });

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const initialCards = Array.from(carousel.children);
    const shell = ensureCarouselShell(carousel);
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

    const scrollToAdjacentItem = (direction) => {
      pauseForManualScroll();

      const cards = Array.from(carousel.children);
      if (!cards.length) return;

      const currentCard = getClosestCard(cards);
      const currentIndex = cards.indexOf(currentCard);
      const targetCard = cards[currentIndex + direction];

      centerCard(targetCard || cards[direction > 0 ? 0 : cards.length - 1]);
    };

    const startAutoScroll = () => {
      window.clearInterval(autoScrollTimer);
      autoScrollTimer = window.setInterval(scrollToNextItem, intervalMs);
    };

    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((eventName) => {
      carousel.addEventListener(eventName, pauseForManualScroll, { passive: true });
    });

    if (initialCards.length > 1 && !shell.querySelector('.carousel-edge-control')) {
      const previousButton = createCarouselButton('prev', '');
      const nextButton = createCarouselButton('next', '');

      previousButton.addEventListener('click', (event) => {
        scrollToAdjacentItem(-1);
        if (event.detail > 0) previousButton.blur();
      });
      nextButton.addEventListener('click', (event) => {
        scrollToAdjacentItem(1);
        if (event.detail > 0) nextButton.blur();
      });
      shell.append(previousButton, nextButton);
    }

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
