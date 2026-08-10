const DEFAULT_LANGUAGE = 'pt';
const SUPPORTED_LANGUAGES = ['pt', 'en', 'fr', 'es'];
const PRICE_CONFIG = {
  adultPerNight: 48,
  childPerNight: 28,
  bikePerDay: 5,
  securityDeposit: 200
};

function parseDateKey(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function diffNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.round((parseDateKey(checkOut) - parseDateKey(checkIn)) / 86400000);
}

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

function formatCurrency(value) {
  return `${Math.round(value)}€`;
}

function formatDate(value) {
  if (!value) return '-';
  const date = parseDateKey(value);
  if (!date || Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(document.documentElement.lang || 'pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function textToBoolean(value) {
  return ['on', 'true', '1', 'yes', 'sim'].includes((value || '').toLowerCase());
}

function buildReservationTotal({ nights, adults, children, includeDeposit, bikeDays = 0 }) {
  const stayValue =
    nights > 0 ? nights * (adults * PRICE_CONFIG.adultPerNight + children * PRICE_CONFIG.childPerNight) : 0;
  return stayValue + bikeDays * PRICE_CONFIG.bikePerDay + (includeDeposit ? PRICE_CONFIG.securityDeposit : 0);
}

function applyTemplate(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  );
}

export async function initBookingSentPage() {
  const page = document.querySelector('.booking-sent-page');
  if (!page) return;

  let dictionary = {};
  try {
    const language = (localStorage.getItem('refugio-language') || DEFAULT_LANGUAGE).slice(0, 2).toLowerCase();
    const safeLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
    const fallbackDictionary = await loadLocale(DEFAULT_LANGUAGE);
    dictionary = safeLanguage === DEFAULT_LANGUAGE
      ? fallbackDictionary
      : mergeDictionaries(fallbackDictionary, await loadLocale(safeLanguage));
  } catch (error) {
    dictionary = {};
  }

  const getText = (path, fallback = '') => getNestedValue(dictionary, path) || fallback;
  const params = new URLSearchParams(window.location.search);

  const checkin = params.get('checkin') || '';
  const checkout = params.get('checkout') || '';
  const adults = Math.max(0, Number(params.get('adults') || 0));
  const children = Math.max(0, Number(params.get('children') || 0));
  const totalGuests = Math.max(0, Number(params.get('total_guests') || adults + children));
  const nights = Math.max(Number(params.get('nights') || diffNights(checkin, checkout)), 0);
  const contactName = params.get('contact_name') || '';
  const email = params.get('contact_email') || '';
  const phone = params.get('contact_phone') || '';
  const checkinTime = params.get('checkin_time') || '';
  const checkoutTime = params.get('checkout_time') || '';
  const comments = params.get('comments') || '';
  const depositPrepay = textToBoolean(params.get('deposit_prepay') || '');
  const bedPreference = params.get('bed_preference') || '';
  const bikeCount = Math.max(0, Number(params.get('bike_count') || 0));
  const bikeRentalDays = Math.max(0, Number(params.get('bike_rental_days') || 0));
  const bikeDays = Math.max(
    Number(params.get('bike_days_total') || 0),
    bikeCount * bikeRentalDays
  );
  const guestNames = params.getAll('guest_name').map((value) => value.trim()).filter(Boolean);
  const childAges = params.getAll('child_age').map((value) => value.trim()).filter(Boolean);

  if (guestNames.length === 0 || childAges.length === 0) {
    for (const [key, value] of params.entries()) {
      const trimmed = value.trim();
      if (!trimmed) continue;

      if (guestNames.length === 0 && key.startsWith('guest_')) {
        guestNames.push(trimmed);
      }

      if (childAges.length === 0 && key.startsWith('child_age_')) {
        childAges.push(trimmed);
      }
    }
  }

  const hasBookingData = Boolean(checkin || checkout || email || contactName || guestNames.length);
  const emptyState = document.querySelector('#booking-sent-empty');
  const content = document.querySelector('#booking-sent-content');

  if (emptyState) emptyState.hidden = hasBookingData;
  if (content) content.hidden = !hasBookingData;
  if (!hasBookingData) return;

  const fallbackTotal = buildReservationTotal({ nights, adults, children, includeDeposit: depositPrepay, bikeDays });
  const totalWithDeposit = Math.max(Number(params.get('reservation_total') || fallbackTotal), 0);

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  const toggleRow = (selector, shouldShow) => {
    const node = document.querySelector(selector);
    if (node) node.hidden = !shouldShow;
  };

  setText('#sent-checkin', formatDate(checkin));
  setText('#sent-checkout', formatDate(checkout));
  setText('#sent-nights', String(nights));
  setText('#sent-guests', String(totalGuests));
  setText('#sent-adults', String(adults));
  setText('#sent-kids', String(children));
  setText('#sent-contact-name', contactName || guestNames[0] || '-');
  setText(
    '#sent-deposit',
    depositPrepay
      ? getText('bookingPage.summary.depositChoiceYes')
      : getText('bookingPage.summary.depositChoiceNo')
  );
  setText('#sent-email', email || '-');
  setText('#sent-total', formatCurrency(totalWithDeposit));

  toggleRow('#sent-bikes-row', bikeDays > 0);
  setText(
    '#sent-bikes',
    applyTemplate(
      getText('bookingSentPage.summary.bikeSummaryPattern'),
      {
        bikes: String(bikeCount),
        days: String(bikeRentalDays),
        units: String(bikeDays)
      }
    )
  );

  toggleRow('#sent-phone-row', Boolean(phone));
  setText('#sent-phone', phone || '-');

  toggleRow('#sent-checkin-time-row', Boolean(checkinTime));
  setText('#sent-checkin-time', checkinTime || '-');

  toggleRow('#sent-checkout-time-row', Boolean(checkoutTime));
  setText('#sent-checkout-time', checkoutTime || '-');

  toggleRow('#sent-bed-row', Boolean(bedPreference));
  setText(
    '#sent-bed',
    bedPreference === 'double'
      ? getText('bookingPage.summary.bedPreferenceDouble')
      : bedPreference === 'single'
        ? getText('bookingPage.summary.bedPreferenceSingle')
        : '-'
  );

  const depositNote = document.querySelector('#sent-deposit-note');
  if (depositNote) depositNote.hidden = !depositPrepay;

  const childAgesCard = document.querySelector('#sent-child-ages-card');
  const childAgesList = document.querySelector('#sent-child-ages');
  const showChildAges = childAges.length > 0;
  if (childAgesCard) childAgesCard.hidden = !showChildAges;
  if (childAgesList && showChildAges) {
    childAgesList.replaceChildren(
      ...childAges.map((age, index) => {
        const item = document.createElement('li');
        item.textContent = `${getText('bookingPage.form.childAgeLabel')} ${index + 1}: ${age}`;
        return item;
      })
    );
  }

  const detailGrid = document.querySelector('.booking-sent-detail-grid');
  if (detailGrid) detailGrid.hidden = !showChildAges;

  toggleRow('#sent-comments-card', Boolean(comments.trim()));
  setText('#sent-comments', comments.trim() || '-');

  const contactLink = document.querySelector('.booking-sent-actions .booking-contact-button');
  if (contactLink) {
    const contactParams = new URLSearchParams();
    const contactMessage = applyTemplate(
      getText('bookingSentPage.actions.contactMessage'),
      {
        checkin: formatDate(checkin),
        checkout: formatDate(checkout)
      }
    );

    contactParams.set('context', 'requested');
    contactParams.set('topic', 'requestQuestion');
    contactParams.set('message', contactMessage);
    if (contactName || guestNames[0]) contactParams.set('name', contactName || guestNames[0]);
    if (email) contactParams.set('email', email);
    if (phone) contactParams.set('phone', phone);

    contactLink.setAttribute('href', `./contacto.html?${contactParams.toString()}`);
  }
}
