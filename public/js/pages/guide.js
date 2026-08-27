import { getActiveLanguage, getCurrentDictionary, getNestedValue } from '../services/i18n.js';
import { initScrollReveal } from '../ui/scroll-reveal.js';
import { SITE_CONFIG } from '../config/site-config.js';

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

const MAP_DEFAULT_URL = SITE_CONFIG.property.mapsUrl;
const GUIDE_COORDINATES = Object.freeze({
  porto: [41.1502195, -8.6103497],
  gaia: [41.1292264, -8.6057396],
  aveiro: [40.640496, -8.6537841],
  'costa-nova': [40.6125817, -8.7495432],
  braga: [41.5510583, -8.4280045],
  'bom-jesus': [41.5544749, -8.377812],
  viana: [41.6935131, -8.828277],
  'castelo-paiva': [41.0410042, -8.271775],
  canedo: [41.017568, -8.4518566],
  'santa-maria-feira': [40.9254179, -8.5426688],
  arouca: [40.9289214, -8.2441746],
  'mosteiro-arouca': [40.9298, -8.2456],
  'ponte-516-arouca': [40.9643992, -8.1746438],
  'passadicos-paiva': [40.9529102, -8.1769093],
  'serra-freita': [40.8669768, -8.2669369],
  'frecha-mizarela': [40.8629785, -8.2826679],
  'pedras-parideiras': [40.8508952, -8.2825686],
  cinfaes: [41.0326798, -8.1080075],
  'adega-ramadinha': [41.0474029, -8.3751374],
  corga: [40.9828736, -8.309872],
  'cafe-cruzeiro': [41.0352, -8.3778],
  aquapura: [41.04835, -8.37675],
  'praia-pedorido': [41.0486021, -8.3762132],
  'viver-douro': [41.0447985, -8.3637114],
  'ilha-amores': [41.0665323, -8.2623658],
  lomba: [41.069751, -8.4130696],
  espinho: [41.0158379, -8.645921],
  furadouro: [40.8751527, -8.6767972],
  'serra-sao-domingos': [41.0268748, -8.3510589],
  'baloico-sao-gens': [41.0457017, -8.2995017],
  'castelo-feira': [40.9209023, -8.5426938],
  'sao-joao-porto': [41.1502195, -8.6103497],
  'sao-joao-paiva': [41.0410042, -8.271775],
  'santos-populares': [41.0410042, -8.271775],
  'feira-vinho-verde': [41.0410042, -8.271775],
  'viagem-medieval': [40.9254179, -8.5426688],
  'romaria-sao-domingos': [41.0269394, -8.3497193],
  'nossa-senhora-amoras': [41.0357339, -8.3547737]
});
const MAP_CATEGORY_STYLES = Object.freeze({
  property: { color: '#24452f', shape: 'house', labelKey: 'guidePage.map.propertyLabel' },
  beaches: { color: '#0077b6', shape: 'circle', labelKey: 'guidePage.browser.beaches' },
  nature: { color: '#2f7d32', shape: 'triangle', labelKey: 'guidePage.browser.nature' },
  cities: { color: '#c74432', shape: 'square', labelKey: 'guidePage.browser.cities' },
  nearby: { color: '#d28a00', shape: 'pin', labelKey: 'guidePage.browser.nearby' },
  events: { color: '#9b2f65', shape: 'diamond', labelKey: 'guidePage.browser.events' },
  partners: { color: '#65412f', shape: 'hexagon', labelKey: 'guidePage.labels.partner' }
});
const MAP_CATEGORY_PRIORITY = ['events', 'partners', 'beaches', 'nature', 'cities', 'nearby'];

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
      const resolved = override && typeof override === 'object'
        ? { ...definition, ...override }
        : { ...definition };
      return {
        ...resolved,
        coordinates: resolved.coordinates || GUIDE_COORDINATES[definition.id] || null
      };
    })
    .filter((definition) => definition.published !== false && !isExpired(definition));
}

