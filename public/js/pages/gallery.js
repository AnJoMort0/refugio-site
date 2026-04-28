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
  const closeTargets = document.querySelectorAll('[data-lightbox-close]');
  const gap = 16;

  let images = [];
  let activeIndex = 0;
  let zoom = 1;
  let resizeFrame = null;

  const setZoom = (value) => {
    zoom = Math.min(4, Math.max(1, Number(value.toFixed(2))));
    lightboxImage?.style.setProperty('--lightbox-zoom', String(zoom));
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

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightbox?.addEventListener('wheel', (event) => {
    event.preventDefault();
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
