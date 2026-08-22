import { getActiveLanguage, getCurrentDictionary, getNestedValue } from '../services/i18n.js';
import { initScrollReveal } from '../ui/scroll-reveal.js';

const FAVOURITES_STORAGE_KEY = 'refugio-guide-favourites-v1';
const GUIDE_OVERRIDE_STORAGE_KEY = 'refugio-guide-listings-v1';

const GUIDE_LISTING_DEFS = [
  {
    "id": "porto",
    "tags": [
      "cities"
    ],
    "time": 35,
    "mapUrl": "https://maps.app.goo.gl/XVUdG1aSwp39hsi87",
    "mapQuery": "Porto, Portugal"
  },
  {
    "id": "gaia",
    "tags": [
      "cities"
    ],
    "time": 35,
    "mapUrl": "https://maps.app.goo.gl/RHD8EyWz1YwurPB48",
    "mapQuery": "Vila Nova de Gaia, Portugal"
  },
  {
    "id": "aveiro",
    "tags": [
      "cities"
    ],
    "time": 55,
    "mapUrl": "https://maps.app.goo.gl/3xpeGcUWWFUQZnwX7",
    "mapQuery": "Aveiro, Portugal"
  },
  {
    "id": "costa-nova",
    "tags": [
      "cities",
      "beaches"
    ],
    "time": 65,
    "mapUrl": "https://maps.app.goo.gl/VmN3Pk8gJHb3PrLK7",
    "mapQuery": "Costa Nova, Ílhavo, Portugal"
  },
  {
    "id": "braga",
    "tags": [
      "cities"
    ],
    "time": 65,
    "mapUrl": "https://maps.app.goo.gl/AGrSUn7PUPhWtDVcA",
    "mapQuery": "Braga, Portugal"
  },
  {
    "id": "bom-jesus",
    "tags": [
      "cities",
      "nature"
    ],
    "time": 70,
    "mapUrl": "https://maps.app.goo.gl/kam4QSrrnFfj7PiaA",
    "mapQuery": "Bom Jesus do Monte, Braga, Portugal"
  },
  {
    "id": "viana",
    "tags": [
      "cities"
    ],
    "time": 85,
    "mapUrl": "https://maps.app.goo.gl/veernFkBsg25JVsJA",
    "mapQuery": "Viana do Castelo, Portugal"
  },
  {
    "id": "castelo-paiva",
    "tags": [
      "nearby"
    ],
    "time": 17,
    "mapUrl": "https://maps.app.goo.gl/QRCbyyKbhDrGqJC48",
    "mapQuery": "Castelo de Paiva, Portugal"
  },
  {
    "id": "canedo",
    "tags": [
      "nearby"
    ],
    "time": 12,
    "mapUrl": "https://maps.app.goo.gl/cqoWCyicxEvChaqQA",
    "mapQuery": "Canedo, Santa Maria da Feira, Portugal"
  },
  {
    "id": "santa-maria-feira",
    "tags": [
      "nearby",
      "nature"
    ],
    "time": 30,
    "mapUrl": "https://maps.app.goo.gl/TvMH93wWQK9GHXK87",
    "mapQuery": "Santa Maria da Feira, Portugal"
  },
  {
    "id": "arouca",
    "tags": [
      "nearby",
      "nature"
    ],
    "time": 38,
    "mapUrl": "https://maps.app.goo.gl/L3gPPTj7a42SaotJA",
    "mapQuery": "Arouca, Portugal"
  },
  {
    "id": "mosteiro-arouca",
    "tags": [
      "nearby",
      "nature"
    ],
    "time": 38,
    "mapQuery": "Mosteiro de Santa Maria de Arouca, Portugal"
  },
  {
    "id": "ponte-516-arouca",
    "tags": [
      "nearby",
      "nature"
    ],
    "time": 35,
    "mapQuery": "516 Arouca Ponte Suspensa, Arouca, Portugal"
  },
  {
    "id": "passadicos-paiva",
    "tags": [
      "nearby",
      "nature"
    ],
    "time": 40,
    "mapQuery": "Passadiços do Paiva Areinho, Arouca, Portugal"
  },
  {
    "id": "serra-freita",
    "tags": [
      "nearby",
      "nature"
    ],
    "time": 55,
    "mapQuery": "Serra da Freita, Arouca, Portugal"
  },
  {
    "id": "frecha-mizarela",
    "tags": [
      "nearby",
      "nature"
    ],
    "time": 60,
    "mapQuery": "Frecha da Mizarela, Arouca, Portugal"
  },
  {
    "id": "pedras-parideiras",
    "tags": [
      "nearby",
      "nature"
    ],
    "time": 60,
    "mapQuery": "Pedras Parideiras Castanheira, Arouca, Portugal"
  },
  {
    "id": "cinfaes",
    "tags": [
      "nearby"
    ],
    "time": 45,
    "mapUrl": "https://maps.app.goo.gl/QBgRUVdnp2Ce3yTg6",
    "mapQuery": "Cinfães, Portugal"
  },
  {
    "id": "adega-ramadinha",
    "list": false,
    "tags": [
      "food",
      "partners"
    ],
    "time": 7,
    "mapUrl": "https://maps.app.goo.gl/pMdsA6bPjHoaZu2w8",
    "mapQuery": "Adega Ramadinha Pedorido, Portugal",
    "partner": true,
    "image": "./assets/images/partners/ramadinha_1.jpg"
  },
  {
    "id": "corga",
    "list": false,
    "tags": [
      "food",
      "partners"
    ],
    "time": null,
    "mapQuery": "Corga Castelo de Paiva Portugal",
    "partner": true,
    "image": "./assets/images/partners/corga_1.jpg"
  },
  {
    "id": "cafe-cruzeiro",
    "list": false,
    "tags": [
      "food",
      "partners"
    ],
    "time": null,
    "mapQuery": "Café Cruzeiro Pedorido Castelo de Paiva Portugal",
    "partner": true,
    "image": "./assets/images/partners/cruzeiro_1.jpg"
  },
  {
    "id": "aquapura",
    "list": false,
    "tags": [
      "food",
      "partners"
    ],
    "time": null,
    "mapQuery": "Aquapura Terrace Pedorido Castelo de Paiva Portugal",
    "partner": true,
    "image": "./assets/images/partners/aquapura_1.jpg"
  },
  {
    "id": "praia-pedorido",
    "tags": [
      "beaches",
      "nature"
    ],
    "time": 7,
    "mapUrl": "https://maps.app.goo.gl/65VaBnzNBNwfTjGr7",
    "mapQuery": "Praia Fluvial de Pedorido, Portugal"
  },
  {
    "id": "viver-douro",
    "tags": [
      "nearby",
      "nature"
    ],
    "time": 7,
    "mapQuery": "Viver o Douro Pedorido Castelo de Paiva, Portugal"
  },
  {
    "id": "ilha-amores",
    "tags": [
      "beaches",
      "nature"
    ],
    "time": 20,
    "mapUrl": "https://maps.app.goo.gl/j8FbbCTqQjLu9HLR7",
    "mapQuery": "Ilha dos Amores Castelo de Paiva, Portugal"
  },
  {
    "id": "lomba",
    "tags": [
      "beaches",
      "nature"
    ],
    "time": 30,
    "mapUrl": "https://maps.app.goo.gl/g7nWhzo7iM3dpZtH8",
    "mapQuery": "Praia da Lomba Gondomar, Portugal"
  },
  {
    "id": "espinho",
    "tags": [
      "beaches"
    ],
    "time": 35,
    "mapUrl": "https://maps.app.goo.gl/7D3KTQStFQwvD9sU8",
    "mapQuery": "Praia de Espinho, Portugal"
  },
  {
    "id": "furadouro",
    "tags": [
      "beaches"
    ],
    "time": 45,
    "mapUrl": "https://maps.app.goo.gl/XfFkaQpMwxE4wspq8",
    "mapQuery": "Praia do Furadouro Ovar, Portugal"
  },
  {
    "id": "serra-sao-domingos",
    "tags": [
      "nature"
    ],
    "time": 8,
    "mapUrl": "https://maps.app.goo.gl/SZGe75N7wjyUkAVD8",
    "mapQuery": "Serra de São Domingos Castelo de Paiva, Portugal"
  },
  {
    "id": "baloico-sao-gens",
    "tags": [
      "nature"
    ],
    "time": 15,
    "mapUrl": "https://maps.app.goo.gl/Csm3juK42Wwh9g2X7",
    "mapQuery": "Baloiço do Monte de São Gens, Portugal"
  },
  {
    "id": "castelo-feira",
    "tags": [
      "nature"
    ],
    "time": 30,
    "mapUrl": "https://maps.app.goo.gl/hZFPoFLvmWa2M4HH6",
    "mapQuery": "Castelo de Santa Maria da Feira, Portugal"
  },
  {
    "id": "sao-joao-porto",
    "tags": [
      "events"
    ],
    "time": 35,
    "mapUrl": "https://maps.app.goo.gl/XVUdG1aSwp39hsi87",
    "mapQuery": "Porto, Portugal",
    "seasonal": true
  },
  {
    "id": "sao-joao-paiva",
    "tags": [
      "events"
    ],
    "time": 17,
    "mapUrl": "https://maps.app.goo.gl/QRCbyyKbhDrGqJC48",
    "mapQuery": "Castelo de Paiva, Portugal",
    "seasonal": true
  },
  {
    "id": "santos-populares",
    "tags": [
      "events"
    ],
    "time": null,
    "mapQuery": "Castelo de Paiva, Portugal",
    "seasonal": true
  },
  {
    "id": "feira-vinho-verde",
    "tags": [
      "events"
    ],
    "time": 17,
    "mapUrl": "https://maps.app.goo.gl/QRCbyyKbhDrGqJC48",
    "mapQuery": "Castelo de Paiva, Portugal",
    "seasonal": true
  },
  {
    "id": "viagem-medieval",
    "tags": [
      "events",
      "nature"
    ],
    "time": 30,
    "mapUrl": "https://maps.app.goo.gl/TvMH93wWQK9GHXK87",
    "mapQuery": "Santa Maria da Feira, Portugal",
    "seasonal": true
  },
  {
    "id": "romaria-sao-domingos",
    "tags": [
      "events"
    ],
    "time": 10,
    "mapQuery": "São Domingos Raiva Castelo de Paiva, Portugal",
    "seasonal": true
  },
  {
    "id": "nossa-senhora-amoras",
    "tags": [
      "events"
    ],
    "time": 8,
    "mapQuery": "Oliveira do Arda Castelo de Paiva, Portugal",
    "seasonal": true
  }
];

