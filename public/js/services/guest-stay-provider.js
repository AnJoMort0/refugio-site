/*
  Guest Stay data provider
  ========================

  PROTOTYPE:
  This provider reads the same-origin browser localStorage entry currently used by
  the admin prototype: "refugio-admin-prototype-state-v1".

  It deliberately returns only a small guest-safe projection of the current reservation.
  qr.js should not know the full admin-state shape.

  PRODUCTION:
  Replace the implementation of loadGuestStayContext() with a request to a private,
  authenticated guest-safe API. The public URL should carry an unguessable,
  expiring/revocable stay token. The server should validate that token against the
  private reservation database and return only the fields projected below.

  Do not expose payment data, owner/internal notes, contact history, the guest directory,
  admin permissions, or other reservations to the guest page.
*/

export const ADMIN_GUEST_STAY_STORAGE_KEY = 'refugio-admin-prototype-state-v1';

const ACTIVE_STAY_STATUSES = new Set(['confirmed', 'checked_in']);

function formatLocalDateKey(date = new Date()) {
  const local = new Date(date);
  local.setHours(0, 0, 0, 0);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readAdminPrototypeState() {
  try {
    const raw = localStorage.getItem(ADMIN_GUEST_STAY_STORAGE_KEY);
    if (!raw) return null;

    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.reservations)) return null;
    return state;
  } catch (error) {
    console.warn('Guest Stay: could not read admin prototype state.', error);
    return null;
  }
}

function getCurrentReservation(state, todayKey) {
  const candidates = state.reservations
    .filter((reservation) =>
      ACTIVE_STAY_STATUSES.has(reservation?.status) &&
      reservation?.stay?.checkIn &&
      reservation?.stay?.checkOut &&
      reservation.stay.checkIn <= todayKey &&
      reservation.stay.checkOut > todayKey
    )
    .sort((a, b) => {
      // If an overlap somehow exists in prototype data, prefer an explicitly checked-in stay.
      const aCheckedIn = a.status === 'checked_in' ? 1 : 0;
      const bCheckedIn = b.status === 'checked_in' ? 1 : 0;
      if (aCheckedIn !== bCheckedIn) return bCheckedIn - aCheckedIn;

      // Then prefer the stay that started most recently.
      const byCheckIn = String(b.stay?.checkIn || '').localeCompare(String(a.stay?.checkIn || ''));
      if (byCheckIn) return byCheckIn;

      return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
    });

  if (candidates.length > 1) {
    console.warn('Guest Stay: multiple active reservations found; using the best current match.');
  }

  return candidates[0] || null;
}

function getLinkedGuest(state, reservation) {
  if (!reservation?.guestId || !Array.isArray(state.guests)) return null;
  return state.guests.find((guest) => guest.id === reservation.guestId) || null;
}

function getActiveGuestAdjustmentCounts(reservation, todayKey) {
  const adjustments = Array.isArray(reservation?.guestAdjustments)
    ? reservation.guestAdjustments
    : [];

  return adjustments.reduce((total, adjustment) => {
    const starts = adjustment?.fromDate || adjustment?.from || '';
    const ends = adjustment?.toDate || adjustment?.to || reservation?.stay?.checkOut || '';

    const active =
      (!starts || starts <= todayKey) &&
      (!ends || ends > todayKey);

    if (!active) return total;

    total.adults += Math.max(0, Number(adjustment.adults || 0));
    total.children += Math.max(0, Number(adjustment.children || 0));
    return total;
  }, { adults: 0, children: 0 });
}

function projectReservationForGuest(state, reservation, todayKey) {
  const guest = getLinkedGuest(state, reservation);
  const stay = reservation.stay || {};
  const baseGuests = reservation.guests || {};
  const extraGuests = getActiveGuestAdjustmentCounts(reservation, todayKey);
  const bikes = reservation.extras?.bikes || reservation.bikes || {};
  const property = state.property || {};

  const adults = Math.max(0, Number(baseGuests.adults || 0)) + extraGuests.adults;
  const children = Math.max(0, Number(baseGuests.children || 0)) + extraGuests.children;

  return {
    guestName: reservation.contact?.name || guest?.name || '',
    preferredLanguage: reservation.preferredLanguage || guest?.preferredLanguage || 'pt',

    checkIn: stay.checkIn || '',
    checkInTime: stay.checkInTime || property.defaultCheckInTime || '',
    checkOut: stay.checkOut || '',
    checkOutTime: stay.checkOutTime || property.defaultCheckOutTime || '',

    adults,
    children,

    bikes: {
      count: Math.max(0, Number(bikes.count || 0)),
      days: Math.max(0, Number(bikes.days || 0))
    }
  };
}

function projectGuestServices(state) {
  const configuredServices = Array.isArray(state?.services) ? state.services : [];
  if (configuredServices.length) {
    return configuredServices.map((service) => ({
      id: String(service.id || ''),
      enabled: service.enabled !== false,
      price: Math.max(0, Number(service.price || service.unitPrice || 0)),
      showOnBooking: service.showOnBooking !== false,
      showOnGuestStay: service.showOnGuestStay !== false
    }));
  }

  return [{
    id: 'bikes',
    enabled: true,
    price: Math.max(0, Number(state?.pricing?.bikeDay || 5)),
    showOnBooking: true,
    showOnGuestStay: true
  }];
}

export async function loadGuestStayContext() {
  const state = readAdminPrototypeState();
  if (!state) {
    return {
      personalised: false,
      stay: null,
      services: [{ id: 'bikes', enabled: true, price: 5, showOnBooking: true, showOnGuestStay: true }],
      source: 'generic',
      reason: 'admin-state-unavailable'
    };
  }

  const todayKey = formatLocalDateKey();
  const reservation = getCurrentReservation(state, todayKey);

  if (!reservation) {
    return {
      personalised: false,
      stay: null,
      services: projectGuestServices(state),
      source: 'admin-localstorage',
      reason: 'no-active-reservation'
    };
  }

  return {
    personalised: true,
    stay: projectReservationForGuest(state, reservation, todayKey),
    services: projectGuestServices(state),
    source: 'admin-localstorage',
    reason: ''
  };
}

export function subscribeToGuestStayUpdates(callback) {
  if (typeof callback !== 'function') return () => {};

  const listener = (event) => {
    if (event.key !== ADMIN_GUEST_STAY_STORAGE_KEY) return;
    callback();
  };

  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
