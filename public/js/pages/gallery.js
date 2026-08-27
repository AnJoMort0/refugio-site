function prettifyLabel(label) {
  return label
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getMasonryHeight(item, columnWidth) {
  const image = item.querySelector('img');
  if (!image?.naturalWidth || !image?.naturalHeight) return;

  return Math.round((image.naturalHeight / image.naturalWidth) * columnWidth);
}

export async function initGalleryPage() {
  const grid = document.querySelector('#gallery-grid');
  if (!grid) return;

  const emptyState = document.querySelector('#gallery-empty');
  const lightbox = document.querySelector('#gallery-lightbox');
  const lightboxImage = document.querySelector('#gallery-lightbox-image');
  const lightboxLabel = document.querySelector('#gallery-lightbox-label');
  const lightboxCount = document.querySelector('#gallery-lightbox-count');
  const closeButton = document.querySelector('#lightbox-close');
  const prevButton = document.querySelector('#lightbox-prev');
  const nextButton = document.querySelector('#lightbox-next');
  const zoomInButton = document.querySelector('#lightbox-zoom-in');
  const zoomOutButton = document.querySelector('#lightbox-zoom-out');
  const zoomResetButton = document.querySelector('#lightbox-zoom-reset');
  const lightboxViewport = document.querySelector('.gallery-lightbox-viewport');
  const closeTargets = document.querySelectorAll('[data-lightbox-close]');
  const gap = 16;

  let images = [];
  let activeIndex = 0;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let panStart = null;
  let swipeStart = null;
  let resizeFrame = null;

  const clampPan = () => {
    if (!lightboxImage || !lightboxViewport || zoom <= 1) {
      panX = 0;
      panY = 0;
      return;
    }

    const maxX = Math.max(0, ((lightboxImage.clientWidth * zoom) - lightboxViewport.clientWidth) / 2);
    const maxY = Math.max(0, ((lightboxImage.clientHeight * zoom) - lightboxViewport.clientHeight) / 2);

    panX = Math.min(maxX, Math.max(-maxX, panX));
    panY = Math.min(maxY, Math.max(-maxY, panY));
  };

  const applyLightboxTransform = () => {
    if (!lightboxImage) return;

    lightboxImage.style.setProperty('--lightbox-zoom', String(zoom));
    lightboxImage.style.setProperty('--lightbox-pan-x', `${Math.round(panX)}px`);
    lightboxImage.style.setProperty('--lightbox-pan-y', `${Math.round(panY)}px`);
    lightboxViewport?.classList.toggle('is-zoomed', zoom > 1);
  };

  const setZoom = (value) => {
    zoom = Math.min(4, Math.max(1, Number(value.toFixed(2))));
    clampPan();
    applyLightboxTransform();
    if (zoomResetButton) {
      zoomResetButton.textContent = `${Math.round(zoom * 100)}%`;
    }
  };

  const renderLightbox = () => {
    const image = images[activeIndex];
    if (!image || !lightboxImage || !lightboxLabel || !lightboxCount) return;

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxLabel.textContent = image.label;
    lightboxCount.textContent = `${activeIndex + 1} / ${images.length}`;
    panX = 0;
    panY = 0;
    setZoom(1);
  };

  const openLightbox = (index) => {
    activeIndex = index;
    renderLightbox();
    document.body.classList.add('gallery-lightbox-open');
    lightbox?.removeAttribute('hidden');
  };

  const closeLightbox = () => {
    document.body.classList.remove('gallery-lightbox-open');
    lightbox?.setAttribute('hidden', '');
    if (lightboxImage) {
      lightboxImage.removeAttribute('src');
    }
    lightboxViewport?.classList.remove('is-zoomed', 'is-panning');
  };

  const goTo = (direction) => {
    activeIndex = (activeIndex + direction + images.length) % images.length;
    renderLightbox();
  };

  const layoutMasonry = () => {
    const items = Array.from(grid.children);
    if (!items.length) return;

    const gridWidth = grid.clientWidth;
    const minimumColumnWidth = window.innerWidth < 768 ? 160 : 220;
    const columnCount = Math.max(1, Math.floor((gridWidth + gap) / (minimumColumnWidth + gap)));
    const columnWidth = (gridWidth - gap * (columnCount - 1)) / columnCount;
    const columnHeights = Array.from({ length: columnCount }, () => 0);

    items.forEach((item) => {
      const height = getMasonryHeight(item, columnWidth);
      if (!height) return;

      const targetColumn = columnHeights.indexOf(Math.min(...columnHeights));
      const left = (columnWidth + gap) * targetColumn;
      const top = columnHeights[targetColumn];

      item.style.width = `${columnWidth}px`;
      item.style.height = `${height}px`;
      item.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;

      columnHeights[targetColumn] = top + height + gap;
    });

    const tallestColumn = Math.max(...columnHeights);
    grid.style.height = `${Math.max(tallestColumn - gap, 0)}px`;
    grid.classList.add('is-ready');
  };

  const queueLayout = () => {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = window.requestAnimationFrame(() => {
      layoutMasonry();
      resizeFrame = null;
    });
  };

  const mountImages = () => {
    const fragment = document.createDocumentFragment();

    images.forEach((image, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-tile';
      button.setAttribute('aria-label', image.label);
      button.innerHTML = `
        <span class="gallery-tile-media">
          <img src="${image.src}" alt="${image.alt}" loading="lazy" decoding="async" />
        </span>
      `;
      button.addEventListener('click', () => openLightbox(index));
      fragment.append(button);
    });

    grid.replaceChildren(fragment);

    const items = Array.from(grid.children);
    items.forEach((item) => {
      const image = item.querySelector('img');
      const resize = () => queueLayout();

      if (image?.complete) {
        resize();
      } else {
        image?.addEventListener('load', resize, { once: true });
      }
    });
    queueLayout();
    window.addEventListener('resize', queueLayout, { passive: true });
  };

  try {
    const response = await fetch('./assets/images/manifest.json');
    if (!response.ok) throw new Error('Manifest not found');

    const manifest = await response.json();
    images = manifest.map((entry) => ({
      src: entry.src,
      label: prettifyLabel(entry.label),
      alt: `Refúgio - ${prettifyLabel(entry.label)}`
    }));

    if (!images.length) throw new Error('No images in manifest');
    mountImages();
  } catch (error) {
    console.error(error);
    emptyState?.removeAttribute('hidden');
    return;
  }

  closeButton?.addEventListener('click', closeLightbox);
  prevButton?.addEventListener('click', () => goTo(-1));
  nextButton?.addEventListener('click', () => goTo(1));
  zoomInButton?.addEventListener('click', () => setZoom(zoom + 0.25));
  zoomOutButton?.addEventListener('click', () => setZoom(zoom - 0.25));
  zoomResetButton?.addEventListener('click', () => setZoom(1));
  closeTargets.forEach((target) => target.addEventListener('click', closeLightbox));
  lightboxImage?.setAttribute('draggable', 'false');

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightboxViewport?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;

    if (zoom <= 1) {
      swipeStart = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY
      };
      lightboxViewport.setPointerCapture(event.pointerId);
      return;
    }

    event.preventDefault();
    panStart = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      panX,
      panY
    };
    lightboxViewport.setPointerCapture(event.pointerId);
    lightboxViewport.classList.add('is-panning');
  });

  lightboxViewport?.addEventListener('pointermove', (event) => {
    if (!panStart || panStart.pointerId !== event.pointerId) return;

    panX = panStart.panX + event.clientX - panStart.clientX;
    panY = panStart.panY + event.clientY - panStart.clientY;
    clampPan();
    applyLightboxTransform();
  });

  ['pointerup', 'pointercancel'].forEach((eventName) => {
    lightboxViewport?.addEventListener(eventName, (event) => {
      if (swipeStart?.pointerId === event.pointerId) {
        const deltaX = event.clientX - swipeStart.clientX;
        const deltaY = event.clientY - swipeStart.clientY;
        const shouldNavigate = eventName === 'pointerup'
          && Math.abs(deltaX) >= 48
          && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
        swipeStart = null;
        if (shouldNavigate) goTo(deltaX < 0 ? 1 : -1);
      }

      if (!panStart || panStart.pointerId !== event.pointerId) return;

      panStart = null;
      lightboxViewport.classList.remove('is-panning');
    });
  });

  lightboxViewport?.addEventListener('wheel', (event) => {
    event.preventDefault();

    if (zoom > 1 && !event.ctrlKey && !event.metaKey) {
      panX -= event.deltaX;
      panY -= event.deltaY;
      clampPan();
      applyLightboxTransform();
      return;
    }

    setZoom(zoom + (event.deltaY < 0 ? 0.12 : -0.12));
  }, { passive: false });

  document.addEventListener('keydown', (event) => {
    if (lightbox?.hasAttribute('hidden')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') goTo(1);
    if (event.key === 'ArrowLeft') goTo(-1);
    if (event.key === '+') setZoom(zoom + 0.25);
    if (event.key === '-') setZoom(zoom - 0.25);
    if (event.key === '0') setZoom(1);
  });
}
