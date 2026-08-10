const DEFAULT_LANGUAGE = 'pt';
const PRICE_CONFIG = {
  adultPerNight: 48,
  childPerNight: 28,
  bikePerDay: 5,
  securityDeposit: 200
};

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function diffNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const milliseconds = parseDateKey(checkOut) - parseDateKey(checkIn);
  return Math.round(milliseconds / 86400000);
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

function getNestedValue(object, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object);
}

function formatCurrency(value) {
  return `${Math.round(value)}€`;
}

function buildReservationTotal({ nights, adults, children, includeDeposit, bikeDays = 0 }) {
  const stayValue =
    nights > 0 ? nights * (adults * PRICE_CONFIG.adultPerNight + children * PRICE_CONFIG.childPerNight) : 0;
  const bikeValue = bikeDays * PRICE_CONFIG.bikePerDay;
  return stayValue + bikeValue + (includeDeposit ? PRICE_CONFIG.securityDeposit : 0);
}

function buildOccupiedRanges(today) {
  return [
    { start: formatDateKey(addDays(today, 9)), end: formatDateKey(addDays(today, 12)) },
    { start: formatDateKey(addDays(today, 17)), end: formatDateKey(addDays(today, 21)) },
    { start: formatDateKey(addDays(today, 32)), end: formatDateKey(addDays(today, 36)) },
    { start: formatDateKey(addDays(today, 47)), end: formatDateKey(addDays(today, 51)) }
  ];
}

