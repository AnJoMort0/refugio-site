import { getActiveLanguage, getCurrentDictionary, getNestedValue } from '../services/i18n.js';
import { addDays, diffCalendarDays as diffNights, formatDateKey, monthDayOrdinal, parseDateKey } from '../utils/date.js';
import { isValidPhoneNumber } from '../utils/phone.js';

const PRICE_CONFIG = {
  adultPerNight: 70,
  minimumPaidAdults: 2,
  childPerNight: 65,
  bikePerDay: 5,
  securityDeposit: 200,
  seasons: []
};
const ADMIN_STORAGE_KEY = 'refugio-admin-prototype-state-v1';
const ADMIN_DATA_VERSION = 5;
const ADMIN_BLOCKING_STATUSES = new Set(['awaiting_payment', 'confirmed', 'checked_in']);
let adminPrototypeStateSnapshot = null;

function createWebsiteReservationId() {
  const now = new Date();
  const year = now.getFullYear();
  const compactDate = `${year}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const compactTime = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WEB-${compactDate}-${compactTime}-${randomPart}`;
}

function eachDate(start, endExclusive) {
  const dates = [];
  let cursor = new Date(start);

  while (cursor < endExclusive) {
    dates.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function seasonTouchesDate(season, dateKey) {
  if (season?.active === false) return false;

  if ((season?.kind || 'dated') === 'recurring') {
    const date = parseDateKey(dateKey);
    if (!date || Number.isNaN(date.getTime())) return false;
    const dateOrdinal = monthDayOrdinal(`${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
    const start = monthDayOrdinal(season.startMonthDay);
    const end = monthDayOrdinal(season.endMonthDay);
    if (!start || !end) return false;
    return start <= end
      ? dateOrdinal >= start && dateOrdinal <= end
      : dateOrdinal >= start || dateOrdinal <= end;
  }

  return Boolean(season?.startDate && season?.endDate && season.startDate <= dateKey && season.endDate >= dateKey);
}

function getPricingRuleForDate(dateKey) {
  const seasons = PRICE_CONFIG.seasons || [];
  const datedOverride = seasons.find((season) => (season.kind || 'dated') === 'dated' && seasonTouchesDate(season, dateKey));
  const recurringSeason = seasons.find((season) => season.kind === 'recurring' && seasonTouchesDate(season, dateKey));
  return datedOverride || recurringSeason || null;
}

function getNightlyPrices(dateKey = '') {
  const rule = dateKey ? getPricingRuleForDate(dateKey) : null;
  return {
    adultPerNight: Number(rule?.adultNight ?? PRICE_CONFIG.adultPerNight),
    childPerNight: Number(rule?.childNight ?? PRICE_CONFIG.childPerNight)
  };
}

function getPaidAdultCount(adults) {
  const adultCount = Math.max(0, adults);
  if (adultCount === 0) return 0;
  return Math.max(adultCount, Number(PRICE_CONFIG.minimumPaidAdults || 2));
}

function getNightlyAdultValue(dateKey, adults) {
  const prices = getNightlyPrices(dateKey);
  return getPaidAdultCount(adults) * prices.adultPerNight;
}

function getNightlyChildValue(dateKey, children) {
  const prices = getNightlyPrices(dateKey);
  return Math.max(0, children) * prices.childPerNight;
}

function getNightlyAccommodationValue(dateKey, adults, children) {
  return getNightlyAdultValue(dateKey, adults) + getNightlyChildValue(dateKey, children);
}

function getStayDateKeys(checkIn, checkOut) {
  if (!checkIn || !checkOut) return [];
  const start = parseDateKey(checkIn);
  const end = parseDateKey(checkOut);
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return [];
  return eachDate(start, end).map(formatDateKey);
}

function buildStayValue({ nights, adults, children, checkIn = '', checkOut = '' }) {
  const dateKeys = getStayDateKeys(checkIn, checkOut);
  if (dateKeys.length) {
    return dateKeys.reduce((total, dateKey) => total + getNightlyAccommodationValue(dateKey, adults, children), 0);
  }
  return nights > 0 ? nights * getNightlyAccommodationValue(checkIn, adults, children) : 0;
}

function formatRateRange(values) {
  const rates = [...new Set(values.filter((value) => Number.isFinite(value)).map((value) => Math.round(value * 100) / 100))];
  if (!rates.length) return formatCurrency(0);
  if (rates.length === 1) return formatCurrency(rates[0]);
  return `${formatCurrency(Math.min(...rates))} - ${formatCurrency(Math.max(...rates))}`;
}

function formatGuestRateLabel({ amountText, count, singularLabel, pluralLabel }) {
  const label = count === 1 ? singularLabel : pluralLabel;
  return `${amountText} (${count} ${label})`;
}

function formatCurrency(value) {
  const amount = Math.round(Number(value || 0) * 100) / 100;
  const hasCents = !Number.isInteger(amount);
  const text = amount.toLocaleString('pt-PT', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2
  });
  return `${text}€`;
}

function normalizeDiscountCode(value) {
  return String(value || '').trim().toUpperCase();
}

function getDiscountPrototypeState() {
  return getAdminPrototypeState() || adminPrototypeStateSnapshot;
}

function isDiscountAvailableForDate(discount, checkIn) {
  if (discount.active === false) return false;
  if (Number(discount.maxUses || 0) > 0 && Number(discount.usedCount || 0) >= Number(discount.maxUses || 0)) return false;
  if (!checkIn) return false;
  if (discount.startDate && checkIn < discount.startDate) return false;
  if (discount.endDate && checkIn > discount.endDate) return false;
  return true;
}

function getDiscountCodeResult(code, { checkIn, stayValue, bikeValue }) {
  const normalizedCode = normalizeDiscountCode(code);
  if (!normalizedCode) {
    return { code: '', valid: false, pending: false, amount: 0, reason: 'empty' };
  }

  if (!checkIn) {
    return { code: normalizedCode, valid: false, pending: true, amount: 0, reason: 'dates' };
  }

  const discount = getDiscountPrototypeState()?.pricing?.discounts
    ?.find((candidate) => normalizeDiscountCode(candidate.code) === normalizedCode);

  if (!discount || !isDiscountAvailableForDate(discount, checkIn)) {
    return { code: normalizedCode, valid: false, pending: false, amount: 0, reason: 'invalid' };
  }

  const appliesTo = discount.appliesTo || 'accommodation';
  const discountBase = appliesTo === 'services'
    ? bikeValue
    : appliesTo === 'both'
      ? stayValue + bikeValue
      : stayValue;
  const discountType = discount.type || (Number(discount.amount || 0) > 0 ? 'amount' : 'percentage');
  const rawAmount = discountType === 'amount'
    ? Number(discount.amount || 0)
    : Math.round(discountBase * (Number(discount.percentage || 0) / 100));
  const amount = Math.min(discountBase, Math.max(0, rawAmount));

  if (amount <= 0) {
    return { code: normalizedCode, valid: false, pending: false, amount: 0, reason: 'notApplicable' };
  }

  return {
    code: normalizedCode,
    valid: true,
    pending: false,
    amount,
    title: discount.title || normalizedCode,
    type: discountType,
    percentage: Number(discount.percentage || 0),
    appliesTo
  };
}

function buildReservationBreakdown({ nights, adults, children, includeDeposit, bikeDays = 0, checkIn = '', checkOut = '', discountCode = '' }) {
  const stayValue = buildStayValue({ nights, adults, children, checkIn, checkOut });
  const bikeValue = bikeDays * PRICE_CONFIG.bikePerDay;
  const depositValue = includeDeposit ? PRICE_CONFIG.securityDeposit : 0;
  const discount = getDiscountCodeResult(discountCode, { checkIn, stayValue, bikeValue });
  const discountAmount = discount.valid ? discount.amount : 0;

  return {
    stayValue,
    bikeValue,
    depositValue,
    discount,
    total: Math.max(0, stayValue + bikeValue + depositValue - discountAmount)
  };
}

function buildReservationTotal(options) {
  return buildReservationBreakdown(options).total;
}

function getAdminPrototypeState() {
  try {
    const state = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || 'null');
    return state && state.version === ADMIN_DATA_VERSION && Array.isArray(state.reservations) ? state : null;
  } catch (error) {
    return null;
  }
}

async function getWritableAdminPrototypeState() {
  const currentState = getAdminPrototypeState();
  if (currentState && Array.isArray(currentState.websiteRequests)) return currentState;

  try {
    const { createInitialAdminState } = await import('../admin/admin-seed.js');
    return createInitialAdminState();
  } catch (error) {
    return currentState;
  }
}

function saveAdminPrototypeState(state) {
  if (!state) return;
  state.updatedAt = new Date().toISOString();
  adminPrototypeStateSnapshot = state;
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
}

function addWebsiteRequestAudit(state, requestId) {
  if (!Array.isArray(state.auditLog)) state.auditLog = [];
  state.auditLog.unshift({
    id: `AUDIT-WEB-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    at: new Date().toISOString(),
    actorId: 'website',
    actorName: 'Website',
    action: 'Pedido do website recebido',
    entityType: 'websiteRequest',
    entityId: requestId
  });
}

async function saveWebsiteRequestToAdminPrototype(request) {
  try {
    const state = await getWritableAdminPrototypeState();
    if (!state) return;
    if (!Array.isArray(state.websiteRequests)) state.websiteRequests = [];

    const existingIndex = state.websiteRequests.findIndex((candidate) => candidate.id === request.id);
    if (existingIndex >= 0) {
      state.websiteRequests[existingIndex] = {
        ...state.websiteRequests[existingIndex],
        ...request,
        updatedAt: new Date().toISOString()
      };
    } else {
      state.websiteRequests.unshift(request);
    }

    addWebsiteRequestAudit(state, request.id);
    saveAdminPrototypeState(state);
  } catch (error) {
    console.warn('Could not save booking request to admin prototype state.', error);
  }
}

function syncPriceConfigFromAdminState(state) {
  if (!state?.pricing) return;

  PRICE_CONFIG.adultPerNight = Number(state.pricing.adultNight || PRICE_CONFIG.adultPerNight);
  PRICE_CONFIG.minimumPaidAdults = Number(state.pricing.minimumPaidAdults || PRICE_CONFIG.minimumPaidAdults || 2);
  PRICE_CONFIG.childPerNight = Number(state.pricing.childNight || PRICE_CONFIG.childPerNight);
  PRICE_CONFIG.bikePerDay = Number(state.pricing.bikeDay || PRICE_CONFIG.bikePerDay);
  PRICE_CONFIG.securityDeposit = Number(state.pricing.securityDeposit || PRICE_CONFIG.securityDeposit);
  PRICE_CONFIG.seasons = Array.isArray(state.pricing.seasons) ? state.pricing.seasons : [];
}

function buildOccupiedRanges(adminState) {
  if (!adminState) return [];

  return adminState.reservations
    .filter((reservation) => ADMIN_BLOCKING_STATUSES.has(reservation.status))
    .map((reservation) => ({
      start: reservation.stay?.checkIn,
      end: reservation.stay?.checkOut
    }))
    .filter(({ start, end }) => start && end);
}

function usesPortugueseTimezone() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const portugueseTimezones = new Set(['Europe/Lisbon', 'Atlantic/Azores', 'Atlantic/Madeira']);

  return Boolean(timeZone && portugueseTimezones.has(timeZone));
}

function getPortugalNow() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Lisbon',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date())
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  return {
    date: new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day)),
    hour: Number(parts.hour),
    minute: Number(parts.minute)
  };
}

