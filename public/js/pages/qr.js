import { getActiveLanguage, getCurrentDictionary, getNestedValue, setLanguage } from '../services/i18n.js';
import { loadGuestStayContext, subscribeToGuestStayUpdates } from '../services/guest-stay-provider.js';

/*
  Guest-specific stay data now comes through ../services/guest-stay-provider.js.

  During this prototype that provider reads the same-origin admin localStorage and returns
  only the fields this page needs. In production, replace that provider's internals with
  the private database + expiring stay-token API described there, without changing this UI.
*/

// Fill the phone / WhatsApp values when the owner contacts are approved.
// Empty values intentionally render disabled actions instead of fake telephone links.
const HOST_CONTACTS = [
  { id: 'host-1', name: 'Contacto 1', role: 'Anfitrião principal', languages: ['PT', 'EN'], phone: '', whatsapp: '' },
  { id: 'host-2', name: 'Contacto 2', role: 'Apoio à estadia', languages: ['PT', 'FR'], phone: '', whatsapp: '' },
  { id: 'host-3', name: 'Contacto 3', role: 'Apoio à estadia', languages: ['PT', 'ES'], phone: '', whatsapp: '' }
];

const WIFI_CONFIG = {
  ssid: '',
  password: '',
  security: 'WPA'
};

const EMERGENCY_CONTACTS = [
  {
    name: 'Bombeiros Voluntários de Castelo de Paiva',
    detail: 'Socorro local · Sobrado',
    phone: '+351255690550',
    mapUrl: 'https://maps.app.goo.gl/jQzLUeJN4hGqithZ6'
  },
  {
    name: 'GNR — Castelo de Paiva',
    detail: 'Posto territorial · Zona Industrial de Felgueiras',
    phone: '+351255690380',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=GNR%20Castelo%20de%20Paiva%20Portugal'
  },
  {
    name: 'SNS 24',
    detail: 'Aconselhamento de saúde 24h',
    phone: '+351808242424'
  },
  {
    name: 'CIAV — Centro de Informação Antivenenos',
    detail: 'Informação em caso de intoxicação',
    phone: '+351808250250'
  }
];

const HEALTH_CONTACTS = [
  {
    name: 'Extensão de Saúde de Oliveira do Arda',
    detail: '~6 min · unidade local mais próxima',
    mapUrl: 'https://maps.app.goo.gl/NvgyWjFqiDwiHJtQ7'
  },
  {
    name: 'USF Paiva Douro',
    detail: 'Castelo de Paiva · dias úteis 08:00–20:00',
    phone: '+351255690280',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=USF%20Paiva%20Douro%20Castelo%20de%20Paiva'
  },
  {
    name: 'Hospital Padre Américo',
    detail: '~35 min · urgência hospitalar em Penafiel',
    phone: '+351255714000',
    mapUrl: 'https://maps.app.goo.gl/ojGNGTEoMBsWDqFn9'
  }
];

const PHARMACIES = [
  {
    name: 'Farmácia Pinho Lopes',
    detail: 'Oliveira do Arda / Raiva · Av. Jean Tyssen 326',
    phone: '+351255762239',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Farm%C3%A1cia%20Pinho%20Lopes%20Avenida%20Jean%20Tyssen%20326%20Raiva%20Portugal'
  },
  {
    name: 'Farmácia Adriano Moreira',
    detail: 'Castelo de Paiva · Praça da República 11',
    phone: '+351255689440',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Farm%C3%A1cia%20Adriano%20Moreira%20Castelo%20de%20Paiva'
  },
  {
    name: 'Farmácia Central',
    detail: 'Castelo de Paiva · Rua Dr. Sá Carneiro 22',
    phone: '+351255689310',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Farm%C3%A1cia%20Central%20Castelo%20de%20Paiva'
  }
];

