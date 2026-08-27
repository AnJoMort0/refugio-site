import { SITE_CONFIG, buildWhatsAppUrl } from '../config/site-config.js';
import { getActiveLanguage, getCurrentDictionary, getNestedValue, setLanguage } from '../services/i18n.js';
import { loadGuestStayContext, subscribeToGuestStayUpdates } from '../services/guest-stay-provider.js';

const DIRECTORY = Object.freeze({
  emergency: [
    { id: 'hospital', phone: '+351255714000', mapUrl: 'https://maps.app.goo.gl/ojGNGTEoMBsWDqFn9' },
    { id: 'firefighters', phone: '+351255690550', mapUrl: 'https://maps.app.goo.gl/jQzLUeJN4hGqithZ6' },
    { id: 'gnr', phone: '+351255690380', mapUrl: 'https://www.google.com/maps/search/?api=1&query=GNR%20Castelo%20de%20Paiva%20Portugal' },
    { id: 'sns24', phone: '+351808242424' },
    { id: 'poison', phone: '+351808250250' }
  ],
  medical: [
    { id: 'healthExtension', mapUrl: 'https://maps.app.goo.gl/NvgyWjFqiDwiHJtQ7' },
    { id: 'usf', phone: '+351255690280', mapUrl: 'https://www.google.com/maps/search/?api=1&query=USF%20Paiva%20Douro%20Castelo%20de%20Paiva' },
    { id: 'pharmacyPinho', phone: '+351255762239', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Farm%C3%A1cia%20Pinho%20Lopes%20Avenida%20Jean%20Tyssen%20326%20Raiva%20Portugal' },
    { id: 'pharmacyAdriano', phone: '+351255689440', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Farm%C3%A1cia%20Adriano%20Moreira%20Castelo%20de%20Paiva' },
    { id: 'pharmacyCentral', phone: '+351255689310', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Farm%C3%A1cia%20Central%20Castelo%20de%20Paiva' }
  ],
  supermarkets: [
    { id: 'minimarket', time: 5, mapUrl: 'https://maps.app.goo.gl/zG7EZDhFEaHdvrN38' },
    { id: 'continente', time: 12, mapUrl: 'https://maps.app.goo.gl/Rx7fKLj4YfghfFPJ9' },
    { id: 'intermarcheCanedo', time: 13, mapUrl: 'https://maps.app.goo.gl/USW6w6id6t4vQLwi9' },
    { id: 'auchan', time: 17, mapUrl: 'https://maps.app.goo.gl/GCnHmkgsHZBYFdJY8' },
    { id: 'intermarchePaiva', time: 18, mapUrl: 'https://maps.app.goo.gl/Lx74bSzVy4PuwK9g7' }
  ],
  food: [
    { id: 'cantinho', time: 6, mapUrl: 'https://maps.app.goo.gl/pnAxRDRfNERaX2BU7' },
    { id: 'ramadinha', time: 7, phone: '+351255762046', mapUrl: 'https://maps.app.goo.gl/pMdsA6bPjHoaZu2w8', partnerId: 'adega-ramadinha', image: './assets/images/partners/ramadinha_1.jpg' },
    { id: 'espacoZ', time: 18, phone: '+351255689222', mapUrl: 'https://maps.app.goo.gl/YyqG2ZMFP4Vu12bL9' },
    { id: 'boavista', time: 17, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Boavista%20Castelo%20de%20Paiva' },
    { id: 'estacao4550', time: 17, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Esta%C3%A7%C3%A3o%204550%20Castelo%20de%20Paiva' }
  ],
  services: [
    { id: 'taxiSales', phone: '+351932254310', whatsapp: '+351932254310', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Taxi%20Sales%20Castelo%20de%20Paiva' },
    { id: 'taxisRaiva', phone: '+351255762616', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Taxis%20Centrais%20da%20Raiva%20Portugal' },
    { id: 'fuel', phone: '+351255699998', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Cepsa%20Sobrado%20Castelo%20de%20Paiva' }
  ]
});

const PARTNERS = Object.freeze([
  { id: 'adega-ramadinha', image: './assets/images/partners/ramadinha_1.jpg' },
  { id: 'corga', image: './assets/images/partners/corga_1.jpg' },
  { id: 'cafe-cruzeiro', image: './assets/images/partners/cruzeiro_1.jpg' },
  { id: 'aquapura', image: './assets/images/partners/aquapura_1.jpg' }
]);

const LUCIDE_PATHS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.11 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.59 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6"></path>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path>',
  mapPin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
  navigation: '<path d="m3 11 19-9-9 19-2-8-8-2Z"></path>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>',
  arrowRight: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>'
};

let stayContext = {
  personalised: false,
  stay: null,
  services: [{ id: 'bikes', enabled: true, price: 5, showOnGuestStay: true }]
};

function t(path) {
  return getNestedValue(getCurrentDictionary(), `guestStay.${path}`) ?? '';
}

function dictionaryValue(path) {
  return getNestedValue(getCurrentDictionary(), path);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function lucideIcon(name) {
  return `<svg class="lucide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LUCIDE_PATHS[name] || ''}</svg>`;
}

function formatTemplate(template, values = {}) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value ?? '')),
    String(template || '')
  );
}

function firstName(fullName) {
  return String(fullName || '').trim().split(/\s+/)[0] || '';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  const locales = { pt: 'pt-PT', en: 'en-GB', fr: 'fr-FR', es: 'es-ES' };
  return new Intl.DateTimeFormat(locales[getActiveLanguage()] || 'pt-PT', {
    day: 'numeric',
    month: 'short'
  }).format(date);
}

function formatCurrency(value) {
  const locales = { pt: 'pt-PT', en: 'en-GB', fr: 'fr-FR', es: 'es-ES' };
  return new Intl.NumberFormat(locales[getActiveLanguage()] || 'pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2
  }).format(Number(value || 0));
}

function telHref(phone) {
  return phone ? `tel:${String(phone).replace(/[^+\d]/g, '')}` : '';
}

function whatsappHref(phone, message = '') {
  return phone ? buildWhatsAppUrl(message, phone) : '';
}

function actionLink({ href, label, iconName, target = '' }) {
  const content = `${lucideIcon(iconName)}<span>${escapeHtml(label)}</span>`;
  if (!href) return `<button class="qr-mini-button is-disabled" type="button" disabled>${content}</button>`;
  return `<a class="qr-mini-button" href="${escapeHtml(href)}"${target ? ` target="${target}" rel="noopener"` : ''}>${content}</a>`;
}

function getBikeService() {
  return (stayContext.services || []).find((service) => service.id === 'bikes') || {
    id: 'bikes', enabled: true, price: 5, showOnGuestStay: true
  };
}

function renderStaySummary() {
  const root = document.querySelector('[data-qr-stay-summary]');
  if (!root) return;

  if (!stayContext.personalised || !stayContext.stay) {
    root.innerHTML = `<h1 id="qr-welcome-title">${escapeHtml(t('hero.genericTitle'))}</h1><p class="qr-lead">${escapeHtml(t('hero.genericText'))}</p>`;
    const checkout = document.querySelector('[data-qr-checkout-time]');
    if (checkout) checkout.textContent = '—';
    return;
  }

  const stay = stayContext.stay;
  const guestCount = Number(stay.adults || 0) + Number(stay.children || 0);
  const bikeService = getBikeService();
  const bikes = Number(stay.bikes?.count || 0);
  const bikeFact = bikeService.enabled && bikeService.showOnGuestStay !== false
    ? `<a class="qr-stay-fact" href="#bicicletas"><span>${escapeHtml(t('hero.bikesLabel'))}</span><strong>${bikes ? escapeHtml(String(bikes)) : escapeHtml(t('hero.noBikes'))}</strong></a>`
    : '';

  root.innerHTML = `
    <h1 id="qr-welcome-title">${escapeHtml(formatTemplate(t('hero.personalisedTitle'), { name: firstName(stay.guestName) }))}</h1>
    <p class="qr-lead">${escapeHtml(t('hero.personalisedText'))}</p>
    <div class="qr-stay-facts">
      <a class="qr-stay-fact" href="#casa"><span>${escapeHtml(t('hero.stayLabel'))}</span><strong class="qr-stay-date-range">${escapeHtml(formatDate(stay.checkIn))}${lucideIcon('arrowRight')}${escapeHtml(formatDate(stay.checkOut))}</strong></a>
      <a class="qr-stay-fact" href="#casa"><span>${escapeHtml(t('hero.checkoutLabel'))}</span><strong>${escapeHtml(formatDate(stay.checkOut))} · ${escapeHtml(stay.checkOutTime || '—')}</strong></a>
      <a class="qr-stay-fact" href="#casa"><span>${escapeHtml(t('hero.guestsLabel'))}</span><strong>${guestCount || '—'}</strong></a>
      ${bikeFact}
    </div>
  `;

  const checkout = document.querySelector('[data-qr-checkout-time]');
  if (checkout) checkout.textContent = `${formatDate(stay.checkOut)} · ${stay.checkOutTime || '—'}`;
}

function renderHosts() {
  const root = document.querySelector('[data-qr-hosts]');
  if (!root) return;
  const guestName = stayContext.stay?.guestName || t('hosts.genericGuestName');
  const message = formatTemplate(t('hosts.whatsappMessage'), { guestName });

  root.innerHTML = SITE_CONFIG.hosts.map((host) => `
    <article class="qr-host-card">
      <div class="qr-host-heading">
        <div><strong>${escapeHtml(host.name)}</strong><small>${escapeHtml(t(`hosts.roles.${host.roleKey}`))}</small></div>
        <span class="qr-status-chip">${escapeHtml(host.phone || host.whatsapp ? t('hosts.configured') : t('hosts.placeholder'))}</span>
      </div>
      <div class="qr-language-row">${host.languages.map((language) => `<span class="qr-language-chip">${escapeHtml(language)}</span>`).join('')}</div>
      <div class="qr-host-actions">
        ${actionLink({ href: telHref(host.phone), label: t('actions.call'), iconName: 'phone' })}
        ${actionLink({ href: whatsappHref(host.whatsapp, message), label: t('actions.whatsapp'), iconName: 'message', target: '_blank' })}
      </div>
    </article>
  `).join('');
}

function translatedDirectoryItem(group, item) {
  const text = t(`directory.${group}.${item.id}`) || {};
  return { ...item, name: text.name || '', detail: text.detail || '' };
}

function renderServiceList(selector, group, items) {
  const root = document.querySelector(selector);
  if (!root) return;
  root.innerHTML = items.map((descriptor) => translatedDirectoryItem(group, descriptor)).map((item) => `
    <article class="qr-service-card">
      <div><strong>${escapeHtml(item.name)}</strong>${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ''}</div>
      <div class="qr-service-actions">
        ${item.phone ? actionLink({ href: telHref(item.phone), label: t('actions.call'), iconName: 'phone' }) : ''}
        ${item.whatsapp ? actionLink({ href: whatsappHref(item.whatsapp), label: t('actions.whatsapp'), iconName: 'message', target: '_blank' }) : ''}
        ${item.mapUrl ? actionLink({ href: item.mapUrl, label: t('actions.map'), iconName: 'mapPin', target: '_blank' }) : ''}
      </div>
    </article>
  `).join('');
}

function renderWifi() {
  const root = document.querySelector('[data-qr-wifi]');
  if (!root) return;
  const wifi = SITE_CONFIG.wifi;
  const hasNetwork = Boolean(wifi.ssid);
  const hasPassword = Boolean(wifi.password);
  root.innerHTML = `
    <div class="qr-wifi-fields">
      <div class="qr-wifi-field">
        <div><span>${escapeHtml(t('wifi.network'))}</span><strong>${escapeHtml(wifi.ssid || t('wifi.toConfigure'))}</strong></div>
        <button class="qr-mini-button${hasNetwork ? '' : ' is-disabled'}" type="button"${hasNetwork ? ` data-copy-value="${escapeHtml(wifi.ssid)}"` : ' disabled'}>${lucideIcon('copy')}<span>${escapeHtml(t('actions.copy'))}</span></button>
      </div>
      <div class="qr-wifi-field">
        <div><span>${escapeHtml(t('wifi.password'))}</span><strong>${escapeHtml(wifi.password || t('wifi.toConfigure'))}</strong></div>
        <button class="qr-mini-button${hasPassword ? '' : ' is-disabled'}" type="button"${hasPassword ? ` data-copy-value="${escapeHtml(wifi.password)}"` : ' disabled'}>${lucideIcon('copy')}<span>${escapeHtml(t('actions.copy'))}</span></button>
      </div>
    </div>
  `;
}

function renderPlaces(selector, group, items) {
  const root = document.querySelector(selector);
  if (!root) return;
  root.innerHTML = items.map((descriptor) => translatedDirectoryItem(group, descriptor)).map((item) => `
    <article class="qr-place-card">
      ${item.image ? `<img class="qr-place-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" data-optional-image />` : ''}
      <div class="qr-place-main">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          ${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ''}
          <div class="qr-place-meta">
            ${Number.isFinite(item.time) ? `<span class="qr-time-chip">${escapeHtml(formatTemplate(t('nearby.minutes'), { count: item.time }))}</span>` : ''}
            ${item.partnerId ? `<a class="qr-partner-chip" href="./guia-local.html#partner-${escapeHtml(item.partnerId)}">${escapeHtml(t('actions.partner'))}</a>` : ''}
          </div>
        </div>
      </div>
      <div class="qr-place-actions">
        ${item.phone ? actionLink({ href: telHref(item.phone), label: t('actions.call'), iconName: 'phone' }) : ''}
        ${item.whatsapp ? actionLink({ href: whatsappHref(item.whatsapp), label: t('actions.whatsapp'), iconName: 'message', target: '_blank' }) : ''}
        ${item.mapUrl ? actionLink({ href: item.mapUrl, label: t('actions.directions'), iconName: 'navigation', target: '_blank' }) : ''}
      </div>
    </article>
  `).join('');

  root.querySelectorAll('[data-optional-image]').forEach((image) => {
    image.addEventListener('error', () => image.remove(), { once: true });
  });
}

function renderSponsors() {
  const root = document.querySelector('[data-qr-sponsors]');
  if (!root) return;
  root.innerHTML = PARTNERS.map((partner) => {
    const listing = dictionaryValue(`guidePage.listings.${partner.id}`) || {};
    return `
      <a class="qr-partner-card" href="./guia-local.html#partner-${escapeHtml(partner.id)}">
        <img src="${escapeHtml(partner.image)}" alt="${escapeHtml(listing.name || '')}" loading="lazy" decoding="async" />
        <div class="qr-partner-content"><span class="qr-partner-chip">${escapeHtml(t('actions.partner'))}</span><strong>${escapeHtml(listing.name || '')}</strong><p>${escapeHtml(listing.description || '')}</p><span class="qr-partner-link">${escapeHtml(t('partners.openPartner'))}${lucideIcon('arrowRight')}</span></div>
      </a>
    `;
  }).join('');
}

function renderBikeCard() {
  const section = document.querySelector('[data-qr-bike-section]');
  const root = document.querySelector('[data-qr-bike]');
  if (!section || !root) return;
  const service = getBikeService();
  const visible = service.enabled !== false && service.showOnGuestStay !== false;
  section.hidden = !visible;
  if (!visible) return;

  const bikes = Number(stayContext.stay?.bikes?.count || 0);
  const host = SITE_CONFIG.hosts.find((contact) => contact.whatsapp) || SITE_CONFIG.hosts.find((contact) => contact.phone);
  const guestName = stayContext.stay?.guestName || t('hosts.genericGuestName');
  const requestMessage = formatTemplate(t('bikes.whatsappMessage'), { guestName });

  if (stayContext.personalised && bikes > 0) {
    root.innerHTML = `<strong>${escapeHtml(formatTemplate(t('bikes.alreadyBookedTitle'), { count: bikes }))}</strong><p>${escapeHtml(t('bikes.alreadyBookedText'))}</p>`;
    return;
  }

  root.innerHTML = `
    <strong>${escapeHtml(t('bikes.availableTitle'))}</strong>
    <div class="qr-bike-price"><strong>${escapeHtml(formatCurrency(service.price))}</strong><span>${escapeHtml(t('bikes.priceUnit'))}</span></div>
    <p>${escapeHtml(t('bikes.text'))}</p>
    <div class="qr-host-actions">${actionLink({ href: whatsappHref(host?.whatsapp, requestMessage), label: t('bikes.requestCta'), iconName: 'message', target: '_blank' })}</div>
  `;
}

function renderFullRules() {
  const root = document.querySelector('[data-qr-full-rules]');
  if (!root) return;
  const rules = dictionaryValue('rulesFull') || {};
  const categories = Object.values(rules).filter((value) => value && typeof value === 'object' && !Array.isArray(value) && value.title);
  root.innerHTML = categories.map((category) => {
    const items = Object.entries(category)
      .filter(([key, value]) => /^item\d+$/.test(key) && value)
      .sort(([a], [b]) => Number(a.slice(4)) - Number(b.slice(4)))
      .map(([, value]) => `<li>${escapeHtml(value)}</li>`)
      .join('');
    return `<section class="qr-rule-group"><h3>${escapeHtml(category.title)}</h3>${items ? `<ul>${items}</ul>` : ''}${category.note ? `<p>${escapeHtml(category.note)}</p>` : ''}</section>`;
  }).join('');
}

function switchNearbyTab(button) {
  const key = button.dataset.qrTab;
  document.querySelectorAll('[data-qr-tab]').forEach((candidate) => {
    const active = candidate === button;
    candidate.classList.toggle('is-active', active);
    candidate.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-qr-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.qrPanel !== key;
  });
}

async function copyText(value) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  showToast(t('actions.copied'));
}

function showToast(message) {
  document.querySelector('.qr-toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'qr-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

function renderAll() {
  renderStaySummary();
  renderHosts();
  renderServiceList('[data-qr-emergency-list]', 'emergency', DIRECTORY.emergency);
  renderServiceList('[data-qr-medical-list]', 'medical', DIRECTORY.medical);
  renderWifi();
  renderPlaces('[data-qr-food]', 'food', DIRECTORY.food);
  renderPlaces('[data-qr-supermarkets]', 'supermarkets', DIRECTORY.supermarkets);
  renderPlaces('[data-qr-services]', 'services', DIRECTORY.services);
  renderSponsors();
  renderBikeCard();
  renderFullRules();
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const copyButton = event.target.closest('[data-copy-value]');
    if (copyButton) copyText(copyButton.dataset.copyValue || '');

    const tab = event.target.closest('[data-qr-tab]');
    if (tab) switchNearbyTab(tab);

    const rulesLink = event.target.closest('[data-open-stay-rules]');
    if (rulesLink) {
      const rules = document.querySelector('#regras-estadia');
      if (rules) rules.open = true;
    }
  });

  document.addEventListener('language:changed', renderAll);
}

function bindBottomNavigation() {
  const links = [...document.querySelectorAll('.qr-bottom-nav a[href^="#"]')];
  if (!links.length) return;

  const setActiveLink = (id) => {
    links.forEach((link) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  links.forEach((link) => link.addEventListener('click', () => setActiveLink(link.hash.slice(1))));
  setActiveLink((window.location.hash || '#inicio').slice(1));

  if (!('IntersectionObserver' in window)) return;
  const targets = links.map((link) => document.querySelector(link.hash)).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) setActiveLink(visible.target.id);
  }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.15, 0.4] });
  targets.forEach((target) => observer.observe(target));
}

async function refreshStayContext({ syncReservationLanguage = false } = {}) {
  stayContext = await loadGuestStayContext();
  const reservationLanguage = stayContext.stay?.preferredLanguage;
  const supportedLanguages = new Set(['pt', 'en', 'fr', 'es']);

  if (
    syncReservationLanguage
    && stayContext.personalised
    && supportedLanguages.has(reservationLanguage)
    && reservationLanguage !== getActiveLanguage()
  ) {
    await setLanguage(reservationLanguage);
  }

  renderAll();
  const page = document.querySelector('[data-qr-page]');
  if (page) {
    page.dataset.staySource = stayContext.source || 'generic';
    page.dataset.personalised = String(Boolean(stayContext.personalised));
  }
}

export async function initGuestStayPage() {
  if (!document.querySelector('[data-qr-page]')) return;
  await refreshStayContext({ syncReservationLanguage: true });
  bindEvents();
  bindBottomNavigation();

  subscribeToGuestStayUpdates(() => {
    refreshStayContext().catch((error) => console.warn('Guest Stay could not refresh reservation data.', error));
  });
}