const MAP_DEFAULT_QUERY = 'Rua da Arejinha 627, 4550-518 Pedorido';
const MAP_DEFAULT_URL = 'https://www.google.com/maps/place/O+Ref%C3%BAgio/@41.0205166,-8.3828538,108m/data=!3m1!1e3!4m6!3m5!1s0xd24830c21a7821f:0x7babb9259b50311a!8m2!3d41.0204812!4d-8.3823133!16s%2Fg%2F11vqhfvg0k?entry=ttu';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeSearch(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function readFavourites() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVOURITES_STORAGE_KEY) || '[]');
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function writeFavourites(favourites) {
  localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify([...favourites]));
}

function readGuideOverrides() {
  try {
    const stored = JSON.parse(localStorage.getItem(GUIDE_OVERRIDE_STORAGE_KEY) || '{}');
    return stored?.overrides && typeof stored.overrides === 'object' ? stored.overrides : stored;
  } catch {
    return {};
  }
}

function isExpired(definition) {
  if (!definition.offerExpires) return false;
  const end = new Date(`${definition.offerExpires}T23:59:59`);
  return Number.isFinite(end.getTime()) && end.getTime() < Date.now();
}

function resolveDefinitions() {
  const overrides = readGuideOverrides();

  return GUIDE_LISTING_DEFS
    .map((definition) => {
      const override = overrides?.[definition.id];
      return override && typeof override === 'object'
        ? { ...definition, ...override }
        : { ...definition };
    })
    .filter((definition) => definition.published !== false && !isExpired(definition));
}

