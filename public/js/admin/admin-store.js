import { ADMIN_DATA_VERSION, createInitialAdminState } from './admin-seed.js';

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

export class LocalAdminRepository {
  async load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (isValidState(stored)) return stored;
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
