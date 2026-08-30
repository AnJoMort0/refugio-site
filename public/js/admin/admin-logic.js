import { addDays, formatDateKey, parseDateKey } from './admin-seed.js';
import { diffCalendarDays, monthDayOrdinal } from '../utils/date.js';
import { SITE_CONFIG } from '../config/site-config.js';
import { normalizeAddress } from '../utils/countries.js';

export const LANGUAGE_LABELS = {
  pt: 'Português',
  fr: 'Francês',
  en: 'Inglês',
  es: 'Espanhol'
};

export const STATUS_LABELS = {
  request: 'Pedido',
  awaiting_payment: 'A aguardar pagamento',
  confirmed: 'Confirmada',
  checked_in: 'Em estadia',
  checked_out: 'Check-out realizado',
  cancelled: 'Cancelada',
  no_show: 'Não compareceu'
};

export const PAYMENT_LABELS = {
  unpaid: 'Não pago',
  awaiting_transfer: 'A aguardar transferência',
  paid: 'Pago',
  refunded: 'Reembolsado'
};

export const IDENTITY_DOCUMENT_LABELS = {
  cc: 'CC',
  bi: 'BI',
  passport: 'Passaporte'
};

export const SOURCE_LABELS = {
  booking: 'Booking.com',
  abritel: 'Abritel.fr',
  website: 'Website',
  private: 'Contacto privado',
  owner: 'Reserva do proprietário'
};

export const EXPENSE_LABELS = {
  manutencao: 'Manutenção',
  limpeza: 'Limpeza',
  consumiveis: 'Consumíveis',
  utilidades: 'Utilidades',
  equipamento: 'Equipamento',
  reparacoes: 'Reparações',
  funcionarios: 'Custos de funcionários',
  outros: 'Outros'
};

export const COMPENSATION_LABELS = {
  paid: 'Pago',
  free: 'Trabalho gratuito',
  voluntary: 'Voluntário'
};

export const WORK_TASK_LABELS = {
  checkin: 'Check-in',
  checkout: 'Check-out',
  clean: 'Limpeza',
  bureaucracy: 'Burocracia',
  maintenance: 'Manutenção',
  shopping: 'Compras',
  other: 'Outro'
};

const BLOCKING_STATUSES = new Set(['awaiting_payment', 'confirmed', 'checked_in']);

const REQUEST_COMMENT_LABELS = {
  pt: {
    comment: 'Comentário do hóspede:',
    reply: 'Resposta a acrescentar:'
  },
  fr: {
    comment: 'Commentaire du client :',
    reply: 'Réponse à ajouter :'
  },
  en: {
    comment: 'Guest comment:',
    reply: 'Reply to add:'
  },
  es: {
    comment: 'Comentario del huésped:',
    reply: 'Respuesta para añadir:'
  }
};

const PAYMENT_BREAKDOWN_LABELS = {
  pt: {
    accommodation: 'Alojamento',
    extraGuests: 'Hóspedes extra',
    services: 'Serviços / bicicletas',
    bikeUnits: 'bicicleta-dia(s)',
    deposit: 'Depósito de segurança',
    discount: 'Descontos',
    total: 'Total a transferir'
  },
  fr: {
    accommodation: 'Hébergement',
    extraGuests: 'Personnes supplémentaires',
    services: 'Services / vélos',
    bikeUnits: 'vélo-jour(s)',
    deposit: 'Dépôt de garantie',
    discount: 'Réductions',
    total: 'Total à transférer'
  },
  en: {
    accommodation: 'Accommodation',
    extraGuests: 'Extra guests',
    services: 'Services / bikes',
    bikeUnits: 'bike-day(s)',
    deposit: 'Security deposit',
    discount: 'Discounts',
    total: 'Total to transfer'
  },
  es: {
    accommodation: 'Alojamiento',
    extraGuests: 'Huéspedes extra',
    services: 'Servicios / bicicletas',
    bikeUnits: 'bicicleta-día(s)',
    deposit: 'Depósito de seguridad',
    discount: 'Descuentos',
    total: 'Total a transferir'
  }
};

const MESSAGE_LOCALES = {
  pt: 'pt-PT',
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES'
};

