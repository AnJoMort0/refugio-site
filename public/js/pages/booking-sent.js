const DEFAULT_LANGUAGE = 'pt';
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

export async function initBookingSentPage() {
  const page = document.querySelector('.booking-sent-page');
  if (!page) return;

  let dictionary = {};
  try {
    const language = localStorage.getItem('refugio-language') || DEFAULT_LANGUAGE;
    const response = await fetch(`./locales/${language}.json`);
    if (response.ok) {
      dictionary = await response.json();
    }
  } catch (error) {
    dictionary = {};
  }

  const getText = (path, fallback) => getNestedValue(dictionary, path) || fallback;
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
      ? getText('bookingPage.summary.depositChoiceYes', 'Sim')
      : getText('bookingPage.summary.depositChoiceNo', 'Não')
  );
  setText('#sent-email', email || '-');
  setText('#sent-total', formatCurrency(totalWithDeposit));

  toggleRow('#sent-bikes-row', bikeDays > 0);
  setText(
    '#sent-bikes',
    bikeDays === 1
      ? getText('bookingPage.summary.bikesSingle', '1 bicicleta-dia')
      : getText('bookingPage.summary.bikesMultiple', '{count} bicicleta-dias').replace('{count}', String(bikeDays))
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
      ? getText('bookingPage.summary.bedPreferenceDouble', 'Cama de casal')
      : bedPreference === 'single'
        ? getText('bookingPage.summary.bedPreferenceSingle', 'Camas individuais')
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
        item.textContent = `${getText('bookingPage.form.childAgeLabel', 'Idade da criança')} ${index + 1}: ${age}`;
        return item;
      })
    );
  }

  const bikeDaysCard = document.querySelector('#sent-bike-days-card');
  const bikeDaysList = document.querySelector('#sent-bike-days');
  if (bikeDaysCard) bikeDaysCard.hidden = bikeDays === 0;
  if (bikeDaysList && bikeDays > 0) {
    const bikesItem = document.createElement('li');
    const daysItem = document.createElement('li');
    bikesItem.textContent = `${getText('bookingPage.form.bikeCountLabel', 'Número de bicicletas')}: ${bikeCount}`;
    daysItem.textContent = `${getText('bookingPage.form.bikeRentalDaysLabel', 'Dias de aluguer')}: ${bikeRentalDays}`;
    bikeDaysList.replaceChildren(bikesItem, daysItem);
  }

  toggleRow('#sent-comments-card', Boolean(comments.trim()));
  setText('#sent-comments', comments.trim() || '-');
}