function getText(path) {
  const value = getNestedValue(getCurrentDictionary(), path);
  return value === undefined || value === null ? '' : String(value);
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
    chevronDown: '<path d="m6 9 6 6 6-6"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    external: '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>',
    waves: '<path d="M2 6c.6.5 1.2 1 2.5 1S6.4 6 7.7 6s1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1s1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1s1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.2 1 1.9-1 3.2-1 1.9 1 3.5 1"></path>',
    mountain: '<path d="m8 3 4 8 3-4 6 10H3Z"></path><path d="m8 3 2.2 4.4L8.8 8.8 7.2 7.6 6 9"></path>',
    sparkles: '<path d="m12 3-1.5 3.5L7 8l3.5 1.5L12 13l1.5-3.5L17 8l-3.5-1.5Z"></path><path d="m5 14-.8 1.8L2.5 16.5l1.7.7L5 19l.8-1.8 1.7-.7-1.7-.7Z"></path><path d="m19 14-1 2.3-2.3 1 2.3 1L19 21l1-2.7 2.3-1-2.3-1Z"></path>',
  };
  return `<svg class="lucide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`;
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
  const mapCanvas = document.querySelector('[data-guide-map-canvas]');
  const mapLegend = document.querySelector('[data-guide-map-legend]');
  const mapFallback = document.querySelector('[data-guide-map-fallback]');
  const mapTitle = document.querySelector('[data-guide-map-title]');
  const mapLink = document.querySelector('[data-guide-map-link]');
  const partnerRoot = document.querySelector('[data-guide-partners]');
  const loadMoreWrap = document.querySelector('[data-guide-load-more-wrap]');
  const loadMoreButton = document.querySelector('[data-guide-load-more]');
  const compactGuideQuery = window.matchMedia('(max-width: 767px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactPageSize = 6;

  let definitions = resolveDefinitions();
  let favourites = readFavourites();
  let activeFilter = 'all';
  let searchTerm = '';
  let sortMode = sortSelect?.value || 'closest';
  let selectedId = null;
  let locationOrigin = null;
  let viewMode = window.matchMedia('(max-width: 767px)').matches ? 'list' : 'map';
  let visibleLimit = compactGuideQuery.matches ? compactPageSize : Number.POSITIVE_INFINITY;
  let expandedPartnerId = null;
  let guideMap = null;
  let guideMarkerLayer = null;
  let mapMarkers = new Map();

  function resetVisibleLimit() {
    visibleLimit = compactGuideQuery.matches ? compactPageSize : Number.POSITIVE_INFINITY;
  }

  function translated(definition) {
    const text = listingText(definition.id);
    if (!text) return null;
    return { ...definition, text };
  }

  function matchesCurrentCriteria(item) {
    const normalizedNeedle = normalizeSearch(searchTerm);
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
  }

  function filteredListings({ includePartners = false } = {}) {
    return definitions
      .filter((definition) => includePartners || definition.list !== false)
      .map(translated)
      .filter(Boolean)
      .filter(matchesCurrentCriteria);
  }

  function visibleListings() {
    const items = filteredListings();

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
      ? `<span class="guide-badge partner">${escapeHtml(getText('guidePage.labels.partner'))}</span>`
      : '';
    const seasonalBadge = item.seasonal
      ? `<span class="guide-badge seasonal">${escapeHtml(getText('guidePage.labels.seasonal'))}</span>`
      : '';
    const closestBadge = item.featured === 'closest'
      ? `<span class="guide-badge">${escapeHtml(getText('guidePage.labels.closest'))}</span>`
      : '';

    const timeMarkup = item.text.time
      ? `<span>${icon('clock')}${escapeHtml(item.text.time)} ${escapeHtml(getText('guidePage.labels.fromRefugio'))}</span>`
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
          <span class="guide-card-fallback-brand">${escapeHtml(getText('brand.name'))}</span>
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
        <button
          type="button"
          class="guide-card-action guide-favourite-button${isFavourite ? ' is-favourite' : ''}"
          data-guide-favourite="${escapeHtml(item.id)}"
          aria-pressed="${String(isFavourite)}"
          aria-label="${escapeHtml(getText(isFavourite ? 'guidePage.labels.removeFavourite' : 'guidePage.labels.favourite'))}"
          title="${escapeHtml(getText(isFavourite ? 'guidePage.labels.removeFavourite' : 'guidePage.labels.favourite'))}"
        >
          ${icon('heart')}
        </button>
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
          <span>${escapeHtml(getText('guidePage.labels.confirmHours'))}</span>
        </div>
        <div class="guide-card-actions">
          <a class="button button-primary" href="${escapeHtml(directions)}" target="_blank" rel="noopener" data-guide-directions="${escapeHtml(item.id)}">
            ${icon('route')}<span>${escapeHtml(getText('guidePage.labels.directions'))}</span>
          </a>
          <button type="button" class="guide-card-action" data-guide-map-select="${escapeHtml(item.id)}">
            ${icon('map')}<span>${escapeHtml(getText('guidePage.labels.showOnMap'))}</span>
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

  function mapCategory(item) {
    return MAP_CATEGORY_PRIORITY.find((category) => item.tags.includes(category)) || 'nearby';
  }

  function markerIcon(category, { property = false, selected = false } = {}) {
    const style = MAP_CATEGORY_STYLES[category] || MAP_CATEGORY_STYLES.nearby;
    return window.L.divIcon({
      className: 'guide-leaflet-div-icon',
      html: `<span class="guide-map-pin shape-${style.shape}${property ? ' is-property' : ''}${selected ? ' is-selected' : ''}" style="--guide-pin-color:${style.color}"><span></span></span>`,
      iconSize: property ? [34, 42] : [28, 35],
      iconAnchor: property ? [17, 41] : [14, 34],
      popupAnchor: [0, property ? -38 : -31]
    });
  }

  function mapPopup(item) {
    return `
      <div class="guide-map-popup">
        <span>${escapeHtml(item.text.category)}</span>
        <strong>${escapeHtml(item.text.name)}</strong>
        <a href="${escapeHtml(directionsUrl(item, locationOrigin))}" target="_blank" rel="noopener">
          ${escapeHtml(getText('guidePage.labels.directions'))}
        </a>
      </div>
    `;
  }

  function renderMapLegend(categories) {
    if (!mapLegend) return;
    const orderedCategories = ['property', ...MAP_CATEGORY_PRIORITY]
      .filter((category, index, values) => values.indexOf(category) === index)
      .filter((category) => category === 'property' || categories.has(category));

    mapLegend.innerHTML = `
      <strong>${escapeHtml(getText('guidePage.map.legendTitle'))}</strong>
      <div>
        ${orderedCategories.map((category) => {
          const style = MAP_CATEGORY_STYLES[category];
          return `<span><i class="shape-${style.shape}" style="--guide-pin-color:${style.color}"></i>${escapeHtml(getText(style.labelKey))}</span>`;
        }).join('')}
      </div>
    `;
  }

  function updateMapMarkers({ fit = true } = {}) {
    if (!guideMap || !guideMarkerLayer || !window.L) return;

    guideMarkerLayer.clearLayers();
    mapMarkers = new Map();
    const categories = new Set();
    const usedCoordinates = new Map();
    const propertyCoordinates = SITE_CONFIG.property.coordinates;
    const propertyMarker = window.L.marker(propertyCoordinates, {
      icon: markerIcon('property', { property: true }),
      keyboard: true,
      title: getText('guidePage.map.propertyLabel'),
      zIndexOffset: 1000
    }).bindPopup(`
      <div class="guide-map-popup">
        <span>${escapeHtml(getText('guidePage.map.defaultAddress'))}</span>
        <strong>${escapeHtml(getText('guidePage.map.propertyLabel'))}</strong>
        <a href="${escapeHtml(MAP_DEFAULT_URL)}" target="_blank" rel="noopener">${escapeHtml(getText('guidePage.map.openDefault'))}</a>
      </div>
    `);
    propertyMarker.addTo(guideMarkerLayer);

    filteredListings({ includePartners: true })
      .filter((item) => Array.isArray(item.coordinates) && item.coordinates.length === 2)
      .forEach((item) => {
        const category = mapCategory(item);
        const coordinateKey = item.coordinates.join(',');
        const duplicateIndex = usedCoordinates.get(coordinateKey) || 0;
        usedCoordinates.set(coordinateKey, duplicateIndex + 1);
        const angle = duplicateIndex * 2.4;
        const offset = duplicateIndex === 0 ? 0 : 0.00016 * Math.ceil(duplicateIndex / 2);
        const coordinates = [
          item.coordinates[0] + Math.sin(angle) * offset,
          item.coordinates[1] + Math.cos(angle) * offset
        ];
        const marker = window.L.marker(coordinates, {
          icon: markerIcon(category, { selected: item.id === selectedId }),
          keyboard: true,
          title: item.text.name
        }).bindPopup(mapPopup(item));

        marker.on('click', () => selectOnMap(item.id, false, { openPopup: false }));
        marker.addTo(guideMarkerLayer);
        mapMarkers.set(item.id, marker);
        categories.add(category);
      });

    renderMapLegend(categories);
    if (!fit) return;

    const bounds = guideMarkerLayer.getBounds();
    if (bounds.isValid()) {
      guideMap.fitBounds(bounds, { padding: [34, 34], maxZoom: 13, animate: !reducedMotionQuery.matches });
    } else {
      guideMap.setView(propertyCoordinates, 12);
    }
  }

  function initInteractiveMap() {
    if (!mapCanvas) return;
    if (!window.L) {
      mapCanvas.classList.add('is-unavailable');
      if (mapFallback) mapFallback.hidden = false;
      return;
    }

    guideMap = window.L.map(mapCanvas, {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView(SITE_CONFIG.property.coordinates, 11);
    window.L.tileLayer(SITE_CONFIG.map.tileUrl, {
      maxZoom: SITE_CONFIG.map.maxZoom,
      attribution: SITE_CONFIG.map.attribution
    }).addTo(guideMap);
    guideMarkerLayer = window.L.featureGroup().addTo(guideMap);
    guideMap.on('focus', () => guideMap.scrollWheelZoom.enable());
    guideMap.on('blur', () => guideMap.scrollWheelZoom.disable());
    if (mapFallback) mapFallback.hidden = true;
  }

  function renderResults() {
    const allItems = visibleListings();
    const items = allItems.slice(0, visibleLimit);
    results.innerHTML = items.map(cardMarkup).join('');
    bindCardImages();
    empty.hidden = allItems.length !== 0;

    const template = getText(allItems.length === 1 ? 'guidePage.browser.result' : 'guidePage.browser.results');
    resultsCount.textContent = replaceCount(template, allItems.length);

    if (loadMoreWrap && loadMoreButton) {
      const remaining = Math.max(allItems.length - items.length, 0);
      loadMoreWrap.hidden = remaining === 0;
      loadMoreButton.textContent = replaceCount(
        getText('guidePage.browser.showMore'),
        remaining
      );
    }

    bindResultActions();
    updateMapMarkers();
  }

  function partnerMarkup(item) {
    if (!item.image) return '';
    const details = item.text?.description || '';
    const partnerDetails = getNestedValue(getCurrentDictionary(), `guidePage.partners.details.${item.id}`) || {};
    const highlights = Array.isArray(partnerDetails.highlights) ? partnerDetails.highlights : [];
    const detailsId = `partner-details-${item.id}`;
    const travelTime = Number.isFinite(item.time)
      ? `<span class="guide-partner-travel">${icon('clock')} ${escapeHtml(`${item.time} min ${getText('guidePage.labels.fromRefugio')}`)}</span>`
      : '';
    const websiteAction = partnerDetails.websiteUrl
      ? `
          <a href="${escapeHtml(partnerDetails.websiteUrl)}" target="_blank" rel="noopener">
            ${icon('external')}<span>${escapeHtml(getText('guidePage.partners.websiteLabel'))}</span>
          </a>
        `
      : '';
    return `
      <article class="guide-partner-card" id="partner-${escapeHtml(item.id)}" data-partner-id="${escapeHtml(item.id)}">
        <div class="guide-partner-media">
          <span class="guide-badge partner">${escapeHtml(getText('guidePage.labels.partner'))}</span>
          <img src="${escapeHtml(item.image)}" alt="" loading="lazy" />
        </div>
        <div class="guide-partner-card-copy">
          <div class="guide-partner-heading">
            <span class="guide-partner-category">${escapeHtml(item.text.category)}</span>
            <h3>${escapeHtml(item.text.name)}</h3>
            ${travelTime}
          </div>
          <p class="guide-partner-summary">${escapeHtml(details)}</p>
          <div class="guide-partner-details" id="${escapeHtml(detailsId)}" aria-hidden="true" inert>
            <div class="guide-partner-details-inner">
              <p class="guide-partner-intro">${escapeHtml(partnerDetails.intro || '')}</p>
              ${highlights.length ? `
                <div class="guide-partner-highlights">
                  <p class="guide-partner-detail-label">${escapeHtml(getText('guidePage.partners.highlightsLabel'))}</p>
                  <ul>${highlights.map((highlight) => `<li>${icon('check')}<span>${escapeHtml(highlight)}</span></li>`).join('')}</ul>
                </div>
              ` : ''}
              <div class="guide-partner-detail-actions">
                ${websiteAction}
                <button type="button" data-guide-partner-open="${escapeHtml(item.id)}">
                  ${icon('map')}<span>${escapeHtml(getText('guidePage.labels.showOnMap'))}</span>
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            class="guide-partner-more"
            data-guide-partner-toggle="${escapeHtml(item.id)}"
            aria-expanded="false"
            aria-controls="${escapeHtml(detailsId)}"
          >
            <span data-guide-partner-toggle-label>${escapeHtml(getText('guidePage.partners.moreLabel'))}</span>
            ${icon('chevronDown')}
          </button>
        </div>
      </article>
    `;
  }

  function capturePartnerLayout() {
    if (!partnerRoot || reducedMotionQuery.matches) return null;
    return new Map(
      [...partnerRoot.querySelectorAll('[data-partner-id]')]
        .map((article) => [article.dataset.partnerId, article.getBoundingClientRect()])
    );
  }

  function animatePartnerLayout(previousLayout) {
    if (!partnerRoot || !previousLayout || reducedMotionQuery.matches) return;

    partnerRoot.querySelectorAll('[data-partner-id]').forEach((article) => {
      const previous = previousLayout.get(article.dataset.partnerId);
      if (!previous) return;
      const next = article.getBoundingClientRect();
      if (!next.width || !next.height) return;
      const translateX = previous.left - next.left;
      const translateY = previous.top - next.top;
      const scaleX = previous.width / next.width;
      const scaleY = previous.height / next.height;
      const changed = Math.abs(translateX) > 1
        || Math.abs(translateY) > 1
        || Math.abs(scaleX - 1) > 0.01
        || Math.abs(scaleY - 1) > 0.01;
      if (!changed) return;

      article.getAnimations().forEach((animation) => animation.cancel());
      article.animate([
        {
          transformOrigin: 'top left',
          transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
        },
        { transformOrigin: 'top left', transform: 'none' }
      ], {
        duration: 440,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
      });
    });
  }

  function applyPartnerState(article, expanded) {
    if (!partnerRoot) return;
    partnerRoot.querySelectorAll('[data-partner-id]').forEach((candidate) => {
      const isExpanded = expanded && candidate === article;
      const button = candidate.querySelector('[data-guide-partner-toggle]');
      const content = candidate.querySelector('.guide-partner-details');
      candidate.classList.toggle('is-expanded', isExpanded);
      button?.setAttribute('aria-expanded', String(isExpanded));
      button?.classList.toggle('is-open', isExpanded);
      content?.setAttribute('aria-hidden', String(!isExpanded));
      content?.toggleAttribute('inert', !isExpanded);
      const label = button?.querySelector('[data-guide-partner-toggle-label]');
      if (label) label.textContent = getText(isExpanded ? 'guidePage.partners.lessLabel' : 'guidePage.partners.moreLabel');
    });

    expandedPartnerId = expanded ? article?.dataset.partnerId || null : null;
    partnerRoot.classList.toggle('has-expanded', Boolean(expandedPartnerId));
  }

  function setPartnerExpanded(article, expanded, options = {}) {
    if (!article) return;
    const previousLayout = options.animate === false ? null : capturePartnerLayout();
    partnerRoot?.querySelectorAll('[data-partner-id]').forEach((candidate) => {
      candidate.getAnimations().forEach((animation) => animation.cancel());
    });
    applyPartnerState(article, expanded);
    animatePartnerLayout(previousLayout);
  }

  function renderPartners() {
    if (!partnerRoot) return;
    const partners = definitions
      .filter((definition) => definition.partner)
      .map(translated)
      .filter(Boolean);

    partnerRoot.innerHTML = partners.map(partnerMarkup).join('');

    if (expandedPartnerId) {
      const expandedArticle = partnerRoot.querySelector(`[data-partner-id="${CSS.escape(expandedPartnerId)}"]`);
      if (expandedArticle) setPartnerExpanded(expandedArticle, true, { animate: false });
      else expandedPartnerId = null;
    }

    partnerRoot.querySelectorAll('[data-guide-partner-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const article = button.closest('[data-partner-id]');
        const shouldExpand = button.getAttribute('aria-expanded') !== 'true';
        setPartnerExpanded(article, shouldExpand);
        if (shouldExpand) {
          window.setTimeout(() => article.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), reducedMotionQuery.matches ? 0 : 460);
        }
      });
    });

    partnerRoot.querySelectorAll('[data-guide-partner-open]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.guidePartnerOpen;
        setFilter('all');
        setView('map');
        selectOnMap(id, true);
      });
    });
  }

  function setFilter(nextFilter) {
    activeFilter = nextFilter;
    selectedId = null;
    resetVisibleLimit();
    filterButtons.forEach((button) => {
      const active = button.dataset.guideFilter === activeFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (mapTitle) mapTitle.textContent = getText('guidePage.map.title');
    if (mapLink) {
      mapLink.href = MAP_DEFAULT_URL;
      mapLink.textContent = getText('guidePage.map.openDefault');
    }
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

    if (viewMode === 'map' && guideMap) {
      window.setTimeout(() => guideMap.invalidateSize({ animate: false }), 0);
    }
  }

  function selectedDefinition() {
    return definitions.find((definition) => definition.id === selectedId) || null;
  }

  function resetMap() {
    selectedId = null;
    guideMap?.closePopup();
    mapCanvas?.setAttribute('aria-label', getText('guidePage.map.defaultTitle'));
    if (mapTitle) mapTitle.textContent = getText('guidePage.map.title');
    if (mapLink) {
      mapLink.href = MAP_DEFAULT_URL;
      mapLink.textContent = getText('guidePage.map.openDefault');
    }
    document.querySelectorAll('[data-guide-card]').forEach((card) => card.classList.remove('is-selected'));
    updateMapMarkers();
  }

  function selectOnMap(id, shouldScroll = false, { openPopup = true } = {}) {
    const definition = definitions.find((item) => item.id === id);
    const item = definition ? translated(definition) : null;
    if (!item) return;

    const previousId = selectedId;
    selectedId = id;
    setView('map');

    if (previousId && previousId !== id) {
      const previousDefinition = definitions.find((candidate) => candidate.id === previousId);
      const previousItem = previousDefinition ? translated(previousDefinition) : null;
      const previousMarker = mapMarkers.get(previousId);
      if (previousItem && previousMarker) previousMarker.setIcon(markerIcon(mapCategory(previousItem)));
    }

    mapCanvas?.setAttribute('aria-label', item.text.name);
    if (mapTitle) mapTitle.textContent = item.text.name;
    if (mapLink) {
      mapLink.href = directionsUrl(item, locationOrigin);
      mapLink.textContent = getText('guidePage.labels.directions');
    }

    const marker = mapMarkers.get(id);
    if (guideMap && marker) {
      marker.setIcon(markerIcon(mapCategory(item), { selected: true }));
      guideMap.setView(marker.getLatLng(), Math.max(guideMap.getZoom(), 13), {
        animate: !reducedMotionQuery.matches
      });
      if (openPopup) marker.openPopup();
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
      locationStatus.textContent = getText('guidePage.browser.locationDenied');
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
        locationLabel.textContent = getText('guidePage.browser.locationReady');
        locationStatus.textContent = '';
        renderResults();

        const selected = selectedDefinition();
        if (selected && mapLink) mapLink.href = directionsUrl(selected, locationOrigin);
      },
      () => {
        locationButton.disabled = false;
        locationStatus.textContent = getText('guidePage.browser.locationDenied');
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
    if (hash.startsWith('#partner-')) {
      const id = hash.slice('#partner-'.length);
      const article = document.getElementById(`partner-${id}`);
      if (!article) return;
      setPartnerExpanded(article, true, { animate: false });
      window.requestAnimationFrame(() => {
        article.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    if (!hash.startsWith('#guia-')) return;

    const id = hash.slice('#guia-'.length);
    if (!definitions.some((definition) => definition.id === id)) return;

    const targetIndex = visibleListings().findIndex((definition) => definition.id === id);
    if (targetIndex >= 0) visibleLimit = Math.max(visibleLimit, targetIndex + 1);
    setFilter('all');
    if (targetIndex >= 0) visibleLimit = Math.max(visibleLimit, targetIndex + 1);
    renderResults();
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

  window.addEventListener('hashchange', applyHashSelection);

  searchInput?.addEventListener('input', () => {
    searchTerm = searchInput.value;
    selectedId = null;
    resetVisibleLimit();
    if (mapTitle) mapTitle.textContent = getText('guidePage.map.title');
    if (mapLink) {
      mapLink.href = MAP_DEFAULT_URL;
      mapLink.textContent = getText('guidePage.map.openDefault');
    }
    renderResults();
  });

  sortSelect?.addEventListener('change', () => {
    sortMode = sortSelect.value;
    renderResults();
  });

  locationButton?.addEventListener('click', activateLocation);

  loadMoreButton?.addEventListener('click', () => {
    visibleLimit += compactPageSize;
    renderResults();
  });

  compactGuideQuery.addEventListener('change', () => {
    resetVisibleLimit();
    if (compactGuideQuery.matches) setView('list');
    renderResults();
  });

  document.addEventListener('language:changed', () => {
    definitions = resolveDefinitions();
    renderResults();
    renderPartners();
    applyHashSelection();

    if (locationOrigin) {
      locationLabel.textContent = getText('guidePage.browser.locationReady');
    }

    const selected = selectedDefinition();
    if (selected) selectOnMap(selected.id, false);
    else resetMap();
  });

  setView(viewMode);
  initInteractiveMap();
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