function isValidPhoneNumber(value) {
  const trimmedValue = value.trim();
  const digitsOnly = trimmedValue.replace(/\D/g, '');
  const hasInternationalPrefix = /^(?:\+|00)[0-9][0-9\s()\-]{5,}$/.test(trimmedValue);
  const hasPortugueseLocalFormat = /^(?:2|9)\d{8}$/.test(digitsOnly);

  return hasInternationalPrefix || hasPortugueseLocalFormat;
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
  const checkinTimeInput = document.querySelector('#checkin-time');
  const checkoutTimeInput = document.querySelector('#checkout-time');
  const depositPrepayInput = document.querySelector('#deposit-prepay');
  const bikeReservationToggle = document.querySelector('#bike-reservation-toggle');
  const bikeDaysGroup = document.querySelector('#bike-days-group');
  const bikeCountInput = document.querySelector('#bike-count');
  const bikeRentalDaysInput = document.querySelector('#bike-rental-days');
  const rulesConfirmationInput = document.querySelector('#rules-confirmation');
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
  const today = portugalNow.date;
  today.setHours(0, 0, 0, 0);
  const earliestCheckinDate = addDays(today, portugalNow.hour < 15 ? 1 : 2);
  const occupiedRanges = buildOccupiedRanges(today);
  const occupiedDates = new Set();
  const monthsToRender = 2;
  const monthFormatter = () =>
    new Intl.DateTimeFormat(document.documentElement.lang || 'pt-PT', { month: 'long', year: 'numeric' });
  const weekdayFormatter = () =>
    new Intl.DateTimeFormat(document.documentElement.lang || 'pt-PT', { weekday: 'short' });

  let dictionary = {};
  let visibleMonthOffset = 0;

  occupiedRanges.forEach(({ start, end }) => {
    eachDate(parseDateKey(start), parseDateKey(end)).forEach((date) => occupiedDates.add(formatDateKey(date)));
  });

  const minimumCheckin = formatDateKey(earliestCheckinDate);
  checkinInput.min = minimumCheckin;
  checkoutInput.min = formatDateKey(addDays(earliestCheckinDate, 2));

  const getText = (path, fallback) => getNestedValue(dictionary, path) || fallback;

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

  async function loadDictionary() {
    try {
      const language = localStorage.getItem('refugio-language') || DEFAULT_LANGUAGE;
      const response = await fetch(`./locales/${language}.json`);
      if (!response.ok) throw new Error('Locale not found');
      dictionary = await response.json();
    } catch (error) {
      dictionary = {};
    }
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
        <span>${requiredLabel(`${getText('bookingPage.form.childAgeLabel', 'Idade da criança')} ${index + 1}`)}</span>
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
    const totalValue = buildReservationTotal({ nights, adults, children, includeDeposit, bikeDays });

    priceAdult.textContent = formatCurrency(PRICE_CONFIG.adultPerNight);
    priceChild.textContent = formatCurrency(PRICE_CONFIG.childPerNight);
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
        ? getText('bookingPage.summary.depositChoiceYes', 'Sim')
        : getText('bookingPage.summary.depositChoiceNo', 'Não');
    }
    if (summaryBikesRow && summaryBikes) {
      summaryBikesRow.hidden = bikeDays === 0;
      summaryBikes.textContent = getText(
        'bookingPage.summary.bikesPattern',
        '{bikes} bicicleta(s) x {days} dia(s) = {units} bicicleta-dias'
      )
        .replace('{bikes}', String(bikeSelection.bikes))
        .replace('{days}', String(bikeSelection.rentalDays))
        .replace('{units}', String(bikeDays));
    }
    if (summaryBedPreferenceRow && summaryBedPreference) {
      const showBedPreference = needsBedPreference();
      summaryBedPreferenceRow.hidden = !showBedPreference;
      if (showBedPreference) {
        summaryBedPreference.textContent =
          selectedBedPreference === 'double'
            ? getText('bookingPage.summary.bedPreferenceDouble', 'Cama de casal')
            : selectedBedPreference === 'single'
              ? getText('bookingPage.summary.bedPreferenceSingle', 'Camas individuais')
              : getText('bookingPage.summary.bedPreferencePending', 'Por indicar');
      } else {
        summaryBedPreference.textContent = '-';
      }
    }
    summaryTotal.textContent = formatCurrency(totalValue);
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
    previousButton.setAttribute(
      'aria-label',
      getText('bookingPage.availability.previousMonths', 'Ver meses anteriores')
    );
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
    nextButton.setAttribute('aria-label', getText('bookingPage.availability.nextMonths', 'Ver meses seguintes'));
    nextButton.addEventListener('click', () => {
      visibleMonthOffset += 1;
      renderCalendar();
    });

    const todayButton = document.createElement('button');
    todayButton.type = 'button';
    todayButton.className = 'calendar-today-button';
    todayButton.textContent = getText('bookingPage.availability.todayButton', 'Hoje');
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
            setStatus(getText('bookingPage.validation.chooseCheckout', 'Agora escolha a data de check-out.'));
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
      const message = getText('bookingPage.validation.datesRequired', 'Selecione as datas de check-in e check-out.');
      setFieldValidity(checkinInput, message);
      setFieldValidity(checkoutInput, message);
      if (showBrowserMessages) checkinInput.reportValidity();
      return message;
    }

    if (checkIn < minimumCheckin) {
      const message = getText('bookingPage.validation.checkinTooSoon', 'A primeira data disponível para chegada já teve em conta a regra de hoje / amanhã em hora de Portugal.');
      setFieldValidity(checkinInput, message);
      if (showBrowserMessages) checkinInput.reportValidity();
      return message;
    }

    if (nights < 2) {
      const message = getText('bookingPage.validation.minStay', 'A estadia mínima é de 2 noites.');
      setFieldValidity(checkoutInput, message);
      if (showBrowserMessages) checkoutInput.reportValidity();
      return message;
    }

    if (datesOverlapOccupied(checkIn, checkOut)) {
      const message = getText('bookingPage.validation.occupiedRange', 'O intervalo escolhido inclui datas ocupadas.');
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
        const message = getText('bookingPage.validation.checkinTooSoon', 'A primeira data disponível para chegada já teve em conta a regra de hoje / amanhã em hora de Portugal.');
        setFieldValidity(checkinInput, message);
        return message;
      }

      if (occupiedDates.has(checkinInput.value)) {
        const message = getText('bookingPage.validation.dateUnavailable', 'A data escolhida não está disponível.');
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
        const message = getText('bookingPage.validation.checkoutTooSoon', 'Escolha uma data de check-out válida para uma estadia mínima de 2 noites.');
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
    clearFieldValidity(rulesConfirmationInput);

    const dateMessage = validateDateSelection(showBrowserMessages);
    if (dateMessage) {
      return dateMessage;
    }

    if (!contactNameInput?.value.trim()) {
      const message = getText('bookingPage.validation.contactNameRequired', 'Indique o nome do responsável pela reserva.');
      setFieldValidity(contactNameInput, message);
      if (showBrowserMessages) contactNameInput?.reportValidity();
      return message;
    }

    if (!contactEmailInput?.value.trim()) {
      const message = getText('bookingPage.validation.emailRequired', 'Indique o email do responsável pela reserva.');
      setFieldValidity(contactEmailInput, message);
      if (showBrowserMessages) contactEmailInput?.reportValidity();
      return message;
    }

    if (contactEmailInput && !contactEmailInput.checkValidity()) {
      const message = getText('bookingPage.validation.emailInvalid', 'Indique um endereço de email válido.');
      setFieldValidity(contactEmailInput, message);
      if (showBrowserMessages) contactEmailInput.reportValidity();
      return message;
    }

    if (contactPhoneInput?.value.trim() && !isValidPhoneNumber(contactPhoneInput.value)) {
      const message = getText('bookingPage.validation.phoneInvalid', 'Indique um telefone válido.');
      setFieldValidity(contactPhoneInput, message);
      if (showBrowserMessages) contactPhoneInput.reportValidity();
      return message;
    }

    if (checkinTimeInput?.value && (checkinTimeInput.value < '15:00' || checkinTimeInput.value > '19:00')) {
      const message = getText('bookingPage.validation.checkinTimeInvalid', 'O check-in deve estar entre as 15h00 e as 19h00. Se precisar de outro horário, indique esse pedido nos comentários.');
      setFieldValidity(checkinTimeInput, message);
      if (showBrowserMessages) checkinTimeInput.reportValidity();
      return message;
    }

    if (checkoutTimeInput?.value && (checkoutTimeInput.value < '08:00' || checkoutTimeInput.value > '10:00')) {
      const message = getText('bookingPage.validation.checkoutTimeInvalid', 'O check-out deve estar entre as 08h00 e as 10h00. Se precisar de outro horário, indique esse pedido nos comentários.');
      setFieldValidity(checkoutTimeInput, message);
      if (showBrowserMessages) checkoutTimeInput.reportValidity();
      return message;
    }

    if (adults < 1) {
      const message = getText('bookingPage.validation.minimumAdults', 'É necessário pelo menos 1 adulto.');
      setFieldValidity(adultInput, message);
      if (showBrowserMessages) adultInput.reportValidity();
      return message;
    }

    if (total > 6) {
      const message = getText('bookingPage.validation.maxGuests', 'O máximo permitido é 6 hóspedes no total.');
      setFieldValidity(childInput, message);
      if (showBrowserMessages) childInput.reportValidity();
      return message;
    }

    if (bikeReservationToggle?.checked) {
      const bikeCount = Math.max(0, Number(bikeCountInput?.value || 0));
      const rentalDays = Math.max(0, Number(bikeRentalDaysInput?.value || 0));
      const nights = Math.max(diffNights(checkinInput.value, checkoutInput.value), 0);

      if (!checkinInput.value || !checkoutInput.value) {
        const message = getText('bookingPage.validation.bikeDatesRequired', 'Escolha as datas da estadia antes de reservar bicicletas.');
        setFieldValidity(bikeReservationToggle, message);
        if (showBrowserMessages) bikeReservationToggle.reportValidity();
        return message;
      }

      if (bikeCount < 1) {
        const message = getText('bookingPage.validation.bikesRequired', 'Indique pelo menos uma bicicleta, ou desative esta opção.');
        setFieldValidity(bikeCountInput, message);
        if (showBrowserMessages) bikeCountInput?.reportValidity();
        return message;
      }

      if (bikeCount > total) {
        const message = getText('bookingPage.validation.bikesMax', 'Só é possível pedir uma bicicleta por hóspede, por dia.');
        setFieldValidity(bikeCountInput, message);
        if (showBrowserMessages) bikeCountInput?.reportValidity();
        return message;
      }

      if (rentalDays < 1 || rentalDays > nights) {
        const message = getText('bookingPage.validation.bikeDaysMax', 'Os dias de aluguer devem estar dentro da duração da estadia.');
        setFieldValidity(bikeRentalDaysInput, message);
        if (showBrowserMessages) bikeRentalDaysInput?.reportValidity();
        return message;
      }
    }

    if (needsBedPreference() && !bedPreferenceInputs.some((input) => input.checked)) {
      const message = getText('bookingPage.validation.bedPreferenceRequired', 'Escolha se preferem cama de casal ou camas individuais.');
      bedPreferenceInputs.forEach((input) => setFieldValidity(input, message));
      if (showBrowserMessages) bedPreferenceInputs[0]?.reportValidity();
      return message;
    }

    for (const input of childAgeInputs) {
      if (!input.value) {
        const message = getText('bookingPage.validation.childAgeRequired', 'Indique a idade de cada criança.');
        setFieldValidity(input, message);
        if (showBrowserMessages) input.reportValidity();
        return message;
      }
    }

    if (rulesConfirmationInput && !rulesConfirmationInput.checked) {
      const message = getText('bookingPage.validation.rulesConfirmationRequired', 'Confirme que leu e aceita as regras da casa.');
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

  await loadDictionary();
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

  [contactNameInput, contactEmailInput, contactPhoneInput].forEach((input) =>
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
    const confirmed = window.confirm(
      getText('bookingPage.form.resetConfirm', 'Tem a certeza que quer limpar todos os dados deste pedido?')
    );

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

  form?.addEventListener('submit', (event) => {
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
    const totalEstimate = buildReservationTotal({ nights, adults, children, includeDeposit, bikeDays });
    const params = new URLSearchParams();
    const action = form.getAttribute('action') || './reserva-enviada.html';
    const commentsInput = form.querySelector('#reservation-comments');

    params.set('checkin', checkinInput.value);
    params.set('checkout', checkoutInput.value);
    params.set('nights', String(nights));
    params.set('adults', String(adults));
    params.set('children', String(children));
    params.set('total_guests', String(total));
    params.set('contact_name', contactNameInput?.value.trim() || '');
    params.set('contact_email', contactEmailInput?.value.trim() || '');

    if (contactPhoneInput?.value.trim()) {
      params.set('contact_phone', contactPhoneInput.value.trim());
    }

    if (checkinTimeInput?.value) {
      params.set('checkin_time', checkinTimeInput.value);
    }

    if (checkoutTimeInput?.value) {
      params.set('checkout_time', checkoutTimeInput.value);
    }

    const selectedBedPreference = bedPreferenceInputs.find((input) => input.checked)?.value || '';
    if (selectedBedPreference) {
      params.set('bed_preference', selectedBedPreference);
    }

    if (includeDeposit) {
      params.set('deposit_prepay', 'true');
    }

    if (bikeDays > 0) {
      params.set('bike_count', String(bikeCount));
      params.set('bike_rental_days', String(bikeRentalDays));
      params.set('bike_days_total', String(bikeDays));
    }

    const comments = commentsInput instanceof HTMLTextAreaElement ? commentsInput.value.trim() : '';
    if (comments) {
      params.set('comments', comments);
    }

    childAgeFields.querySelectorAll('input').forEach((input) => {
      const value = input.value.trim();
      if (value) params.append('child_age', value);
    });

    params.set('reservation_total', String(totalEstimate));

    window.location.href = `${action}?${params.toString()}`;
  });

  document.addEventListener('language:changed', async () => {
    await loadDictionary();
    rerenderDynamicContent();
  });
}