function getText(path, fallback = '') {
  const value = getNestedValue(getCurrentDictionary(), path);
  return value === undefined || value === null ? fallback : String(value);
}

function listingText(id) {
  return getNestedValue(getCurrentDictionary(), `guidePage.listings.${id}`) || null;
}

function icon(name) {
  const icons = {
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.04 3 5.5l7 7Z"></path>',
    map: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle>',
    route: '<circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle>',
    clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    waves: '<path d="M2 6c.6.5 1.2 1 2.5 1S6.4 6 7.7 6s1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1s1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1s1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.5 1"></path>',
    mountain: '<path d="m8 3 4 8 3-4 6 10H3Z"></path><path d="m8 3 2.2 4.4L8.8 8.8 7.2 7.6 6 9"></path>',
    sparkles: '<path d="m12 3-1.5 3.5L7 8l3.5 1.5L12 13l1.5-3.5L17 8l-3.5-1.5Z"></path><path d="m5 14-.8 1.8L2.5 16.5l1.7.7L5 19l.8-1.8 1.7-.7-1.7-.7Z"></path><path d="m19 14-1 2.3-2.3 1 2.3 1L19 21l1-2.7 2.3-1-2.3-1Z"></path>',
  };
  return `<svg class="lucide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`;
}

function mapEmbedUrl(query) {
  const language = encodeURIComponent(getActiveLanguage() || 'pt');
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=${language}`;
}

function genericMapUrl(query) {
  const language = encodeURIComponent(getActiveLanguage() || 'pt');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&hl=${language}`;
}

