export const ROLES = {
  OWNER: 'owner',
  DEV: 'dev',
  EMPLOYEE: 'employee'
};

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Proprietário',
  [ROLES.DEV]: 'Dev',
  [ROLES.EMPLOYEE]: 'Funcionário'
};

const OWNER_PERMISSIONS = [
  'dashboard:view',
  'calendar:view',
  'reservations:view',
  'reservations:write',
  'reservations:override-conflict',
  'requests:view',
  'requests:manage',
  'guests:view',
  'pricing:view',
  'pricing:write',
  'expenses:view',
  'expenses:write',
  'employees:view',
  'employees:manage',
  'work:own',
  'work:manage',
  'messages:generate',
  'reports:view',
  'settings:view',
  'data:export',
  'data:reset'
];

const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: new Set(OWNER_PERMISSIONS),
  [ROLES.DEV]: new Set(OWNER_PERMISSIONS),
  [ROLES.EMPLOYEE]: new Set([
    'dashboard:view',
    'calendar:view',
    'reservations:view',
    'reservations:operations',
    'guests:view',
    'work:own',
    'messages:generate'
  ])
};

export function can(user, permission) {
  if (!user || !permission) return false;
  return Boolean(ROLE_PERMISSIONS[user.role]?.has(permission));
}

export function requirePermission(user, permission) {
  if (can(user, permission)) return;
  throw new Error('Não tem permissão para realizar esta ação.');
}
