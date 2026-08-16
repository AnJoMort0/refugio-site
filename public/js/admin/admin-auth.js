import { ROLE_LABELS, ROLES } from './admin-permissions.js';

const SESSION_KEY = 'refugio-admin-session-v1';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const OWNER_DEMO_PASSWORD_HASH = 'd5fd83be5bbf14d12b51e583d73f43dc29507ef2f54d9e00109bee2e7d120f22';
const EMPLOYEE_DEMO_PASSWORD_HASH = '7670cb825839e6f743f319c2abb3c68064566426c7a2af33ba0dea458d0b663e';

const USERS = [
  {
    id: 'user-owner-jorge',
    username: 'jorge',
    displayName: 'Jorge',
    role: ROLES.OWNER,
    passwordHash: OWNER_DEMO_PASSWORD_HASH
  },
  {
    id: 'user-owner-paula',
    username: 'paula',
    displayName: 'Paula',
    role: ROLES.OWNER,
    passwordHash: OWNER_DEMO_PASSWORD_HASH
  },
  {
    id: 'user-owner-barbara',
    username: 'barbara',
    displayName: 'Bárbara',
    role: ROLES.OWNER,
    passwordHash: OWNER_DEMO_PASSWORD_HASH
  },
  {
    id: 'user-owner-marlene',
    username: 'marlene',
    displayName: 'Marlene',
    role: ROLES.OWNER,
    passwordHash: OWNER_DEMO_PASSWORD_HASH
  },
  {
    id: 'user-dev-andre',
    username: 'andre',
    displayName: 'André',
    role: ROLES.DEV,
    passwordHash: OWNER_DEMO_PASSWORD_HASH
  },
  {
    id: 'user-employee-dulce',
    username: 'dulce',
    displayName: 'Dulce',
    role: ROLES.EMPLOYEE,
    passwordHash: EMPLOYEE_DEMO_PASSWORD_HASH
  },
  {
    id: 'user-employee-fabio',
    username: 'fabio',
    displayName: 'Fábio',
    role: ROLES.EMPLOYEE,
    passwordHash: EMPLOYEE_DEMO_PASSWORD_HASH
  }
];

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256(value) {
  const encoded = new TextEncoder().encode(value);
  return toHex(await crypto.subtle.digest('SHA-256', encoded));
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] || user.role
  };
}

export function getAvailableUsers() {
  return USERS.map(sanitizeUser);
}

export async function login(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  const user = USERS.find((candidate) => candidate.username === normalizedUsername);

  if (!user || await sha256(password) !== user.passwordHash) {
    throw new Error('Utilizador ou palavra-passe inválidos.');
  }

  const session = {
    user: sanitizeUser(user),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getStoredSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!session?.user || !session?.expiresAt) return null;

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      logout();
      return null;
    }

    return session;
  } catch (error) {
    logout();
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