function directionsUrl(definition, origin) {
  if (origin) {
    const language = encodeURIComponent(getActiveLanguage() || 'pt');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${encodeURIComponent(definition.mapQuery)}&hl=${language}`;
  }
  return definition.mapUrl || genericMapUrl(definition.mapQuery);
}

function guideImageUrl(definition) {
  if (definition.image) return definition.image;
  return `./assets/images/guide/${definition.id}.jpg`;
}

function guideFallbackTheme(definition) {
  const tags = Array.isArray(definition.tags) ? definition.tags : [];
  if (tags.includes('events')) return 'event';
  if (tags.includes('beaches')) return 'water';
  if (tags.includes('nature')) return 'nature';
  return 'place';
}

function guideFallbackIcon(theme) {
  if (theme === 'event') return icon('sparkles');
  if (theme === 'water') return icon('waves');
  if (theme === 'nature') return icon('mountain');
  return icon('map');
}

function replaceCount(template, count) {
  return String(template || '').replace('{count}', String(count));
}

export function initGuidePage() {
  const root = document.body.querySelector('[data-guide-browser]');
  if (!root) return;

  const results = document.querySelector('[data-guide-results]');
  const empty = document.querySelector('[data-guide-empty]');
  const resultsCount = document.querySelector('[data-guide-results-count]');
  const searchInput = document.querySelector('[data-guide-search]');
  const sortSelect = document.querySelector('[data-guide-sort]');
  const filterButtons = [...document.querySelectorAll('[data-guide-filter]')];
  const viewButtons = [...document.querySelectorAll('[data-guide-view]')];
  const openMapButtons = [...document.querySelectorAll('[data-guide-open-map]')];
  const locationButton = document.querySelector('[data-guide-location]');
  const locationLabel = document.querySelector('[data-guide-location-label]');
  const locationStatus = document.querySelector('[data-guide-location-status]');
  const mapFrame = document.querySelector('[data-guide-map-frame]');
  const mapTitle = document.querySelector('[data-guide-map-title]');
  const mapLink = document.querySelector('[data-guide-map-link]');
  const partnerRoot = document.querySelector('[data-guide-partners]');

  let definitions = resolveDefinitions();
  let favourites = readFavourites();
  let activeFilter = 'all';
  let searchTerm = '';
  let sortMode = sortSelect?.value || 'closest';
  let selectedId = null;
  let locationOrigin = null;
  let viewMode = window.matchMedia('(max-width: 767px)').matches ? 'list' : 'map';

  function translated(definition) {
    const text = listingText(definition.id);
    if (!text) return null;
    return { ...definition, text };
  }

  function visibleListings() {
    const normalizedNeedle = normalizeSearch(searchTerm);

    const items = definitions
      .filter((definition) => definition.list !== false)
      .map(translated)
      .filter(Boolean)
      .filter((item) => {
        if (activeFilter === 'favourites' && !favourites.has(item.id)) return false;
        if (activeFilter !== 'all' && activeFilter !== 'favourites' && !item.tags.includes(activeFilter)) return false;

        if (!normalizedNeedle) return true;
        const haystack = normalizeSearch([
          item.text.name,
          item.text.category,
          item.text.description,
          item.text.note,
          item.text.eventDate
        ].filter(Boolean).join(' '));
        return haystack.includes(normalizedNeedle);
      });

    items.sort((a, b) => {
      if (sortMode === 'alpha') {
        return a.text.name.localeCompare(b.text.name, getActiveLanguage() || 'pt', { sensitivity: 'base' });
      }

      const timeA = Number.isFinite(a.time) ? a.time : Number.POSITIVE_INFINITY;
      const timeB = Number.isFinite(b.time) ? b.time : Number.POSITIVE_INFINITY;
      if (timeA !== timeB) return timeA - timeB;
      return a.text.name.localeCompare(b.text.name, getActiveLanguage() || 'pt', { sensitivity: 'base' });
    });

    return items;
  }

  function cardMarkup(item) {
    const isFavourite = favourites.has(item.id);
    const partnerBadge = item.partner
      ? `<span class="guide-badge partner">${escapeHtml(getText('guidePage.labels.partner', 'Parceiro'))}</span>`
      : '';
    const seasonalBadge = item.seasonal
      ? `<span class="guide-badge seasonal">${escapeHtml(getText('guidePage.labels.seasonal', 'Sazonal'))}</span>`
      : '';
    const closestBadge = item.featured === 'closest'
      ? `<span class="guide-badge">${escapeHtml(getText('guidePage.labels.closest', 'Mais próximo'))}</span>`
      : '';

    const timeMarkup = item.text.time
      ? `<span>${icon('clock')}${escapeHtml(item.text.time)} ${escapeHtml(getText('guidePage.labels.fromRefugio', 'de O Refúgio'))}</span>`
      : '';

    const noteMarkup = item.text.note
      ? `<p class="guide-card-note">${escapeHtml(item.text.note)}</p>`
      : '';

    const eventMarkup = item.text.eventDate
      ? `<p class="guide-card-event-date">${escapeHtml(item.text.eventDate)}</p>`
      : '';

    const directions = directionsUrl(item, locationOrigin);
    const fallbackTheme = guideFallbackTheme(item);
    const imageMarkup = `
      <div class="guide-card-media guide-card-media--${escapeHtml(fallbackTheme)}" data-guide-card-media>
        <div class="guide-card-fallback" aria-hidden="true">
          <span class="guide-card-fallback-brand">${escapeHtml(getText('brand.name', 'O Refúgio'))}</span>
          <span class="guide-card-fallback-icon">${guideFallbackIcon(fallbackTheme)}</span>
          <span class="guide-card-fallback-label">${escapeHtml(item.text.category)}</span>
        </div>
        <img
          class="guide-card-image"
          src="${escapeHtml(guideImageUrl(item))}"
          alt="${escapeHtml(item.text.name)}"
          loading="lazy"
          decoding="async"
          data-guide-card-image
        />
      </div>
    `;

    return `
      <article class="card guide-card${selectedId === item.id ? ' is-selected' : ''}" id="guia-${escapeHtml(item.id)}" data-guide-card="${escapeHtml(item.id)}">
        ${imageMarkup}
        <div class="guide-card-header">
          <div class="guide-card-title-wrap">
            <span class="guide-card-category">${escapeHtml(item.text.category)}</span>
            <h3 class="guide-card-title">${escapeHtml(item.text.name)}</h3>
          </div>
          <div class="guide-card-badges">${closestBadge}${partnerBadge}${seasonalBadge}</div>
        </div>
        <p class="guide-card-description">${escapeHtml(item.text.description)}</p>
        ${eventMarkup}
        ${noteMarkup}
        <div class="guide-card-meta">
          ${timeMarkup}
          <span>${escapeHtml(getText('guidePage.labels.confirmHours', 'Confirme horários e condições antes da visita.'))}</span>
        </div>
        <div class="guide-card-actions">
          <a class="button button-primary" href="${escapeHtml(directions)}" target="_blank" rel="noopener" data-guide-directions="${escapeHtml(item.id)}">
            ${icon('route')}<span>${escapeHtml(getText('guidePage.labels.directions', 'Abrir direções'))}</span>
          </a>
          <button type="button" class="guide-card-action" data-guide-map-select="${escapeHtml(item.id)}">
            ${icon('map')}<span>${escapeHtml(getText('guidePage.labels.showOnMap', 'Ver no mapa'))}</span>
          </button>
          <button
            type="button"
            class="guide-card-action guide-favourite-button${isFavourite ? ' is-favourite' : ''}"
            data-guide-favourite="${escapeHtml(item.id)}"
            aria-pressed="${String(isFavourite)}"
            aria-label="${escapeHtml(getText(isFavourite ? 'guidePage.labels.removeFavourite' : 'guidePage.labels.favourite', isFavourite ? 'Remover dos favoritos' : 'Guardar nos favoritos'))}"
            title="${escapeHtml(getText(isFavourite ? 'guidePage.labels.removeFavourite' : 'guidePage.labels.favourite', isFavourite ? 'Remover dos favoritos' : 'Guardar nos favoritos'))}"
          >
            ${icon('heart')}
          </button>
        </div>
      </article>
    `;
  }

  function bindCardImages() {
    results.querySelectorAll('[data-guide-card-image]').forEach((image) => {
      const media = image.closest('[data-guide-card-media]');
      const useFallback = () => {
        media?.classList.add('is-fallback');
        image.hidden = true;
      };

      const showImage = () => {
        media?.classList.remove('is-fallback');
        image.hidden = false;
      };

      image.addEventListener('error', useFallback, { once: true });
      image.addEventListener('load', showImage, { once: true });

      // Cached responses can finish before listeners are attached.
      if (image.complete) {
        if (image.naturalWidth > 0) showImage();
        else useFallback();
      }
    });
  }

  function renderResults() {
    const items = visibleListings();
    results.innerHTML = items.map(cardMarkup).join('');
    bindCardImages();
    empty.hidden = items.length !== 0;

    const template = getText(items.length === 1 ? 'guidePage.browser.result' : 'guidePage.browser.results', items.length === 1 ? '{count} sugestão' : '{count} sugestões');
    resultsCount.textContent = replaceCount(template, items.length);

    bindResultActions();
  }

  function partnerMarkup(item) {
    if (!item.image) return '';
    const details = item.text?.description || getText('guidePage.partners.detailsSoon', 'Informação detalhada a completar.');
    return `
      <article class="guide-partner-card" data-partner-id="${escapeHtml(item.id)}">
        <span class="guide-badge partner">${escapeHtml(getText('guidePage.labels.partner', 'Parceiro'))}</span>
        <img src="${escapeHtml(item.image)}" alt="" loading="lazy" />
        <div class="guide-partner-card-copy">
          <h3>${escapeHtml(item.text.name)}</h3>
          <p>${escapeHtml(details)}</p>
          <button type="button" class="text-link" data-guide-partner-open="${escapeHtml(item.id)}">${escapeHtml(getText('guidePage.labels.showOnMap', 'Ver no mapa'))}</button>
        </div>
      </article>
    `;
  }

  function renderPartners() {
    if (!partnerRoot) return;
    const partners = definitions
      .filter((definition) => definition.partner)
      .map(translated)
      .filter(Boolean);

    partnerRoot.innerHTML = partners.map(partnerMarkup).join('');

    partnerRoot.querySelectorAll('[data-guide-partner-open]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.guidePartnerOpen;
        setView('map');
        selectOnMap(id, true);
      });
    });
  }

  function setFilter(nextFilter) {
    activeFilter = nextFilter;
    filterButtons.forEach((button) => {
      const active = button.dataset.guideFilter === activeFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderResults();
  }

  function setView(nextView) {
    viewMode = nextView === 'map' ? 'map' : 'list';
    root.classList.toggle('is-map-view', viewMode === 'map');

    viewButtons.forEach((button) => {
      const active = button.dataset.guideView === viewMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function selectedDefinition() {
    return definitions.find((definition) => definition.id === selectedId) || null;
  }

  function resetMap() {
    selectedId = null;
    if (mapFrame) {
      mapFrame.src = mapEmbedUrl(MAP_DEFAULT_QUERY);
      mapFrame.title = getText('guidePage.map.defaultTitle', 'O Refúgio');
    }
    if (mapTitle) mapTitle.textContent = getText('guidePage.map.title', 'Veja cada sugestão no Google Maps.');
    if (mapLink) {
      mapLink.href = MAP_DEFAULT_URL;
      mapLink.textContent = getText('guidePage.map.openDefault', 'Abrir O Refúgio no Google Maps');
    }
  }

  function selectOnMap(id, shouldScroll = false) {
    const definition = definitions.find((item) => item.id === id);
    const item = definition ? translated(definition) : null;
    if (!item) return;

    selectedId = id;
    setView('map');

    if (mapFrame) {
      mapFrame.src = mapEmbedUrl(item.mapQuery);
      mapFrame.title = item.text.name;
    }
    if (mapTitle) mapTitle.textContent = item.text.name;
    if (mapLink) {
      mapLink.href = directionsUrl(item, locationOrigin);
      mapLink.textContent = getText('guidePage.labels.directions', 'Abrir direções');
    }

    document.querySelectorAll('[data-guide-card]').forEach((card) => {
      card.classList.toggle('is-selected', card.dataset.guideCard === id);
    });

    if (shouldScroll) {
      document.querySelector('[data-guide-map]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function toggleFavourite(id) {
    if (favourites.has(id)) favourites.delete(id);
    else favourites.add(id);
    writeFavourites(favourites);
    renderResults();
  }


  function bindResultActions() {
    results.querySelectorAll('[data-guide-map-select]').forEach((button) => {
      button.addEventListener('click', () => selectOnMap(button.dataset.guideMapSelect, true));
    });

    results.querySelectorAll('[data-guide-favourite]').forEach((button) => {
      button.addEventListener('click', () => toggleFavourite(button.dataset.guideFavourite));
    });
  }

  function activateLocation() {
    if (!navigator.geolocation) {
      locationStatus.textContent = getText('guidePage.browser.locationDenied', 'Não foi possível usar a sua localização.');
      return;
    }

    locationButton.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationOrigin = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6))
        };
        locationButton.disabled = false;
        locationButton.classList.add('is-active');
        locationLabel.textContent = getText('guidePage.browser.locationReady', 'Localização ativa para direções');
        locationStatus.textContent = '';
        renderResults();

        const selected = selectedDefinition();
        if (selected && mapLink) mapLink.href = directionsUrl(selected, locationOrigin);
      },
      () => {
        locationButton.disabled = false;
        locationStatus.textContent = getText('guidePage.browser.locationDenied', 'Não foi possível usar a sua localização.');
      },
      {
        enableHighAccuracy: false,
        timeout: 9000,
        maximumAge: 300000
      }
    );
  }

  function applyHashSelection() {
    const hash = decodeURIComponent(window.location.hash || '');
    if (!hash.startsWith('#guia-')) return;

    const id = hash.slice('#guia-'.length);
    if (!definitions.some((definition) => definition.id === id)) return;

    setFilter('all');
    selectOnMap(id, false);
    window.requestAnimationFrame(() => {
      document.getElementById(`guia-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.guideFilter || 'all'));
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.guideView || 'list'));
  });

  openMapButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setView('map');
      window.setTimeout(() => document.querySelector('#mapa')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    });
  });

  searchInput?.addEventListener('input', () => {
    searchTerm = searchInput.value;
    renderResults();
  });

  sortSelect?.addEventListener('change', () => {
    sortMode = sortSelect.value;
    renderResults();
  });

  locationButton?.addEventListener('click', activateLocation);

  document.addEventListener('language:changed', () => {
    definitions = resolveDefinitions();
    renderResults();
    renderPartners();

    if (locationOrigin) {
      locationLabel.textContent = getText('guidePage.browser.locationReady', 'Localização ativa para direções');
    }

    const selected = selectedDefinition();
    if (selected) selectOnMap(selected.id, false);
    else resetMap();
  });

  setView(viewMode);
  renderResults();
  renderPartners();
  resetMap();
  applyHashSelection();

  // Do not reveal the discovery/browser section as one large observed block.
  // It can become much taller than the viewport once all listings render, which means
  // an IntersectionObserver threshold based on visible percentage may never be reached.
  // Keeping that section immediately visible also prevents the sticky Google Map from
  // being trapped inside an opacity/transform reveal state.
  initScrollReveal(
    '.guide-partners-section, .guide-final-section, .guide-note-card, .guide-partner-card',
    0.12
  );
}
