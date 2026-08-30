import { ADMIN_DATA_VERSION, createInitialAdminState } from './admin-seed.js';
import { normalizeAddress } from '../utils/countries.js';

const STORAGE_KEY = 'refugio-admin-prototype-state-v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isValidState(value) {
  return Boolean(
    value &&
    value.version === ADMIN_DATA_VERSION &&
    Array.isArray(value.reservations) &&
    Array.isArray(value.websiteRequests) &&
    Array.isArray(value.guests) &&
    Array.isArray(value.employees)
  );
}

function normalizeState(value) {
  const state = clone(value);
  state.services = Array.isArray(state.services) ? state.services : [];
  state.guests = state.guests.map((guest) => {
    const { nationality, ...guestData } = guest;
    return {
      ...guestData,
      address: normalizeAddress(guest.address, nationality),
      nif: String(guest.nif || ''),
      identityDocumentType: String(guest.identityDocumentType || ''),
      identityDocumentNumber: String(guest.identityDocumentNumber || '')
    };
  });
  state.websiteRequests = state.websiteRequests.map((request) => {
    const { nationality, ...contact } = request.contact || {};
    return {
      ...request,
      contact: {
        ...contact,
        address: normalizeAddress(request.contact?.address, nationality)
      }
    };
  });
  state.reservations = state.reservations.map((reservation) => {
    if (reservation.paymentStatus !== 'deposit_paid') {
      return {
        ...reservation,
        securityDepositPaid: Boolean(reservation.securityDepositPaid)
      };
    }

    return {
      ...reservation,
      paymentStatus: 'paid',
      securityDepositPaid: true
    };
  });

  if (!state.services.some((service) => service.id === 'bikes')) {
    state.services.push({
      id: 'bikes',
      name: 'Bicicletas',
      description: 'Aluguer por bicicleta e por dia.',
      enabled: true,
      price: Number(state.pricing?.bikeDay || 5),
      unit: 'bicicleta / dia',
      showOnBooking: true,
      showOnGuestStay: true
    });
  }

  return state;
}

export class LocalAdminRepository {
  async load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (isValidState(stored)) {
        const normalized = normalizeState(stored);
        await this.save(normalized);
        return normalized;
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }

    const initialState = createInitialAdminState();
    await this.save(initialState);
    return initialState;
  }

  async save(state) {
    const nextState = {
      ...clone(state),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    return nextState;
  }

  async reset() {
    const initialState = createInitialAdminState();
    await this.save(initialState);
    return initialState;
  }
}

export function createAdminRepository() {
  return new LocalAdminRepository();
}