const STANDALONE_PLACEHOLDERS = {
  pt: {
    guestName: '[nome do hóspede]',
    reservationId: '[referência]',
    checkIn: '[data de check-in]',
    checkOut: '[data de check-out]',
    nights: '[número]',
    guestCount: '[número]',
    total: '[valor]'
  },
  fr: {
    guestName: '[nom du client]',
    reservationId: '[référence]',
    checkIn: '[date d’arrivée]',
    checkOut: '[date de départ]',
    nights: '[nombre]',
    guestCount: '[nombre]',
    total: '[montant]'
  },
  en: {
    guestName: '[guest name]',
    reservationId: '[reference]',
    checkIn: '[check-in date]',
    checkOut: '[check-out date]',
    nights: '[number]',
    guestCount: '[number]',
    total: '[amount]'
  },
  es: {
    guestName: '[nombre del huésped]',
    reservationId: '[referencia]',
    checkIn: '[fecha de entrada]',
    checkOut: '[fecha de salida]',
    nights: '[número]',
    guestCount: '[número]',
    total: '[importe]'
  }
};

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatCurrency(value, currency = 'EUR') {
  const amount = Math.round(Number(value || 0) * 100) / 100;
  const hasCents = !Number.isInteger(amount);
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(value) {
  if (!value) return '-';
  const date = parseDateKey(value);
  if (!date || Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function diffNights(checkIn, checkOut) {
  return Math.max(0, diffCalendarDays(checkIn, checkOut));
}

export function dateRangeOverlaps(aStart, aEnd, bStart, bEnd) {
  return parseDateKey(aStart) < parseDateKey(bEnd) && parseDateKey(aEnd) > parseDateKey(bStart);
}

export function reservationTouchesDate(reservation, dateKey) {
  return dateRangeOverlaps(reservation.stay.checkIn, reservation.stay.checkOut, dateKey, formatDateKey(addDays(parseDateKey(dateKey), 1)));
}

function eachNightDateKey(checkIn, checkOut) {
  if (!checkIn || !checkOut) return [];
  const start = parseDateKey(checkIn);
  const end = parseDateKey(checkOut);
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return [];

  const dates = [];
  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function seasonTouchesDate(season, dateKey) {
  if (!dateKey) return false;
  if (season?.active === false) return false;

  if ((season?.kind || 'dated') === 'recurring') {
    const date = parseDateKey(dateKey);
    if (!date || Number.isNaN(date.getTime())) return false;
    const todayOrdinal = monthDayOrdinal(`${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
    const start = monthDayOrdinal(season.startMonthDay);
    const end = monthDayOrdinal(season.endMonthDay);
    if (!start || !end) return false;
    return start <= end
      ? todayOrdinal >= start && todayOrdinal <= end
      : todayOrdinal >= start || todayOrdinal <= end;
  }

  return Boolean(season?.startDate && season?.endDate && season.startDate <= dateKey && season.endDate >= dateKey);
}

function getPricingRuleForDate(state, dateKey) {
  if (!dateKey) return null;
  const seasons = state?.pricing?.seasons || [];
  const datedOverride = seasons.find((season) => (season.kind || 'dated') === 'dated' && seasonTouchesDate(season, dateKey));
  const recurringSeason = seasons.find((season) => season.kind === 'recurring' && seasonTouchesDate(season, dateKey));
  return datedOverride || recurringSeason || null;
}

function getNightlyAccommodationValue(dateKey, adults, children, state, fallbackPricing = {}) {
  const rule = getPricingRuleForDate(state, dateKey);
  const adultNight = Number(rule?.adultNight ?? fallbackPricing.adultNight ?? state?.pricing?.adultNight ?? 0);
  const childNight = Number(rule?.childNight ?? fallbackPricing.childNight ?? state?.pricing?.childNight ?? 0);
  const minimumPaidAdults = Number(fallbackPricing.minimumPaidAdults ?? state?.pricing?.minimumPaidAdults ?? 2);
  const paidAdults = adults > 0 ? Math.max(Math.max(0, adults), minimumPaidAdults) : 0;

  return (paidAdults * adultNight) + (Math.max(0, children) * childNight);
}

function getNightlyAdditionalGuestValue(dateKey, adults, children, state, fallbackPricing = {}) {
  const rule = getPricingRuleForDate(state, dateKey);
  const adultNight = Number(rule?.adultNight ?? fallbackPricing.adultNight ?? state?.pricing?.adultNight ?? 0);
  const childNight = Number(rule?.childNight ?? fallbackPricing.childNight ?? state?.pricing?.childNight ?? 0);
  return (Math.max(0, adults) * adultNight) + (Math.max(0, children) * childNight);
}

function getExtraGuestAdjustmentAccommodationValue(reservation, adjustment, state) {
  const fromDate = String(adjustment.fromDate || adjustment.from || '').trim();
  const effectiveStart = fromDate && fromDate > reservation.stay.checkIn ? fromDate : reservation.stay.checkIn;
  const effectiveEnd = reservation.stay.checkOut;
  if (!effectiveStart || !effectiveEnd || parseDateKey(effectiveEnd) <= parseDateKey(effectiveStart)) return 0;

  return eachNightDateKey(effectiveStart, effectiveEnd).reduce(
    (subtotal, dateKey) => subtotal + getNightlyAdditionalGuestValue(
      dateKey,
      Number(adjustment.adults || 0),
      Number(adjustment.children || 0),
      state,
      reservation.pricing
    ),
    0
  );
}

function getExtraGuestAdjustmentDiscountValue(adjustment, accommodation) {
  const discountType = adjustment.discountType || (Number(adjustment.discountPercent || 0) > 0 ? 'percentage' : 'amount');
  if (discountType === 'percentage') {
    return Math.round(accommodation * (Math.min(100, Math.max(0, Number(adjustment.discountPercent || 0))) / 100));
  }

  return Math.max(0, Number(adjustment.discountAmount || 0));
}

export function calculateExtraGuestAdjustmentTotals(reservation, state) {
  const adjustments = Array.isArray(reservation.guestAdjustments) ? reservation.guestAdjustments : [];
  return adjustments.map((adjustment) => {
    const accommodation = getExtraGuestAdjustmentAccommodationValue(reservation, adjustment, state);
    const discount = Math.min(accommodation, getExtraGuestAdjustmentDiscountValue(adjustment, accommodation));
    return {
      adjustment,
      accommodation,
      discount,
      total: Math.max(0, accommodation - discount)
    };
  });
}

export function calculateReservationTotals(reservation, state) {
  const nights = diffNights(reservation.stay.checkIn, reservation.stay.checkOut);
  const adults = Number(reservation.guests?.adults || 0);
  const children = Number(reservation.guests?.children || 0);
  const bikeDay = Number(reservation.pricing?.bikeDay || state.pricing.bikeDay);
  const bikeUnits = Number(reservation.extras?.bikes?.count || 0) * Number(reservation.extras?.bikes?.days || 0);
  const nightDates = eachNightDateKey(reservation.stay.checkIn, reservation.stay.checkOut);
  const baseAccommodation = nightDates.length
    ? nightDates.reduce((total, dateKey) => total + getNightlyAccommodationValue(dateKey, adults, children, state, reservation.pricing), 0)
    : nights * getNightlyAccommodationValue(reservation.stay.checkIn, adults, children, state, reservation.pricing);
  const extraGuestTotals = calculateExtraGuestAdjustmentTotals(reservation, state);
  const extraGuests = extraGuestTotals.reduce((total, item) => total + item.accommodation, 0);
  const accommodation = baseAccommodation + extraGuests;
  const services = bikeUnits * bikeDay;
  const guestCount = adults + children;
  const groupDiscountPerNight = [...(state.pricing.groupDiscounts || [])]
    .filter((discount) => discount.active !== false && guestCount >= Number(discount.minGuests || 0))
    .sort((a, b) => Number(b.minGuests || 0) - Number(a.minGuests || 0))[0]?.amountPerNight || 0;
  const groupDiscount = Math.min(accommodation, Math.max(0, Number(groupDiscountPerNight)) * nights);
  const discountType = reservation.pricing?.discountType || (Number(reservation.pricing?.discountAmount || 0) > 0 ? 'amount' : 'percentage');
  const manualDiscount = discountType === 'amount'
    ? Math.max(0, Number(reservation.pricing?.discountAmount || 0))
    : Math.round(accommodation * (Number(reservation.pricing?.discountPercent || 0) / 100));
  const extraGuestDiscount = extraGuestTotals.reduce((total, item) => total + item.discount, 0);
  const discount = Math.min(accommodation + services, manualDiscount + groupDiscount + extraGuestDiscount);
  const deposit = reservation.pricing?.depositIncluded ? Number(state.pricing.securityDeposit || 0) : 0;
  const total = Math.max(0, accommodation + services + deposit - discount);

  return { nights, accommodation, baseAccommodation, extraGuests, services, deposit, discount, total, bikeUnits, groupDiscount, manualDiscount, extraGuestDiscount };
}

export function findReservationConflicts(state, candidate, ignoreId = '') {
  return state.reservations.filter((reservation) =>
    reservation.id !== ignoreId &&
    BLOCKING_STATUSES.has(reservation.status) &&
    dateRangeOverlaps(candidate.stay.checkIn, candidate.stay.checkOut, reservation.stay.checkIn, reservation.stay.checkOut)
  );
}

export function getGuestCount(reservation) {
  const baseGuests = Number(reservation.guests?.adults || 0) + Number(reservation.guests?.children || 0);
  const extraGuests = (Array.isArray(reservation.guestAdjustments) ? reservation.guestAdjustments : [])
    .reduce((total, adjustment) => total + Number(adjustment.adults || 0) + Number(adjustment.children || 0), 0);
  return baseGuests + extraGuests;
}

export function makeId(prefix, collection) {
  const year = new Date().getFullYear();
  const count = collection.length + 1;
  return `${prefix}-${year}-${String(count).padStart(4, '0')}`;
}

export function getOrCreateGuest(state, contact, preferredLanguage = 'pt', address = {}) {
  const email = contact.email?.trim().toLowerCase();
  const existing = state.guests.find((guest) => email && guest.email.toLowerCase() === email);

  if (existing) {
    existing.name = contact.name || existing.name;
    existing.email = contact.email || existing.email;
    existing.phone = contact.phone || existing.phone;
    existing.preferredLanguage = preferredLanguage || existing.preferredLanguage;
    const normalizedAddress = normalizeAddress(address);
    if (Object.values(normalizedAddress).some(Boolean)) existing.address = normalizedAddress;
    return existing;
  }

  const guest = {
    id: makeId('GUEST', state.guests),
    name: contact.name || 'Hóspede sem nome',
    email: contact.email || '',
    phone: contact.phone || '',
    preferredLanguage,
    address: normalizeAddress(address),
    nif: '',
    identityDocumentType: '',
    identityDocumentNumber: '',
    notes: ''
  };

  state.guests.push(guest);
  return guest;
}

export function addAudit(state, currentUser, action, entityType, entityId, details = {}) {
  state.auditLog.unshift({
    id: makeId('AUDIT', state.auditLog),
    at: new Date().toISOString(),
    actorId: currentUser?.id || 'system',
    actorName: currentUser?.displayName || 'Sistema',
    action,
    entityType,
    entityId,
    details
  });
}

function applyTemplateValues(template, values, options = {}) {
  const text = Object.entries(values)
    .reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template)
    .replace(/\n{3,}/g, '\n\n');
  return options.trim === false ? text : text.trim();
}

export function getMessageTemplates(catalog = {}) {
  return Array.isArray(catalog?.templates) ? catalog.templates.filter((template) => template?.id) : [];
}

export function getDefaultMessageTemplateId(catalog = {}) {
  const templates = getMessageTemplates(catalog);
  const defaultTemplate = catalog?.defaultTemplate;
  if (defaultTemplate && templates.some((template) => template.id === defaultTemplate)) return defaultTemplate;
  return templates[0]?.id || '';
}

export function getMessageTemplate(catalog = {}, templateKey = '') {
  const templates = getMessageTemplates(catalog);
  return templates.find((template) => template.id === templateKey) || templates.find((template) => template.id === getDefaultMessageTemplateId(catalog)) || templates[0] || null;
}

export function getMessageTemplateLabel(template = {}, language = 'pt') {
  return template.label?.[language] || template.label?.pt || template.label?.en || template.id || '';
}

function getMessageSnippet(catalog = {}, key = '', language = 'pt', values = {}) {
  const snippets = catalog?.snippets || {};
  const template = snippets[key]?.[language] || snippets[key]?.pt || snippets[key]?.en || '';
  return applyTemplateValues(template, values, { trim: false });
}

function getNestedMessageSnippet(catalog = {}, key = '', nestedKey = '', language = 'pt', values = {}) {
  const snippets = catalog?.snippets || {};
  const group = snippets[key] || {};
  const template = group[nestedKey]?.[language] || group[nestedKey]?.pt || group[nestedKey]?.en || '';
  return applyTemplateValues(template, values, { trim: false });
}

function formatMessageTime(value, fallback = '') {
  const time = String(value || fallback || '').trim();
  return time ? time.replace(':', 'h') : '';
}

function formatMessageDate(value, language = 'pt') {
  if (!value) return '-';
  const date = parseDateKey(value);
  if (!date || Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(MESSAGE_LOCALES[language] || MESSAGE_LOCALES.pt, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function hasCustomStayTime(value, fallback) {
  const time = String(value || '').trim();
  return Boolean(time && time !== fallback);
}

function isTomorrow(dateKey) {
  return dateKey === formatDateKey(addDays(new Date(), 1));
}

function hasSecurityDepositHandled(reservation) {
  return Boolean(reservation.pricing?.depositIncluded) || Boolean(reservation.securityDepositPaid);
}

function getDepositSourceMention(reservation, language = 'pt', catalog = {}) {
  const source = String(reservation?.source || '').trim();
  if (!['website', 'booking', 'abritel'].includes(source)) return '';
  return getNestedMessageSnippet(catalog, 'depositSourceMention', source, language);
}

function getDepositReminderLine(reservation, state, language = 'pt', catalog = {}) {
  if (hasSecurityDepositHandled(reservation)) return '';
  const amount = `${Number(state?.pricing?.securityDeposit || 200)}€`;
  return getMessageSnippet(catalog, 'depositReminder', language, {
    amount,
    sourceDepositMention: getDepositSourceMention(reservation, language, catalog)
  });
}

function getPaymentReceivedLine(reservation, language = 'pt', catalog = {}) {
  const paymentStatus = String(reservation?.paymentStatus || '').trim();
  if (paymentStatus !== 'paid') return '';
  return getNestedMessageSnippet(catalog, 'paymentReceivedLine', paymentStatus, language);
}

function getPaymentBreakdownText(reservation, state, language = 'pt', totals = calculateReservationTotals(reservation, state)) {
  const labels = PAYMENT_BREAKDOWN_LABELS[language] || PAYMENT_BREAKDOWN_LABELS.pt;
  const currency = state?.pricing?.currency || 'EUR';
  const lines = [
    `${labels.accommodation}: ${formatCurrency(totals.baseAccommodation ?? totals.accommodation, currency)}`
  ];

  if (totals.extraGuests > 0) {
    lines.push(`${labels.extraGuests}: ${formatCurrency(totals.extraGuests, currency)}`);
  }

  if (totals.services > 0) {
    const units = totals.bikeUnits ? ` (${totals.bikeUnits} ${labels.bikeUnits})` : '';
    lines.push(`${labels.services}${units}: ${formatCurrency(totals.services, currency)}`);
  }

  if (totals.deposit > 0) {
    lines.push(`${labels.deposit}: ${formatCurrency(totals.deposit, currency)}`);
  }

  if (totals.discount > 0) {
    lines.push(`${labels.discount}: -${formatCurrency(totals.discount, currency)}`);
  }

  lines.push(`${labels.total}: ${formatCurrency(totals.total, currency)}`);
  return lines.join('\n');
}

function getGoogleReviewUrl(state) {
  return state?.property?.googleReviewUrl
    || state?.property?.googleMapsUrl
    || SITE_CONFIG.property.reviewUrl;
}

function getCheckInTimeLine(reservation, state, language = 'pt', catalog = {}) {
  const fallback = state?.property?.defaultCheckInTime || '15:00';
  const time = reservation.stay?.checkInTime || '';

  if (hasCustomStayTime(time, fallback)) {
    return getMessageSnippet(catalog, 'checkInTimeKnown', language, { time: formatMessageTime(time) });
  }

  return getMessageSnippet(catalog, 'checkInTimeRequest', language);
}

function getLocalizedCheckoutDay(reservation, language = 'pt', catalog = {}) {
  if (isTomorrow(reservation.stay?.checkOut)) {
    return getMessageSnippet(catalog, 'checkoutWhenTomorrow', language);
  }

  const date = formatMessageDate(reservation.stay?.checkOut, language);
  return getMessageSnippet(catalog, 'checkoutWhenDate', language, { date });
}

function getCheckOutTimeLine(reservation, state, language = 'pt', catalog = {}) {
  const fallback = state?.property?.defaultCheckOutTime || '10:00';
  const time = reservation.stay?.checkOutTime || '';

  if (hasCustomStayTime(time, fallback)) {
    return getMessageSnippet(catalog, 'checkOutTimeKnown', language, { time: formatMessageTime(time) });
  }

  const when = getLocalizedCheckoutDay(reservation, language, catalog);
  const timeText = formatMessageTime(fallback);
  return getMessageSnippet(catalog, 'checkOutTimeRequest', language, { when, time: timeText });
}

export function generateGuestMessage(reservation, state, templateKey = '', catalog = {}) {
  const totals = calculateReservationTotals(reservation, state);
  const language = reservation.preferredLanguage || 'pt';
  const catalogTemplate = getMessageTemplate(catalog, templateKey);
  const template = catalogTemplate?.body?.[language] || catalogTemplate?.body?.pt || catalogTemplate?.body?.en || '';
  const requestComment = reservation.source === 'website' ? String(reservation.notes?.owner || '').trim() : '';
  const commentLabels = REQUEST_COMMENT_LABELS[language] || REQUEST_COMMENT_LABELS.pt;

  if (!template) return '';

  const values = {
    guestName: reservation.contact?.name || STANDALONE_PLACEHOLDERS[language]?.guestName || 'Hóspede',
    reservationId: reservation.id,
    checkIn: formatMessageDate(reservation.stay.checkIn, language),
    checkOut: formatMessageDate(reservation.stay.checkOut, language),
    checkInTime: formatMessageTime(reservation.stay.checkInTime || state.property.defaultCheckInTime || '15:00'),
    checkOutTime: formatMessageTime(reservation.stay.checkOutTime || state.property.defaultCheckOutTime || '10:00'),
    nights: String(totals.nights),
    guestCount: String(getGuestCount(reservation)),
    propertyAddress: state.property.address || '',
    total: formatCurrency(totals.total, state.pricing.currency),
    paymentBreakdown: getPaymentBreakdownText(reservation, state, language, totals),
    depositReminder: getDepositReminderLine(reservation, state, language, catalog),
    paymentReceivedLine: getPaymentReceivedLine(reservation, language, catalog),
    checkInTimeLine: getCheckInTimeLine(reservation, state, language, catalog),
    checkOutTimeLine: getCheckOutTimeLine(reservation, state, language, catalog),
    googleReviewUrl: getGoogleReviewUrl(state)
  };

  const message = applyTemplateValues(template, values);
  if (!requestComment || templateKey !== 'paymentInstructions') return message;

  return `${message}\n\n${commentLabels.comment}\n${requestComment}\n\n${commentLabels.reply}\n[ ]`;
}

export function generateStandaloneMessage(state, language = 'pt', templateKey = '', catalog = {}) {
  const catalogTemplate = getMessageTemplate(catalog, templateKey);
  const template = catalogTemplate?.body?.[language] || catalogTemplate?.body?.pt || catalogTemplate?.body?.en || '';
  const placeholders = STANDALONE_PLACEHOLDERS[language] || STANDALONE_PLACEHOLDERS.pt;

  if (!template) return '';

  const values = {
    guestName: placeholders.guestName,
    reservationId: placeholders.reservationId,
    checkIn: placeholders.checkIn,
    checkOut: placeholders.checkOut,
    checkInTime: formatMessageTime(state?.property?.defaultCheckInTime || '15:00'),
    checkOutTime: formatMessageTime(state?.property?.defaultCheckOutTime || '10:00'),
    nights: placeholders.nights,
    guestCount: placeholders.guestCount,
    propertyAddress: state?.property?.address || SITE_CONFIG.property.address,
    total: placeholders.total,
    paymentBreakdown: placeholders.total,
    depositReminder: getDepositReminderLine({ source: 'website', paymentStatus: 'awaiting_transfer', pricing: { depositIncluded: false } }, state, language, catalog),
    paymentReceivedLine: '',
    checkInTimeLine: getCheckInTimeLine({ stay: { checkInTime: '' } }, state, language, catalog),
    checkOutTimeLine: getCheckOutTimeLine({ stay: { checkOut: '', checkOutTime: '' } }, state, language, catalog),
    googleReviewUrl: getGoogleReviewUrl(state)
  };

  return applyTemplateValues(template, values);
}

export function getEmployeeForUser(state, user) {
  return state.employees.find((employee) => employee.userId === user.id);
}

export function getHourlyRate(employee, dateKey = formatDateKey(new Date())) {
  const rates = [...(employee.hourlyRates || [])]
    .filter((rate) => rate.from <= dateKey)
    .sort((a, b) => a.from.localeCompare(b.from));
  return Number(rates.at(-1)?.rate || 0);
}

export function getWorkDurationHours(session, fallbackEnd = new Date()) {
  const start = new Date(session.start);
  const end = session.end ? new Date(session.end) : fallbackEnd;
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 0;
  return Math.round(((end - start) / 3600000) * 100) / 100;
}

export function getWorkSessionCost(session) {
  if ((session.compensationType || 'paid') !== 'paid') return 0;
  return getWorkDurationHours(session) * Number(session.rateSnapshot || 0);
}

export function calculateEmployeeEarnings(state, employeeId, monthKey = formatDateKey(new Date()).slice(0, 7)) {
  return state.workSessions
    .filter((session) => session.employeeId === employeeId && session.date.startsWith(monthKey))
    .reduce((total, session) => total + getWorkSessionCost(session), 0);
}

export function summarizeDashboard(state) {
  const todayKey = formatDateKey(new Date());
  const activeReservations = state.reservations.filter((reservation) =>
    ['confirmed', 'checked_in'].includes(reservation.status) &&
    reservation.stay.checkIn <= todayKey &&
    reservation.stay.checkOut > todayKey
  );
  const futureReservations = state.reservations
    .filter((reservation) => reservation.status !== 'cancelled' && reservation.stay.checkIn >= todayKey)
    .sort((a, b) => a.stay.checkIn.localeCompare(b.stay.checkIn));
  const departures = state.reservations
    .filter((reservation) => reservation.status !== 'cancelled' && reservation.stay.checkOut >= todayKey)
    .sort((a, b) => a.stay.checkOut.localeCompare(b.stay.checkOut));
  const awaitingPayment = state.reservations.filter((reservation) =>
    !['cancelled', 'no_show', 'checked_out'].includes(reservation.status) &&
    ['unpaid', 'awaiting_transfer'].includes(reservation.paymentStatus)
  );
  const openRequests = state.websiteRequests.filter((request) => request.status === 'new');
  const confirmedRevenue = state.reservations
    .filter((reservation) => ['awaiting_payment', 'confirmed', 'checked_in', 'checked_out'].includes(reservation.status))
    .reduce((total, reservation) => total + calculateReservationTotals(reservation, state).total, 0);
  const expenses = state.expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
  const employeeCosts = state.workSessions.reduce((total, session) => total + getWorkSessionCost(session), 0);

  return {
    todayKey,
    activeReservations,
    nextArrival: futureReservations[0] || null,
    nextDeparture: departures[0] || null,
    awaitingPayment,
    openRequests,
    confirmedRevenue,
    expenses,
    employeeCosts
  };
}

export { addDays, formatDateKey, monthDayOrdinal, parseDateKey };