export async function initBookingPage() {
  const page = document.querySelector('.booking-page');
  if (!page) return;

  const form = document.querySelector('#booking-form');
  const checkinInput = document.querySelector('#checkin-date');
  const checkoutInput = document.querySelector('#checkout-date');
  const adultInput = document.querySelector('#adult-count');
  const childInput = document.querySelector('#child-count');
  const bedPreferenceGroup = document.querySelector('#bed-preference-group');
  const contactNameInput = document.querySelector('#contact-name');
  const contactEmailInput = document.querySelector('#contact-email');
  const contactPhoneInput = document.querySelector('#contact-phone');
  const contactNationalityInput = document.querySelector('#contact-nationality');
  const checkinTimeInput = document.querySelector('#checkin-time');
  const checkoutTimeInput = document.querySelector('#checkout-time');
  const depositPrepayInput = document.querySelector('#deposit-prepay');
  const discountCodeInput = document.querySelector('#discount-code');
  const discountCodeStatus = document.querySelector('#discount-code-status');
  const bikeReservationToggle = document.querySelector('#bike-reservation-toggle');
  const bikeDaysGroup = document.querySelector('#bike-days-group');
  const bikeCountInput = document.querySelector('#bike-count');
  const bikeRentalDaysInput = document.querySelector('#bike-rental-days');
  const rulesConfirmationInput = document.querySelector('#rules-confirmation');
  const marketingOptInInput = document.querySelector('#booking-marketing-opt-in');
  const bedPreferenceInputs = Array.from(document.querySelectorAll('input[name="bed_preference"]'));
  const childAgesGroup = document.querySelector('#child-ages-group');
  const childAgeFields = document.querySelector('#child-ages-fields');
  const calendar = document.querySelector('#availability-calendar');
  const formStatus = document.querySelector('#booking-form-status');
  const resetButton = document.querySelector('#booking-reset');
  const timezoneWarning = document.querySelector('[data-i18n="bookingPage.form.timezoneWarning"]');
  const summaryNights = document.querySelector('#summary-nights');
  const summaryGuests = document.querySelector('#summary-guests');
  const summaryAdults = document.querySelector('#summary-adults');
  const summaryKids = document.querySelector('#summary-kids');
  const summaryDepositChoice = document.querySelector('#summary-deposit-choice');
  const summaryBikesRow = document.querySelector('#summary-bikes-row');
  const summaryBikes = document.querySelector('#summary-bikes');
  const summaryDiscountRow = document.querySelector('#summary-discount-row');
  const summaryDiscount = document.querySelector('#summary-discount');
  const summaryChildRate = document.querySelector('#summary-child-rate');
  const summaryBikeRate = document.querySelector('#summary-bike-rate');
  const summaryBedPreferenceRow = document.querySelector('#summary-bed-preference-row');
  const summaryBedPreference = document.querySelector('#summary-bed-preference');
  const summaryTotal = document.querySelector('#summary-total');
  const summaryDepositRate = document.querySelector('#summary-deposit-rate');
  const summaryDepositNote = document.querySelector('#summary-deposit-note');
  const priceAdult = document.querySelector('[data-price-adult]');
  const priceChild = document.querySelector('[data-price-child]');
  const priceBike = document.querySelector('[data-price-bike]');
  const priceDeposit = document.querySelector('[data-price-deposit]');

  const portugalNow = getPortugalNow();
  const adminState = getAdminPrototypeState() || await getWritableAdminPrototypeState();
  adminPrototypeStateSnapshot = adminState;
  syncPriceConfigFromAdminState(adminState);
  const today = portugalNow.date;
  today.setHours(0, 0, 0, 0);
  const earliestCheckinDate = addDays(today, portugalNow.hour < 15 ? 1 : 2);
  const occupiedRanges = buildOccupiedRanges(adminState);
  const occupiedDates = new Set();
  const monthsToRender = 2;
  const monthFormatter = () =>
    new Intl.DateTimeFormat(document.documentElement.lang || 'pt-PT', { month: 'long', year: 'numeric' });
  const weekdayFormatter = () =>
    new Intl.DateTimeFormat(document.documentElement.lang || 'pt-PT', { weekday: 'short' });

  let dictionary = getCurrentDictionary();
  let visibleMonthOffset = 0;

  occupiedRanges.forEach(({ start, end }) => {
    eachDate(parseDateKey(start), parseDateKey(end)).forEach((date) => occupiedDates.add(formatDateKey(date)));
  });

  const minimumCheckin = formatDateKey(earliestCheckinDate);
  checkinInput.min = minimumCheckin;
  checkoutInput.min = formatDateKey(addDays(earliestCheckinDate, 2));

  const getText = (path, fallback = '') => getNestedValue(dictionary, path) || fallback;

  function setFieldValidity(input, message = '') {
    if (!input) return;
    input.setCustomValidity(message);
    input
      .closest('.field, .booking-toggle, .booking-confirmation, .booking-choice-card')
      ?.classList.toggle('is-invalid', Boolean(message));
  }

  function clearFieldValidity(input) {
    setFieldValidity(input, '');
  }

  function requiredLabel(text) {
    return `${text}<span class="required-mark" aria-hidden="true">*</span>`;
  }

  function getGuestCounts() {
    const adults = Math.max(1, Number(adultInput.value || 1));
    const children = Math.max(0, Number(childInput.value || 0));
    const total = adults + children;
    return { adults, children, total };
  }

  function clampGuestCounts() {
    const adults = Math.min(6, Math.max(1, Number(adultInput.value || 1)));
    const children = Math.max(0, Number(childInput.value || 0));

    adultInput.value = String(adults);

    if (adults + children > 6) {
      childInput.value = String(Math.max(0, 6 - adults));
    }
  }

  function needsBedPreference() {
    const { adults, total } = getGuestCounts();
    return adults >= 2 && adults <= 4 && total <= 4;
  }

  function renderBedPreference() {
    if (!bedPreferenceGroup) return;

    const shouldShow = needsBedPreference();
    bedPreferenceGroup.hidden = !shouldShow;

    bedPreferenceInputs.forEach((input) => {
      input.required = shouldShow;
    });

    if (!shouldShow) {
      bedPreferenceInputs.forEach((input) => {
        input.checked = false;
        clearFieldValidity(input);
      });
    }
  }

  function renderChildAgeFields() {
    const { children } = getGuestCounts();
    childAgesGroup.hidden = children === 0;

    if (children === 0) {
      childAgeFields.replaceChildren();
      return;
    }

    const existingValues = Array.from(childAgeFields.querySelectorAll('input')).map((input) => input.value);
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < children; index += 1) {
      const label = document.createElement('label');
      label.className = 'field';
      label.innerHTML = `
        <span>${requiredLabel(`${getText('bookingPage.form.childAgeLabel')} ${index + 1}`)}</span>
        <input type="number" min="0" max="12" step="1" name="child_age_${index + 1}" required value="${existingValues[index] || ''}" />
      `;
      fragment.append(label);
    }

    childAgeFields.replaceChildren(fragment);
  }

  function getBikeSelection() {
    if (!bikeReservationToggle?.checked) return { bikes: 0, rentalDays: 0, units: 0 };

    const bikes = Math.max(0, Number(bikeCountInput?.value || 0));
    const rentalDays = Math.max(0, Number(bikeRentalDaysInput?.value || 0));

    return { bikes, rentalDays, units: bikes * rentalDays };
  }

  function clampBikeInput(input) {
    if (!input) return;
    const max = Math.max(1, Number(input.max || 1));
    const value = Number(input.value || 0);

    if (!input.value) return;
    input.value = String(Math.max(1, Math.min(max, value)));
  }

  function renderBikeDayFields({ forceDefaults = false } = {}) {
    if (!bikeDaysGroup || !bikeReservationToggle) return;
    const isEnabled = bikeReservationToggle.checked;
    const { total } = getGuestCounts();
    const nights = diffNights(checkinInput.value, checkoutInput.value);
    const maxDays = Math.max(1, nights || 1);

    bikeDaysGroup.hidden = !isEnabled;

    if (bikeCountInput) {
      bikeCountInput.max = String(total);
      if (forceDefaults && !bikeCountInput.value) bikeCountInput.value = '1';
      clampBikeInput(bikeCountInput);
    }

    if (bikeRentalDaysInput) {
      bikeRentalDaysInput.max = String(maxDays);
      if (forceDefaults && !bikeRentalDaysInput.value) bikeRentalDaysInput.value = '1';
      clampBikeInput(bikeRentalDaysInput);
    }
  }

  function datesOverlapOccupied(checkIn, checkOut) {
    if (!checkIn || !checkOut) return false;
    return eachDate(parseDateKey(checkIn), parseDateKey(checkOut)).some((date) =>
      occupiedDates.has(formatDateKey(date))
    );
  }

  function setStatus(message = '') {
    if (!message) {
      formStatus.hidden = true;
      formStatus.textContent = '';
      return;
    }

    formStatus.hidden = false;
    formStatus.textContent = message;
  }

  function getDiscountStatusMessage(discount) {
    if (discount.valid) {
      return getText('bookingPage.form.discountCodeApplied')
        .replace('{code}', discount.code)
        .replace('{amount}', formatCurrency(discount.amount));
    }
    if (discount.pending) return getText('bookingPage.validation.discountCodeNeedsDates');
    if (discount.reason === 'notApplicable') return getText('bookingPage.validation.discountCodeNotApplicable');
    return getText('bookingPage.validation.discountCodeInvalid');
  }

  function renderDiscountCodeStatus(discount, { markInvalid = false } = {}) {
    if (!discountCodeInput || !discountCodeStatus) return;

    const message = getDiscountStatusMessage(discount);
    discountCodeStatus.hidden = !message;
    discountCodeStatus.textContent = message;
    discountCodeStatus.classList.toggle('field-success', Boolean(discount.valid));
    discountCodeStatus.classList.toggle('field-warning', Boolean(discount.code && !discount.valid && !discount.pending));

    if (!discount.code || discount.valid || discount.pending) {
      clearFieldValidity(discountCodeInput);
      return;
    }

    if (markInvalid) {
      setFieldValidity(discountCodeInput, message);
    }
  }

  function syncCheckoutBounds() {
    if (!checkinInput.value) {
      checkoutInput.min = formatDateKey(addDays(earliestCheckinDate, 2));
      return;
    }

    checkoutInput.min = formatDateKey(addDays(parseDateKey(checkinInput.value), 2));
  }

  function renderSummary() {
    const { adults, children, total } = getGuestCounts();
    const nights = diffNights(checkinInput.value, checkoutInput.value);
    const includeDeposit = Boolean(depositPrepayInput?.checked);
    const selectedBedPreference = bedPreferenceInputs.find((input) => input.checked)?.value || '';
    const bikeSelection = getBikeSelection();
    const bikeDays = bikeSelection.units;
    const breakdown = buildReservationBreakdown({
      nights,
      adults,
      children,
      includeDeposit,
      bikeDays,
      checkIn: checkinInput.value,
      checkOut: checkoutInput.value,
      discountCode: discountCodeInput?.value || ''
    });

    const summaryDateKeys = getStayDateKeys(checkinInput.value, checkoutInput.value);
    const rateDateKeys = summaryDateKeys.length ? summaryDateKeys : [checkinInput.value];
    const adultNightlyTotals = rateDateKeys.map((dateKey) => getNightlyAdultValue(dateKey, adults));
    const childNightlyTotals = rateDateKeys.map((dateKey) => getNightlyChildValue(dateKey, children));

    priceAdult.textContent = formatGuestRateLabel({
      amountText: formatRateRange(adultNightlyTotals),
      count: adults,
      singularLabel: getText('bookingPage.summary.adultSingular', 'adulto'),
      pluralLabel: getText('bookingPage.summary.adultPlural', 'adultos')
    });
    if (summaryChildRate) {
      summaryChildRate.hidden = children === 0;
    }
    if (priceChild) {
      priceChild.textContent = formatGuestRateLabel({
        amountText: formatRateRange(childNightlyTotals),
        count: children,
        singularLabel: getText('bookingPage.summary.childSingular', 'criança'),
        pluralLabel: getText('bookingPage.summary.childPlural', 'crianças')
      });
    }
    if (priceBike) {
      priceBike.textContent = formatCurrency(PRICE_CONFIG.bikePerDay);
    }
    priceDeposit.textContent = formatCurrency(PRICE_CONFIG.securityDeposit);
    if (summaryDepositRate) {
      summaryDepositRate.hidden = !includeDeposit;
    }
    if (summaryBikeRate) {
      summaryBikeRate.hidden = bikeDays === 0;
    }
    if (summaryDepositNote) {
      summaryDepositNote.hidden = !includeDeposit;
    }
    summaryNights.textContent = String(Math.max(nights, 0));
    summaryGuests.textContent = String(total);
    summaryAdults.textContent = String(adults);
    summaryKids.textContent = String(children);
    if (summaryDepositChoice) {
      summaryDepositChoice.textContent = includeDeposit
        ? getText('bookingPage.summary.depositChoiceYes')
        : getText('bookingPage.summary.depositChoiceNo');
    }
    if (summaryBikesRow && summaryBikes) {
      summaryBikesRow.hidden = bikeDays === 0;
      summaryBikes.textContent = getText('bookingPage.summary.bikesPattern')
        .replace('{bikes}', String(bikeSelection.bikes))
        .replace('{days}', String(bikeSelection.rentalDays))
        .replace('{units}', String(bikeDays));
    }
    if (summaryDiscountRow && summaryDiscount) {
      summaryDiscountRow.hidden = !breakdown.discount.valid;
      summaryDiscount.textContent = breakdown.discount.valid
        ? `-${formatCurrency(breakdown.discount.amount)}`
        : '-';
    }
    renderDiscountCodeStatus(breakdown.discount);
    if (summaryBedPreferenceRow && summaryBedPreference) {
      const showBedPreference = needsBedPreference();
      summaryBedPreferenceRow.hidden = !showBedPreference;
      if (showBedPreference) {
        summaryBedPreference.textContent =
          selectedBedPreference === 'double'
            ? getText('bookingPage.summary.bedPreferenceDouble')
            : selectedBedPreference === 'single'
              ? getText('bookingPage.summary.bedPreferenceSingle')
              : getText('bookingPage.summary.bedPreferencePending');
      } else {
        summaryBedPreference.textContent = '-';
      }
    }
    summaryTotal.textContent = formatCurrency(breakdown.total);
  }

  function renderTimezoneWarning() {
    if (!timezoneWarning) return;

    timezoneWarning.hidden = usesPortugueseTimezone();
  }

  function renderCalendar() {
    const calendarHeader = document.createElement('div');
    calendarHeader.className = 'calendar-header';

    const previousButton = document.createElement('button');
    previousButton.type = 'button';
    previousButton.className = 'calendar-nav-button';
    previousButton.textContent = '‹';
    previousButton.disabled = visibleMonthOffset === 0;
    previousButton.setAttribute('aria-label', getText('bookingPage.availability.previousMonths'));
    previousButton.addEventListener('click', () => {
      visibleMonthOffset = Math.max(visibleMonthOffset - 1, 0);
      renderCalendar();
    });

    const currentRange = document.createElement('p');
    currentRange.className = 'calendar-range-label';
    const firstVisibleMonth = new Date(today.getFullYear(), today.getMonth() + visibleMonthOffset, 1);
    const lastVisibleMonth = new Date(
      today.getFullYear(),
      today.getMonth() + visibleMonthOffset + monthsToRender - 1,
      1
    );
    currentRange.textContent = `${monthFormatter().format(firstVisibleMonth)} - ${monthFormatter().format(lastVisibleMonth)}`;

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'calendar-nav-button';
    nextButton.textContent = '›';
    nextButton.setAttribute('aria-label', getText('bookingPage.availability.nextMonths'));
    nextButton.addEventListener('click', () => {
      visibleMonthOffset += 1;
      renderCalendar();
    });

    const todayButton = document.createElement('button');
    todayButton.type = 'button';
    todayButton.className = 'calendar-today-button';
    todayButton.textContent = getText('bookingPage.availability.todayButton');
    todayButton.disabled = visibleMonthOffset === 0;
    todayButton.addEventListener('click', () => {
      visibleMonthOffset = 0;
      renderCalendar();
    });

    const headerMain = document.createElement('div');
    headerMain.className = 'calendar-header-main';
    headerMain.append(previousButton, currentRange, nextButton);

    calendarHeader.append(headerMain, todayButton);

    const monthsWrapper = document.createElement('div');
    monthsWrapper.className = 'calendar-months';

    for (let offset = 0; offset < monthsToRender; offset += 1) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + visibleMonthOffset + offset, 1);
      const monthCard = document.createElement('section');
      monthCard.className = 'calendar-month';

      const title = document.createElement('h3');
      title.textContent = monthFormatter().format(monthDate);
      monthCard.append(title);

      const weekdaysRow = document.createElement('div');
      weekdaysRow.className = 'calendar-weekdays';

      const weekdayBase = new Date(2026, 3, 27);
      for (let weekday = 0; weekday < 7; weekday += 1) {
        const label = document.createElement('span');
        label.textContent = weekdayFormatter().format(addDays(weekdayBase, weekday)).slice(0, 2);
        weekdaysRow.append(label);
      }

      monthCard.append(weekdaysRow);

      const daysGrid = document.createElement('div');
      daysGrid.className = 'calendar-days';
      const firstWeekday = (monthDate.getDay() + 6) % 7;
      const monthDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

      for (let blank = 0; blank < firstWeekday; blank += 1) {
        const placeholder = document.createElement('span');
        placeholder.className = 'calendar-empty';
        daysGrid.append(placeholder);
      }

      for (let day = 1; day <= monthDays; day += 1) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const key = formatDateKey(date);
        const isPast = key < minimumCheckin;
        const isOccupied = occupiedDates.has(key);
        const isSelected = key === checkinInput.value || key === checkoutInput.value;
        const isInRange =
          checkinInput.value &&
          checkoutInput.value &&
          key > checkinInput.value &&
          key < checkoutInput.value;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.textContent = String(day);
        button.dataset.date = key;
        button.disabled = isPast || isOccupied;
        button.classList.toggle('is-past', isPast);
        button.classList.toggle('is-occupied', isOccupied);
        button.classList.toggle('is-selected', isSelected);
        button.classList.toggle('is-start', key === checkinInput.value);
        button.classList.toggle('is-end', key === checkoutInput.value);
        button.classList.toggle('is-in-range', Boolean(isInRange));
        button.classList.toggle('is-today', key === minimumCheckin);
        button.setAttribute('aria-label', key);

        button.addEventListener('click', () => {
          if (!checkinInput.value || (checkinInput.value && checkoutInput.value)) {
            checkinInput.value = key;
            checkoutInput.value = '';
            syncCheckoutBounds();
            setStatus(getText('bookingPage.validation.chooseCheckout'));
          } else {
            const [startDate, endDate] = key < checkinInput.value ? [key, checkinInput.value] : [checkinInput.value, key];
            checkinInput.value = startDate;
            checkoutInput.value = endDate;
            syncCheckoutBounds();

            const validationMessage = validateDateSelection(false);
            setStatus(validationMessage);

            if (validationMessage) {
              checkoutInput.value = '';
            }
          }

          renderBikeDayFields();
          renderSummary();
          renderCalendar();
        });

        daysGrid.append(button);
      }

      monthCard.append(daysGrid);
      monthsWrapper.append(monthCard);
    }

    calendar.replaceChildren(calendarHeader, monthsWrapper);
  }

  function validateDateSelection(showBrowserMessages = true) {
    const checkIn = checkinInput.value;
    const checkOut = checkoutInput.value;
    const nights = diffNights(checkIn, checkOut);
    clearFieldValidity(checkinInput);
    clearFieldValidity(checkoutInput);

    if (!checkIn || !checkOut) {
      const message = getText('bookingPage.validation.datesRequired');
      setFieldValidity(checkinInput, message);
      setFieldValidity(checkoutInput, message);
      if (showBrowserMessages) checkinInput.reportValidity();
      return message;
    }

    if (checkIn < minimumCheckin) {
      const message = getText('bookingPage.validation.checkinTooSoon');
      setFieldValidity(checkinInput, message);
      if (showBrowserMessages) checkinInput.reportValidity();
      return message;
    }

    if (nights < 2) {
      const message = getText('bookingPage.validation.minStay');
      setFieldValidity(checkoutInput, message);
      if (showBrowserMessages) checkoutInput.reportValidity();
      return message;
    }

    if (datesOverlapOccupied(checkIn, checkOut)) {
      const message = getText('bookingPage.validation.occupiedRange');
      setFieldValidity(checkoutInput, message);
      if (showBrowserMessages) checkoutInput.reportValidity();
      return message;
    }

    return '';
  }

  function validateSingleDateField(input) {
    if (!input?.value) {
      clearFieldValidity(input);
      return '';
    }

    if (input === checkinInput) {
      clearFieldValidity(checkinInput);

      if (checkinInput.value < minimumCheckin) {
        const message = getText('bookingPage.validation.checkinTooSoon');
        setFieldValidity(checkinInput, message);
        return message;
      }

      if (occupiedDates.has(checkinInput.value)) {
        const message = getText('bookingPage.validation.dateUnavailable');
        setFieldValidity(checkinInput, message);
        return message;
      }
    }

    if (input === checkoutInput) {
      clearFieldValidity(checkoutInput);

      if (checkinInput.value) {
        return validateDateSelection(false);
      }

      const earliestCheckout = formatDateKey(addDays(earliestCheckinDate, 2));
      if (checkoutInput.value < earliestCheckout) {
        const message = getText('bookingPage.validation.checkoutTooSoon');
        setFieldValidity(checkoutInput, message);
        return message;
      }
    }

    return '';
  }

  function validateBooking(showBrowserMessages = true) {
    const { adults, total } = getGuestCounts();
    const childAgeInputs = Array.from(childAgeFields.querySelectorAll('input'));

    childAgeInputs.forEach((input) => clearFieldValidity(input));
    [bikeCountInput, bikeRentalDaysInput].forEach((input) => clearFieldValidity(input));
    clearFieldValidity(adultInput);
    clearFieldValidity(childInput);
    bedPreferenceInputs.forEach((input) => clearFieldValidity(input));
    clearFieldValidity(contactNameInput);
    clearFieldValidity(contactEmailInput);
    clearFieldValidity(contactPhoneInput);
    clearFieldValidity(discountCodeInput);
    clearFieldValidity(rulesConfirmationInput);

    const dateMessage = validateDateSelection(showBrowserMessages);
    if (dateMessage) {
      return dateMessage;
    }

    if (!contactNameInput?.value.trim()) {
      const message = getText('bookingPage.validation.contactNameRequired');
      setFieldValidity(contactNameInput, message);
      if (showBrowserMessages) contactNameInput?.reportValidity();
      return message;
    }

    if (!contactEmailInput?.value.trim()) {
      const message = getText('bookingPage.validation.emailRequired');
      setFieldValidity(contactEmailInput, message);
      if (showBrowserMessages) contactEmailInput?.reportValidity();
      return message;
    }

    if (contactEmailInput && !contactEmailInput.checkValidity()) {
      const message = getText('bookingPage.validation.emailInvalid');
      setFieldValidity(contactEmailInput, message);
      if (showBrowserMessages) contactEmailInput.reportValidity();
      return message;
    }

    if (contactPhoneInput?.value.trim() && !isValidPhoneNumber(contactPhoneInput.value)) {
      const message = getText('bookingPage.validation.phoneInvalid');
      setFieldValidity(contactPhoneInput, message);
      if (showBrowserMessages) contactPhoneInput.reportValidity();
      return message;
    }

    if (checkinTimeInput?.value && (checkinTimeInput.value < '15:00' || checkinTimeInput.value > '19:00')) {
      const message = getText('bookingPage.validation.checkinTimeInvalid');
      setFieldValidity(checkinTimeInput, message);
      if (showBrowserMessages) checkinTimeInput.reportValidity();
      return message;
    }

    if (checkoutTimeInput?.value && (checkoutTimeInput.value < '08:00' || checkoutTimeInput.value > '10:00')) {
      const message = getText('bookingPage.validation.checkoutTimeInvalid');
      setFieldValidity(checkoutTimeInput, message);
      if (showBrowserMessages) checkoutTimeInput.reportValidity();
      return message;
    }

    const discountBreakdown = buildReservationBreakdown({
      nights: diffNights(checkinInput.value, checkoutInput.value),
      adults,
      children: getGuestCounts().children,
      includeDeposit: Boolean(depositPrepayInput?.checked),
      bikeDays: getBikeSelection().units,
      checkIn: checkinInput.value,
      checkOut: checkoutInput.value,
      discountCode: discountCodeInput?.value || ''
    });

    if (discountCodeInput?.value.trim() && !discountBreakdown.discount.valid) {
      const message = getDiscountStatusMessage(discountBreakdown.discount);
      renderDiscountCodeStatus(discountBreakdown.discount, { markInvalid: true });
      if (showBrowserMessages) discountCodeInput.reportValidity();
      return message;
    }

    if (adults < 1) {
      const message = getText('bookingPage.validation.minimumAdults');
      setFieldValidity(adultInput, message);
      if (showBrowserMessages) adultInput.reportValidity();
      return message;
    }

    if (total > 6) {
      const message = getText('bookingPage.validation.maxGuests');
      setFieldValidity(childInput, message);
      if (showBrowserMessages) childInput.reportValidity();
      return message;
    }

    if (bikeReservationToggle?.checked) {
      const bikeCount = Math.max(0, Number(bikeCountInput?.value || 0));
      const rentalDays = Math.max(0, Number(bikeRentalDaysInput?.value || 0));
      const nights = Math.max(diffNights(checkinInput.value, checkoutInput.value), 0);

      if (!checkinInput.value || !checkoutInput.value) {
        const message = getText('bookingPage.validation.bikeDatesRequired');
        setFieldValidity(bikeReservationToggle, message);
        if (showBrowserMessages) bikeReservationToggle.reportValidity();
        return message;
      }

      if (bikeCount < 1) {
        const message = getText('bookingPage.validation.bikesRequired');
        setFieldValidity(bikeCountInput, message);
        if (showBrowserMessages) bikeCountInput?.reportValidity();
        return message;
      }

      if (bikeCount > total) {
        const message = getText('bookingPage.validation.bikesMax');
        setFieldValidity(bikeCountInput, message);
        if (showBrowserMessages) bikeCountInput?.reportValidity();
        return message;
      }

      if (rentalDays < 1 || rentalDays > nights) {
        const message = getText('bookingPage.validation.bikeDaysMax');
        setFieldValidity(bikeRentalDaysInput, message);
        if (showBrowserMessages) bikeRentalDaysInput?.reportValidity();
        return message;
      }
    }

    if (needsBedPreference() && !bedPreferenceInputs.some((input) => input.checked)) {
      const message = getText('bookingPage.validation.bedPreferenceRequired');
      bedPreferenceInputs.forEach((input) => setFieldValidity(input, message));
      if (showBrowserMessages) bedPreferenceInputs[0]?.reportValidity();
      return message;
    }

    for (const input of childAgeInputs) {
      if (!input.value) {
        const message = getText('bookingPage.validation.childAgeRequired');
        setFieldValidity(input, message);
        if (showBrowserMessages) input.reportValidity();
        return message;
      }

      const age = Number(input.value);
      if (!Number.isFinite(age) || age < 0 || age > 12) {
        const message = getText('bookingPage.validation.childAgeRange');
        setFieldValidity(input, message);
        if (showBrowserMessages) input.reportValidity();
        return message;
      }
    }

    if (rulesConfirmationInput && !rulesConfirmationInput.checked) {
      const message = getText('bookingPage.validation.rulesConfirmationRequired');
      setFieldValidity(rulesConfirmationInput, message);
      if (showBrowserMessages) rulesConfirmationInput.reportValidity();
      return message;
    }

    return '';
  }

  function rerenderDynamicContent() {
    renderBedPreference();
    renderChildAgeFields();
    renderBikeDayFields();
    renderSummary();
    renderCalendar();
  }

  renderTimezoneWarning();
  rerenderDynamicContent();
  setStatus('');

  checkinInput.addEventListener('change', () => {
    syncCheckoutBounds();
    if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
      checkoutInput.value = '';
    }
    setStatus('');
    renderBikeDayFields();
    renderSummary();
    renderCalendar();
  });

  checkoutInput.addEventListener('change', () => {
    setStatus(validateDateSelection(false));
    renderBikeDayFields();
    renderSummary();
    renderCalendar();
  });

  [checkinInput, checkoutInput].forEach((input) =>
    input.addEventListener('blur', () => {
      const message = validateSingleDateField(input);
      if (message) {
        setStatus(message);
      } else if (!checkinInput.value || !checkoutInput.value) {
        setStatus('');
      }
    })
  );

  adultInput.addEventListener('input', () => {
    clampGuestCounts();
    rerenderDynamicContent();
  });

  childInput.addEventListener('input', () => {
    clampGuestCounts();
    rerenderDynamicContent();
  });

  bedPreferenceInputs.forEach((input) =>
    input.addEventListener('change', () => {
      bedPreferenceInputs.forEach((radio) => clearFieldValidity(radio));
      setStatus('');
      renderSummary();
    })
  );

  [checkinTimeInput, checkoutTimeInput].forEach((input) =>
    input.addEventListener('change', () => {
      clearFieldValidity(input);
      setStatus('');
    })
  );

  [contactNameInput, contactEmailInput, contactPhoneInput, contactNationalityInput].forEach((input) =>
    input?.addEventListener('input', () => {
      clearFieldValidity(input);
      setStatus('');
    })
  );

  [
    checkinInput,
    checkoutInput,
    adultInput,
    childInput,
    checkinTimeInput,
    checkoutTimeInput
  ].forEach((input) =>
    input?.addEventListener('input', () => {
      clearFieldValidity(input);
    })
  );

  depositPrepayInput?.addEventListener('change', () => {
    renderSummary();
  });

  discountCodeInput?.addEventListener('input', () => {
    discountCodeInput.value = discountCodeInput.value.toUpperCase();
    clearFieldValidity(discountCodeInput);
    renderSummary();
  });

  discountCodeInput?.addEventListener('blur', () => {
    discountCodeInput.value = normalizeDiscountCode(discountCodeInput.value);
    renderSummary();
  });

  bikeReservationToggle?.addEventListener('change', () => {
    clearFieldValidity(bikeReservationToggle);
    renderBikeDayFields({ forceDefaults: bikeReservationToggle.checked });
    renderSummary();
  });

  [bikeCountInput, bikeRentalDaysInput].forEach((input) =>
    input?.addEventListener('input', () => {
      clearFieldValidity(input);
      renderSummary();
    })
  );

  [bikeCountInput, bikeRentalDaysInput].forEach((input) =>
    input?.addEventListener('change', () => {
      clampBikeInput(input);
      renderSummary();
    })
  );

  rulesConfirmationInput?.addEventListener('change', () => {
    clearFieldValidity(rulesConfirmationInput);
    setStatus('');
  });

  form?.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    clearFieldValidity(target);
  });

  resetButton?.addEventListener('click', () => {
    const confirmed = window.confirm(getText('bookingPage.form.resetConfirm'));

    if (!confirmed) return;

    form.reset();
    adultInput.value = '2';
    childInput.value = '0';
    bedPreferenceInputs.forEach((input) => {
      input.checked = false;
      clearFieldValidity(input);
    });
    checkinInput.min = minimumCheckin;
    checkoutInput.min = formatDateKey(addDays(earliestCheckinDate, 2));
    visibleMonthOffset = 0;
    form.querySelectorAll('input, textarea').forEach((field) => clearFieldValidity(field));
    setStatus('');
    rerenderDynamicContent();
  });

  form?.addEventListener('submit', async (event) => {
    const message = validateBooking(true);
    if (message) {
      event.preventDefault();
      setStatus(message);
      return;
    }

    event.preventDefault();

    const { adults, children, total } = getGuestCounts();
    const nights = Math.max(diffNights(checkinInput.value, checkoutInput.value), 0);
    const includeDeposit = Boolean(depositPrepayInput?.checked);
    const bikeCount = bikeReservationToggle?.checked ? Math.max(0, Number(bikeCountInput?.value || 0)) : 0;
    const bikeRentalDays = bikeReservationToggle?.checked ? Math.max(0, Number(bikeRentalDaysInput?.value || 0)) : 0;
    const bikeDays = bikeCount * bikeRentalDays;
    const totalBreakdown = buildReservationBreakdown({
      nights,
      adults,
      children,
      includeDeposit,
      bikeDays,
      checkIn: checkinInput.value,
      checkOut: checkoutInput.value,
      discountCode: discountCodeInput?.value || ''
    });
    const totalEstimate = totalBreakdown.total;
    const params = new URLSearchParams();
    const action = form.getAttribute('action') || './reserva-enviada.html';
    const commentsInput = form.querySelector('#reservation-comments');
    const reservationId = createWebsiteReservationId();
    const preferredLanguage = getActiveLanguage();
    const childAges = Array.from(childAgeFields.querySelectorAll('input'))
      .map((input) => input.value.trim())
      .filter(Boolean)
      .map(Number);
    const selectedBedPreference = bedPreferenceInputs.find((input) => input.checked)?.value || '';
    const comments = commentsInput instanceof HTMLTextAreaElement ? commentsInput.value.trim() : '';

    params.set('reservation_id', reservationId);
    params.set('checkin', checkinInput.value);
    params.set('checkout', checkoutInput.value);
    params.set('nights', String(nights));
    params.set('adults', String(adults));
    params.set('children', String(children));
    params.set('total_guests', String(total));
    params.set('preferred_language', preferredLanguage);
    params.set('contact_name', contactNameInput?.value.trim() || '');
    params.set('contact_email', contactEmailInput?.value.trim() || '');
    if (contactNationalityInput?.value.trim()) {
      params.set('contact_nationality', contactNationalityInput.value.trim());
    }

    if (contactPhoneInput?.value.trim()) {
      params.set('contact_phone', contactPhoneInput.value.trim());
    }

    if (checkinTimeInput?.value) {
      params.set('checkin_time', checkinTimeInput.value);
    }

    if (checkoutTimeInput?.value) {
      params.set('checkout_time', checkoutTimeInput.value);
    }

    if (selectedBedPreference) {
      params.set('bed_preference', selectedBedPreference);
    }

    if (includeDeposit) {
      params.set('deposit_prepay', 'true');
    }

    if (marketingOptInInput?.checked) {
      params.set('marketing_opt_in', 'true');
    }

    if (bikeDays > 0) {
      params.set('bike_count', String(bikeCount));
      params.set('bike_rental_days', String(bikeRentalDays));
      params.set('bike_days_total', String(bikeDays));
    }

    if (comments) {
      params.set('comments', comments);
    }

    if (totalBreakdown.discount.valid) {
      params.set('discount_code', totalBreakdown.discount.code);
      params.set('discount_amount', String(totalBreakdown.discount.amount));
      params.set('discount_title', totalBreakdown.discount.title || totalBreakdown.discount.code);
    }

    childAges.forEach((age) => params.append('child_age', String(age)));

    params.set('reservation_total', String(totalEstimate));

    await saveWebsiteRequestToAdminPrototype({
      id: reservationId,
      status: 'new',
      submittedAt: new Date().toISOString(),
      preferredLanguage,
      contact: {
        name: contactNameInput?.value.trim() || '',
        email: contactEmailInput?.value.trim() || '',
        phone: contactPhoneInput?.value.trim() || '',
        nationality: contactNationalityInput?.value.trim() || ''
      },
      stay: {
        checkIn: checkinInput.value,
        checkOut: checkoutInput.value,
        checkInTime: checkinTimeInput?.value || '15:00',
        checkOutTime: checkoutTimeInput?.value || '10:00'
      },
      guests: {
        adults,
        children,
        childAges
      },
      preferences: {
        bed: selectedBedPreference
      },
      extras: {
        bikes: {
          count: bikeCount,
          days: bikeRentalDays
        }
      },
      depositPrepay: includeDeposit,
      marketingOptIn: Boolean(marketingOptInInput?.checked),
      comments,
      pricing: totalBreakdown.discount.valid ? {
        discountCode: totalBreakdown.discount.code,
        discountTitle: totalBreakdown.discount.title || totalBreakdown.discount.code,
        discountType: 'amount',
        discountPercent: 0,
        discountAmount: totalBreakdown.discount.amount
      } : undefined,
      estimatedTotal: totalEstimate
    });

    window.location.href = `${action}?${params.toString()}`;
  });

  document.addEventListener('language:changed', (event) => {
    dictionary = event.detail?.dictionary || getCurrentDictionary();
    rerenderDynamicContent();
  });
}