const SUPERMARKETS = [
  { name: 'Minimercado Soares da Costa & Lda – Póvoa', time: 5, mapUrl: 'https://maps.app.goo.gl/zG7EZDhFEaHdvrN38' },
  { name: 'Continente – Canedo', time: 12, mapUrl: 'https://maps.app.goo.gl/Rx7fKLj4YfghfFPJ9' },
  { name: 'Intermarché – Canedo', time: 13, mapUrl: 'https://maps.app.goo.gl/USW6w6id6t4vQLwi9' },
  { name: 'Auchan – Castelo de Paiva', time: 17, mapUrl: 'https://maps.app.goo.gl/GCnHmkgsHZBYFdJY8' },
  { name: 'Intermarché – Castelo de Paiva', time: 18, mapUrl: 'https://maps.app.goo.gl/Lx74bSzVy4PuwK9g7' }
];

const FOOD = [
  { name: 'O Cantinho – Oliveira do Arda', time: 6, mapUrl: 'https://maps.app.goo.gl/pnAxRDRfNERaX2BU7' },
  { name: 'Adega Ramadinha – Pedorido', time: 7, phone: '+351255762046', mapUrl: 'https://maps.app.goo.gl/pMdsA6bPjHoaZu2w8', partner: true },
  { name: 'Pizzaria Espaço Z – Castelo de Paiva', time: 18, phone: '+351255689222', mapUrl: 'https://maps.app.goo.gl/YyqG2ZMFP4Vu12bL9' },
  { name: 'Boavista – Castelo de Paiva', time: 17, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Boavista%20Castelo%20de%20Paiva' },
  { name: 'Estação 4550 – Castelo de Paiva', time: 17, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Esta%C3%A7%C3%A3o%204550%20Castelo%20de%20Paiva' }
];

const SERVICES = [
  {
    name: 'Táxi Sales — Castelo de Paiva',
    detail: 'Táxi local · chamada e WhatsApp',
    phone: '+351932254310',
    whatsapp: '+351932254310',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Taxi%20Sales%20Castelo%20de%20Paiva'
  },
  {
    name: 'Táxis Centrais da Raiva',
    detail: 'Serviço local na zona Raiva / Pedorido',
    phone: '+351255762616',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Taxis%20Centrais%20da%20Raiva%20Portugal'
  },
  {
    name: 'Posto de abastecimento Cepsa — Sobrado',
    detail: 'Combustível · Castelo de Paiva',
    phone: '+351255699998',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Cepsa%20Sobrado%20Castelo%20de%20Paiva'
  },
  {
    name: 'Lavandaria Celestinha',
    detail: 'Lavandaria · Castelo de Paiva',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Lavandaria%20Celestinha%20Castelo%20de%20Paiva'
  }
];

const SPONSORS = [
  {
    name: 'Adega Ramadinha',
    text: 'Especialidades locais em Pedorido.',
    image: './assets/images/partners/ramadinha_1.jpg',
    mapUrl: 'https://maps.app.goo.gl/pMdsA6bPjHoaZu2w8'
  },
  {
    name: 'Corga',
    text: 'Provas e produtos locais.',
    image: './assets/images/partners/corga_1.jpg',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Corga%20Castelo%20de%20Paiva%20Portugal'
  },
  {
    name: 'Café Cruzeiro',
    text: 'Pastelaria e paragem local.',
    image: './assets/images/partners/cruzeiro_1.jpg',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Caf%C3%A9%20Cruzeiro%20Pedorido%20Castelo%20de%20Paiva'
  },
  {
    name: 'Aquapura Terrace',
    text: 'Bar junto ao rio.',
    image: './assets/images/partners/aquapura_1.jpg',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Aquapura%20Terrace%20Pedorido%20Castelo%20de%20Paiva'
  }
];

let stayContext = { personalised: false, stay: null };

function t(path, fallback = '') {
  return getNestedValue(getCurrentDictionary(), `guestStay.${path}`) ?? fallback;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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
  const locale = getActiveLanguage() === 'pt' ? 'pt-PT' : getActiveLanguage();
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}

function getGuestCount(stay) {
  return Number(stay?.adults || 0) + Number(stay?.children || 0);
}

function telHref(phone) {
  return phone ? `tel:${String(phone).replace(/[^+\d]/g, '')}` : '';
}

function whatsappHref(phone, message = '') {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

function actionLink({ href, label, className = 'qr-mini-button', target = '' }) {
  if (!href) return `<button class="${className} is-disabled" type="button" disabled>${escapeHtml(label)}</button>`;
  return `<a class="${className}" href="${escapeHtml(href)}"${target ? ` target="${target}" rel="noopener"` : ''}>${escapeHtml(label)}</a>`;
}

function renderStaySummary() {
  const root = document.querySelector('[data-qr-stay-summary]');
  const badge = document.querySelector('[data-qr-demo-badge]');
  if (!root) return;

  if (!stayContext.personalised || !stayContext.stay) {
    if (badge) badge.hidden = true;
    root.innerHTML = `
      <h1 id="qr-welcome-title">${escapeHtml(t('hero.genericTitle', 'Bem-vindo ao O Refúgio.'))}</h1>
      <p class="qr-lead">${escapeHtml(t('hero.genericText', 'Tudo o que pode precisar durante a estadia, num só lugar.'))}</p>
    `;
    const checkout = document.querySelector('[data-qr-checkout-time]');
    if (checkout) checkout.textContent = '—';
    return;
  }

  const stay = stayContext.stay;
  // The old badge was only for the fake ?demo=1 provider. Real prototype data comes from admin localStorage.
  if (badge) badge.hidden = true;
  const title = formatTemplate(t('hero.personalisedTitle', 'Olá, {name} 👋'), { name: firstName(stay.guestName) });
  const guestCount = getGuestCount(stay);
  const bikes = Number(stay.bikes?.count || 0);

  root.innerHTML = `
    <h1 id="qr-welcome-title">${escapeHtml(title)}</h1>
    <p class="qr-lead">${escapeHtml(t('hero.personalisedText', 'Esperamos que esteja a desfrutar da estadia. Aqui encontra rapidamente o essencial.'))}</p>
    <div class="qr-stay-facts">
      <div class="qr-stay-fact"><span>${escapeHtml(t('hero.stayLabel', 'Estadia'))}</span><strong>${escapeHtml(formatDate(stay.checkIn))} → ${escapeHtml(formatDate(stay.checkOut))}</strong></div>
      <div class="qr-stay-fact"><span>${escapeHtml(t('hero.checkoutLabel', 'Check-out'))}</span><strong>${escapeHtml(formatDate(stay.checkOut))} · ${escapeHtml(stay.checkOutTime || '—')}</strong></div>
      <div class="qr-stay-fact"><span>${escapeHtml(t('hero.guestsLabel', 'Hóspedes'))}</span><strong>${guestCount || '—'}</strong></div>
      <div class="qr-stay-fact"><span>${escapeHtml(t('hero.bikesLabel', 'Bicicletas'))}</span><strong>${bikes ? escapeHtml(String(bikes)) : escapeHtml(t('hero.noBikes', 'Não reservadas'))}</strong></div>
    </div>
  `;

  const checkout = document.querySelector('[data-qr-checkout-time]');
  if (checkout) checkout.textContent = `${formatDate(stay.checkOut)} · ${stay.checkOutTime || '—'}`;
}

function renderHosts() {
  const root = document.querySelector('[data-qr-hosts]');
  if (!root) return;
  const message = t('hosts.whatsappMessage', 'Olá! Estou hospedado no O Refúgio e preciso de ajuda.');
  root.innerHTML = HOST_CONTACTS.map((host) => `
    <article class="qr-host-card">
      <div class="qr-host-heading">
        <div>
          <strong>${escapeHtml(host.name)}</strong>
          <small>${escapeHtml(host.role)}</small>
        </div>
        <span class="qr-status-chip">${host.phone || host.whatsapp ? escapeHtml(t('hosts.configured', 'Disponível')) : escapeHtml(t('hosts.placeholder', 'A configurar'))}</span>
      </div>
      <div class="qr-language-row">${host.languages.map((lang) => `<span class="qr-language-chip">${escapeHtml(lang)}</span>`).join('')}</div>
      <div class="qr-host-actions">
        ${actionLink({ href: telHref(host.phone), label: t('actions.call', 'Ligar') })}
        ${actionLink({ href: whatsappHref(host.whatsapp, message), label: t('actions.whatsapp', 'WhatsApp'), target: '_blank' })}
      </div>
    </article>
  `).join('');
}

function renderServiceList(selector, items) {
  const root = document.querySelector(selector);
  if (!root) return;
  root.innerHTML = items.map((item) => `
    <article class="qr-service-card">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        ${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ''}
      </div>
      <div class="qr-service-actions">
        ${item.phone ? actionLink({ href: telHref(item.phone), label: t('actions.call', 'Ligar') }) : ''}
        ${item.whatsapp ? actionLink({ href: whatsappHref(item.whatsapp), label: t('actions.whatsapp', 'WhatsApp'), target: '_blank' }) : ''}
        ${item.mapUrl ? actionLink({ href: item.mapUrl, label: t('actions.map', 'Mapa'), target: '_blank' }) : ''}
      </div>
    </article>
  `).join('');
}

function renderWifi() {
  const root = document.querySelector('[data-qr-wifi]');
  if (!root) return;
  const hasWifi = Boolean(WIFI_CONFIG.ssid && WIFI_CONFIG.password);
  root.innerHTML = `
    <div class="qr-wifi-fields">
      <div class="qr-wifi-field">
        <div><span>${escapeHtml(t('wifi.network', 'Rede'))}</span><strong>${escapeHtml(WIFI_CONFIG.ssid || t('wifi.toConfigure', 'A configurar'))}</strong></div>
        <button class="qr-mini-button${hasWifi ? '' : ' is-disabled'}" type="button"${hasWifi ? ` data-copy-value="${escapeHtml(WIFI_CONFIG.ssid)}"` : ' disabled'}>${escapeHtml(t('actions.copy', 'Copiar'))}</button>
      </div>
      <div class="qr-wifi-field">
        <div><span>${escapeHtml(t('wifi.password', 'Palavra-passe'))}</span><strong>${escapeHtml(hasWifi ? WIFI_CONFIG.password : t('wifi.toConfigure', 'A configurar'))}</strong></div>
        <button class="qr-mini-button${hasWifi ? '' : ' is-disabled'}" type="button"${hasWifi ? ` data-copy-value="${escapeHtml(WIFI_CONFIG.password)}"` : ' disabled'}>${escapeHtml(t('actions.copy', 'Copiar'))}</button>
      </div>
    </div>
    <div class="qr-wifi-qr-placeholder">
      <div>
        <strong>${escapeHtml(hasWifi ? t('wifi.qrReadyTitle', 'QR Wi-Fi pronto para gerar') : t('wifi.qrPlaceholderTitle', 'QR Wi-Fi'))}</strong>
        <p>${escapeHtml(hasWifi ? t('wifi.qrReadyText', 'Ligar o gerador de QR quando a biblioteca escolhida estiver aprovada.') : t('wifi.qrPlaceholderText', 'Será gerado automaticamente quando as credenciais forem configuradas.'))}</p>
      </div>
    </div>
  `;
}

function renderPlaces(selector, items) {
  const root = document.querySelector(selector);
  if (!root) return;
  root.innerHTML = items.map((item) => `
    <article class="qr-place-card">
      <div class="qr-place-main">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          ${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ''}
          <div class="qr-place-meta">
            ${Number.isFinite(item.time) ? `<span class="qr-time-chip">~${escapeHtml(item.time)} min</span>` : ''}
            ${item.partner ? `<span class="qr-partner-chip">${escapeHtml(t('actions.partner', 'Parceiro'))}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="qr-place-actions">
        ${item.phone ? actionLink({ href: telHref(item.phone), label: t('actions.call', 'Ligar') }) : ''}
        ${item.whatsapp ? actionLink({ href: whatsappHref(item.whatsapp), label: t('actions.whatsapp', 'WhatsApp'), target: '_blank' }) : ''}
        ${item.mapUrl ? actionLink({ href: item.mapUrl, label: t('actions.directions', 'Como chegar'), target: '_blank' }) : ''}
      </div>
    </article>
  `).join('');
}

function renderSponsors() {
  const root = document.querySelector('[data-qr-sponsors]');
  if (!root) return;
  root.innerHTML = SPONSORS.map((sponsor) => `
    <article class="qr-partner-card">
      <img src="${escapeHtml(sponsor.image)}" alt="" loading="lazy" decoding="async" data-optional-image />
      <div class="qr-partner-content">
        <span class="qr-partner-chip">${escapeHtml(t('actions.partner', 'Parceiro'))}</span>
        <strong>${escapeHtml(sponsor.name)}</strong>
        <p>${escapeHtml(sponsor.text)}</p>
        ${actionLink({ href: sponsor.mapUrl, label: t('actions.directions', 'Como chegar'), target: '_blank' })}
      </div>
    </article>
  `).join('');

  root.querySelectorAll('[data-optional-image]').forEach((image) => {
    image.addEventListener('error', () => image.remove(), { once: true });
  });
}

function renderBikeCard() {
  const root = document.querySelector('[data-qr-bike]');
  if (!root) return;
  const bikes = Number(stayContext.stay?.bikes?.count || 0);
  const host = HOST_CONTACTS.find((contact) => contact.whatsapp) || HOST_CONTACTS.find((contact) => contact.phone);
  const requestMessage = t('bikes.whatsappMessage', 'Olá! Gostaria de pedir bicicletas durante a minha estadia no O Refúgio.');

  if (stayContext.personalised && bikes > 0) {
    root.innerHTML = `
      <strong>${escapeHtml(formatTemplate(t('bikes.alreadyBookedTitle', 'Já tem {count} bicicleta(s) na reserva.'), { count: bikes }))}</strong>
      <p>${escapeHtml(t('bikes.alreadyBookedText', 'Mostramos a reserva existente em vez de voltar a vender o mesmo extra.'))}</p>
    `;
    return;
  }

  root.innerHTML = `
    <strong>${escapeHtml(t('bikes.availableTitle', 'Bicicletas durante a estadia'))}</strong>
    <div class="qr-bike-price"><strong>€5</strong><span>${escapeHtml(t('bikes.priceUnit', 'por bicicleta / dia'))}</span></div>
    <p>${escapeHtml(t('bikes.text', 'Pedido sujeito a disponibilidade e confirmação do anfitrião. Máximo previsto: uma bicicleta por hóspede e por dia.'))}</p>
    <div class="qr-host-actions">
      ${actionLink({ href: host?.whatsapp ? whatsappHref(host.whatsapp, requestMessage) : '', label: t('bikes.requestCta', 'Pedir por WhatsApp'), target: '_blank' })}
    </div>
  `;
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
  showToast(t('actions.copied', 'Copiado.'));
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
  renderServiceList('[data-qr-emergency-list]', EMERGENCY_CONTACTS);
  renderServiceList('[data-qr-health-list]', HEALTH_CONTACTS);
  renderServiceList('[data-qr-pharmacy-list]', PHARMACIES);
  renderWifi();
  renderPlaces('[data-qr-supermarkets]', SUPERMARKETS);
  renderPlaces('[data-qr-food]', FOOD);
  renderPlaces('[data-qr-services]', SERVICES);
  renderSponsors();
  renderBikeCard();
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const copyButton = event.target.closest('[data-copy-value]');
    if (copyButton) copyText(copyButton.dataset.copyValue || '');

    const tab = event.target.closest('[data-qr-tab]');
    if (tab) switchNearbyTab(tab);
  });

  document.addEventListener('language:changed', renderAll);
}

async function refreshStayContext({ syncReservationLanguage = false } = {}) {
  stayContext = await loadGuestStayContext();

  const reservationLanguage = stayContext.stay?.preferredLanguage;
  const supportedReservationLanguages = new Set(['pt', 'en', 'fr', 'es']);

  if (
    syncReservationLanguage &&
    stayContext.personalised &&
    supportedReservationLanguages.has(reservationLanguage) &&
    reservationLanguage !== getActiveLanguage()
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
  const page = document.querySelector('[data-qr-page]');
  if (!page) return;

  await refreshStayContext({ syncReservationLanguage: true });
  bindEvents();

  // If the admin is open in another tab on the same browser/origin, saving a reservation
  // updates this guest page automatically through the browser "storage" event.
  subscribeToGuestStayUpdates(() => {
    refreshStayContext().catch((error) => {
      console.warn('Guest Stay: could not refresh reservation data.', error);
    });
  });
}
