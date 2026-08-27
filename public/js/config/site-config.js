export const SITE_CONFIG = Object.freeze({
  property: Object.freeze({
    name: 'O Refúgio',
    address: 'Rua da Arejinha 627, 4550-518 Pedorido',
    coordinates: Object.freeze([41.0204812, -8.3823133]),
    mapsUrl: 'https://www.google.com/maps/place/O+Ref%C3%BAgio/@41.0204812,-8.3823133,17z/data=!4m6!3m5!1s0xd24830c21a7821f:0x7babb9259b50311a!8m2!3d41.0204812!4d-8.3823133!16s%2Fg%2F11vqhfvg0k',
    mapsEmbedUrl: 'https://www.google.com/maps?q=Rua%20da%20Arejinha%20627%2C%204550-518%20Pedorido&output=embed',
    reviewUrl: 'https://www.google.com/maps/place/O+Ref%C3%BAgio/@41.0204812,-8.3823133,17z/data=!4m8!3m7!1s0xd24830c21a7821f:0x7babb9259b50311a!8m2!3d41.0204812!4d-8.3823133!9m1!1b1!16s%2Fg%2F11vqhfvg0k'
  }),
  contact: Object.freeze({
    email: 'reservas@orefugio.example',
    phoneDisplay: '+351 000 000 000',
    phoneHref: '+351000000000',
    whatsappNumber: ''
  }),
  hosts: Object.freeze([
    Object.freeze({ id: 'host-1', name: 'Contacto 1', roleKey: 'primary', languages: ['PT', 'EN'], phone: '', whatsapp: '' }),
    Object.freeze({ id: 'host-2', name: 'Contacto 2', roleKey: 'staySupport', languages: ['PT', 'FR'], phone: '', whatsapp: '' }),
    Object.freeze({ id: 'host-3', name: 'Contacto 3', roleKey: 'staySupport', languages: ['PT', 'ES'], phone: '', whatsapp: '' })
  ]),
  wifi: Object.freeze({
    ssid: '',
    password: '',
    security: 'WPA'
  }),
  social: Object.freeze({
    facebook: 'https://example.com/REFUGIO_FACEBOOK_URL_REPLACE_ME',
    instagram: 'https://example.com/REFUGIO_INSTAGRAM_URL_REPLACE_ME'
  }),
  creator: Object.freeze({
    name: 'André Fonseca',
    url: 'https://linktr.ee/anjomorto'
  }),
  map: Object.freeze({
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }),
  guestStay: Object.freeze({
    checkoutWasteMapUrl: 'https://www.google.com/maps/place/41%C2%B001%2716.7%22N+8%C2%B022%2755.8%22W/@41.02131,-8.3828171,153m/data=!3m2!1e3!4b1!4m3!8m2!3d41.02131!4d-8.382172'
  })
});

export function buildWhatsAppUrl(message = '', phoneNumber = SITE_CONFIG.contact.whatsappNumber) {
  const normalizedNumber = String(phoneNumber || '').replace(/\D/g, '');
  const destination = normalizedNumber ? `https://wa.me/${normalizedNumber}` : 'https://wa.me/';
  return message ? `${destination}?text=${encodeURIComponent(message)}` : destination;
}

export function applySiteConfig(root = document, dictionary = {}) {
  const valueMap = {
    address: SITE_CONFIG.property.address,
    email: SITE_CONFIG.contact.email,
    phone: SITE_CONFIG.contact.phoneDisplay
  };

  root.querySelectorAll('[data-site-value]').forEach((element) => {
    const value = valueMap[element.dataset.siteValue];
    if (value !== undefined) element.textContent = value;
  });

  const linkMap = {
    maps: SITE_CONFIG.property.mapsUrl,
    review: SITE_CONFIG.property.reviewUrl,
    email: `mailto:${SITE_CONFIG.contact.email}`,
    phone: `tel:${SITE_CONFIG.contact.phoneHref}`,
    facebook: SITE_CONFIG.social.facebook,
    instagram: SITE_CONFIG.social.instagram,
    creator: SITE_CONFIG.creator.url,
    checkoutWaste: SITE_CONFIG.guestStay.checkoutWasteMapUrl
  };

  root.querySelectorAll('[data-site-link]').forEach((element) => {
    const href = linkMap[element.dataset.siteLink];
    if (href) element.setAttribute('href', href);
  });

  const sourceMap = {
    mapsEmbed: SITE_CONFIG.property.mapsEmbedUrl
  };

  root.querySelectorAll('[data-site-src]').forEach((element) => {
    const source = sourceMap[element.dataset.siteSrc];
    if (source) element.setAttribute('src', source);
  });

  const whatsappMessage = dictionary.footer?.whatsappMessage || '';
  root.querySelectorAll('[data-site-whatsapp]').forEach((element) => {
    const message = element.dataset.whatsappMessage || whatsappMessage;
    element.setAttribute('href', buildWhatsAppUrl(message));
  });

  root.querySelectorAll('[data-site-copy]').forEach((element) => {
    const value = valueMap[element.dataset.siteCopy];
    if (value !== undefined) element.dataset.copyValue = value;
  });
}
