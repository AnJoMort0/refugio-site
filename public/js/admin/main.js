import { getAvailableUsers, getStoredSession, login, logout } from './admin-auth.js';
import { can, requirePermission, ROLE_LABELS } from './admin-permissions.js';
import { createAdminRepository } from './admin-store.js';
import {
  COMPENSATION_LABELS,
  EXPENSE_LABELS,
  LANGUAGE_LABELS,
  PAYMENT_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  WORK_TASK_LABELS,
  addAudit,
  addDays,
  calculateExtraGuestAdjustmentTotals,
  calculateEmployeeEarnings,
  calculateReservationTotals,
  dateRangeOverlaps,
  diffNights,
  escapeHtml,
  findReservationConflicts,
  formatCurrency,
  formatDate,
  formatDateKey,
  formatDateTime,
  generateGuestMessage,
  generateStandaloneMessage,
  getDefaultMessageTemplateId,
  getEmployeeForUser,
  getGuestCount,
  getHourlyRate,
  getMessageTemplateLabel,
  getMessageTemplates,
  getWorkSessionCost,
  getOrCreateGuest,
  getWorkDurationHours,
  makeId,
  monthDayOrdinal,
  parseDateKey,
  reservationTouchesDate,
  summarizeDashboard
} from './admin-logic.js';

const app = document.querySelector('#admin-app');
const repository = createAdminRepository();
const LAST_LOGIN_USERNAME_KEY = 'refugio-admin-last-username-v1';
const MESSAGE_CATALOG_URL = new URL('../../locales/messages.json', import.meta.url);
const ACTIVE_RESERVATION_FILTER_STATUSES = ['awaiting_payment', 'confirmed', 'checked_in'];
const EXTRA_GUEST_PAYMENT_STATUSES = ['awaiting_transfer', 'paid'];
const MESSAGE_TEMPLATE_ALIASES = {
  checkinInfo: 'preArrivalInfo',
  arrivalReminder: 'preArrivalInfo',
  usefulInfo: 'preArrivalInfo',
  paymentReceived: 'bookingConfirmation'
};
const UNSAVED_FORM_TYPES = new Set([
  'create-reservation',
  'pricing',
  'service-pricing',
  'season',
  'group-discount',
  'discount',
  'expense',
  'employee-profile',
  'employee-rate',
  'employee-work',
  'reservation-operations',
  'work-active-details',
  'work-start',
  'work-manual'
]);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Painel', icon: 'layoutDashboard', permission: 'dashboard:view' },
  { id: 'calendar', label: 'Calendário', icon: 'calendarDays', permission: 'calendar:view' },
  { id: 'reservations', label: 'Reservas', icon: 'bedDouble', permission: 'reservations:view' },
  { id: 'requests', label: 'Pedidos do website', icon: 'inbox', permission: 'requests:view' },
  { id: 'pricing', label: 'Preços e descontos', icon: 'badgeEuro', permission: 'pricing:view' },
  { id: 'expenses', label: 'Despesas', icon: 'receipt', permission: 'expenses:view' },
  { id: 'employees', label: 'Funcionários', icon: 'users', permission: 'employees:view' },
  { id: 'work', label: 'O meu trabalho', icon: 'timer', permission: 'work:own' },
  { id: 'messages', label: 'Mensagens', icon: 'mail', permission: 'messages:generate' },
  { id: 'reports', label: 'Estatísticas', icon: 'chartColumn', permission: 'reports:view' },
  { id: 'settings', label: 'Definições', icon: 'settings', permission: 'settings:view' }
];

const ICONS = {
  arrowLeft: '<path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>',
  arrowRight: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
  badgeEuro: '<path d="M4 10h12"></path><path d="M4 14h9"></path><path d="M19 5.5A7 7 0 1 0 19 18.5"></path>',
  bedDouble: '<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"></path><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path><path d="M12 4v6"></path>',
  calendarDays: '<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path>',
  chartColumn: '<path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>',
  check: '<path d="M20 6 9 17l-5-5"></path>',
  chevronDown: '<path d="m6 9 6 6 6-6"></path>',
  chevronUp: '<path d="m18 15-6-6-6 6"></path>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>',
  dice: '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M8 8h.01"></path><path d="M16 8h.01"></path><path d="M8 16h.01"></path><path d="M16 16h.01"></path><path d="M12 12h.01"></path>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path>',
  edit: '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"></path>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
  layoutDashboard: '<rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
  messageCircle: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z"></path>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z"></path>',
  plus: '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6"></path><path d="M16 12h-6"></path><path d="M16 16h-6"></path>',
  rotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8"></path><path d="M3 3v5h5"></path>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.73l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"></path><circle cx="12" cy="12" r="3"></circle>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"></line><line x1="12" x2="15" y1="14" y2="11"></line><circle cx="12" cy="14" r="8"></circle>',
  trash: '<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M19 8v6"></path><path d="M22 11h-6"></path>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
};

const ui = {
  activeView: 'dashboard',
  selectedDate: formatDateKey(new Date()),
  calendarMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  reservationFilters: {
    search: '',
    status: 'all',
    source: 'all'
  },
  expandedReservationIds: new Set(),
  expandedEmployeeIds: new Set(),
  requestDraftId: '',
  editingReservationId: '',
  editingWorkSessionId: '',
  messageDraft: null,
  selectedMessageReservationId: '',
  selectedMessageTemplate: 'paymentInstructions',
  selectedMessageLanguage: 'pt',
  editingSeasonId: '',
  editingDiscountId: '',
  editingExpenseId: '',
  expandedAuditIds: new Set(),
  auditFilters: {
    search: '',
    entityType: 'all',
    actor: 'all'
  },
  reportFilters: {
    period: 'all',
    startDate: '',
    endDate: ''
  },
  showExtraGuestForm: false,
  showManualWorkForm: false,
  showPastReservations: false,
  hasUnsavedChanges: false,
  notice: '',
  noticeType: 'success'
};

let currentUser = null;
let state = null;
let messageCatalog = { templates: [], requestReplies: [] };

function icon(name) {
  return `<svg class="admin-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

function renderOption(value, label, selectedValue) {
  return `<option value="${escapeHtml(value)}"${value === selectedValue ? ' selected' : ''}>${escapeHtml(label)}</option>`;
}

function renderStatusBadge(status) {
  return `<span class="admin-status status-${escapeHtml(status)}">${escapeHtml(STATUS_LABELS[status] || status)}</span>`;
}

function renderSourceBadge(source) {
  return `<span class="admin-source">${escapeHtml(SOURCE_LABELS[source] || source)}</span>`;
}

function renderLanguageBadge(language) {
  return `<span class="admin-source">${escapeHtml(LANGUAGE_LABELS[language] || language || '-')}</span>`;
}

function getAvailableMessageTemplates() {
  return getMessageTemplates(messageCatalog);
}

function hasMessageTemplate(templateId) {
  return getAvailableMessageTemplates().some((template) => template.id === templateId);
}

function resolveMessageTemplateId(...templateIds) {
  for (const templateId of templateIds) {
    const resolvedTemplateId = MESSAGE_TEMPLATE_ALIASES[templateId] || templateId;
    if (resolvedTemplateId && hasMessageTemplate(resolvedTemplateId)) return resolvedTemplateId;
  }

  return getDefaultMessageTemplateId(messageCatalog);
}

function getSelectedMessageTemplateId() {
  return resolveMessageTemplateId(ui.selectedMessageTemplate);
}

function getDashboardMessageTemplate(reservation, context) {
  if (!reservation) return resolveMessageTemplateId('preArrivalInfo');

  if (context === 'arrival') {
    return resolveMessageTemplateId('preArrivalInfo');
  }

  if (context === 'current') {
    return resolveMessageTemplateId('checkoutInstructions');
  }

  if (context === 'departure') return resolveMessageTemplateId('checkoutInstructions');
  return resolveMessageTemplateId('preArrivalInfo');
}

function renderDashboardMessageButton(reservation, context) {
  if (!reservation || !can(currentUser, 'messages:generate')) return '';
  const template = getDashboardMessageTemplate(reservation, context);
  if (!template) return '';
  const name = reservation.contact?.name || reservation.id;

  return `
    <button class="admin-icon-button admin-kpi-action" type="button" data-action="message-for-reservation" data-reservation-id="${escapeHtml(reservation.id)}" data-template="${escapeHtml(template)}" title="Gerar mensagem para ${escapeHtml(name)}" aria-label="Gerar mensagem para ${escapeHtml(name)}">
      ${icon('mail')}
    </button>
  `;
}

function renderDashboardWorkButton() {
  if (!can(currentUser, 'work:own')) return '';
  const employee = getEmployeeForUser(state, currentUser);
  if (!employee) return '';
  const activeSession = state.workSessions.find((session) => session.employeeId === employee.id && !session.end);

  if (activeSession) {
    return `<button class="button button-primary admin-small-button" type="button" data-action="stop-work">${icon('timer')} Terminar trabalho</button>`;
  }

  return `<button class="button admin-secondary-button admin-small-button" type="button" data-action="quick-start-work">${icon('timer')} Iniciar trabalho</button>`;
}

function renderMoney(value) {
  return formatCurrency(value, state?.pricing?.currency || 'EUR');
}

function formatCompactDate(value) {
  if (!value) return '-';
  const date = parseDateKey(value);
  if (!date || Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function parseAdminDateInput(value, label = 'Data') {
  const trimmedValue = String(value || '').trim();
  if (!trimmedValue) throw new Error(`${label} é obrigatória.`);

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) return trimmedValue;

  const match = trimmedValue.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!match) throw new Error(`${label} deve estar no formato dd/mm/aaaa, dd.mm.aaaa ou dd-mm-aaaa.`);

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`${label} não é uma data válida.`);
  }

  return formatDateKey(date);
}

function parseOptionalAdminDateInput(value, label = 'Data') {
  const trimmedValue = String(value || '').trim();
  return trimmedValue ? parseAdminDateInput(trimmedValue, label) : '';
}

function getAdminDateInputPattern() {
  return '\\d{1,2}[./-]\\d{1,2}[./-]\\d{4}';
}

function getAdminFlexibleDateInputPattern() {
  return '\\d{1,2}[./-]\\d{1,2}(?:[./-]\\d{4})?';
}

function formatDateInputValue(value) {
  return value ? formatCompactDate(value) : '';
}

function getDatePickerValueFromText(value) {
  const trimmedValue = String(value || '').trim();
  if (!trimmedValue) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) return trimmedValue;

  const fullDateMatch = trimmedValue.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (fullDateMatch) {
    const [, dayText, monthText, yearText] = fullDateMatch;
    const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
    if (!Number.isNaN(date.getTime())) return formatDateKey(date);
  }

  const monthDayMatch = trimmedValue.match(/^(\d{1,2})[./-](\d{1,2})$/);
  if (monthDayMatch) {
    const [, dayText, monthText] = monthDayMatch;
    const date = new Date(new Date().getFullYear(), Number(monthText) - 1, Number(dayText));
    if (!Number.isNaN(date.getTime())) return formatDateKey(date);
  }

  return '';
}

function renderAdminDateControl({ name, value = '', placeholder = 'dd/mm/aaaa', required = false, pattern = getAdminDateInputPattern() }) {
  const pickerValue = getDatePickerValueFromText(value);

  return `
    <span class="admin-date-control" data-date-control>
      <input name="${escapeHtml(name)}" type="text" inputmode="numeric" autocomplete="off" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" pattern="${pattern}" data-date-text${required ? ' required' : ''} />
      <input class="admin-native-date-input" type="date" value="${escapeHtml(pickerValue)}" tabindex="-1" aria-hidden="true" data-date-picker />
      <button class="admin-icon-button admin-inline-icon-button admin-date-picker-button" type="button" data-action="open-date-picker" aria-label="Abrir calendário">${icon('calendarDays')}</button>
    </span>
  `;
}

function formatTimeInputValue(value) {
  if (!value) return '';
  const match = String(value).match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  return String(value).slice(0, 5);
}

function parseAdminMonthDayInput(value, label = 'Data') {
  const match = String(value || '').trim().match(/^(\d{1,2})[./-](\d{1,2})(?:[./-]\d{4})?$/);
  if (!match) throw new Error(`${label} deve estar no formato dd/mm, dd.mm, dd-mm ou uma data completa equivalente.`);

  const day = Number(match[1]);
  const month = Number(match[2]);
  const date = new Date(2028, month - 1, day);

  if (date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`${label} não é uma data válida.`);
  }

  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatMonthDay(value) {
  if (!value) return '';
  const [month, day] = String(value).split('-');
  return `${day}/${month}`;
}

function normalizeAdminTime(value, label = 'Hora') {
  const trimmedValue = String(value || '').trim();
  if (!trimmedValue) return '';
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(trimmedValue)) {
    throw new Error(`${label} deve estar no formato 24h HH:MM.`);
  }
  return trimmedValue;
}

function formatStayRange(stay) {
  return `${formatCompactDate(stay?.checkIn)} a ${formatCompactDate(stay?.checkOut)}`;
}

function formatStayTimes(stay) {
  const checkInTime = stay?.checkInTime || state.property.defaultCheckInTime;
  const checkOutTime = stay?.checkOutTime || state.property.defaultCheckOutTime;
  return `Entrada ${checkInTime} · Saída ${checkOutTime}`;
}

function formatGuestSummary(guests = {}) {
  const adults = Number(guests.adults || 0);
  const children = Number(guests.children || 0);
  const total = adults + children;

  if (!children) return `${adults} adulto${adults === 1 ? '' : 's'}`;
  return `${total} (${adults} adulto${adults === 1 ? '' : 's'} + ${children} criança${children === 1 ? '' : 's'})`;
}

function getChildAgeText(guests = {}) {
  const ages = Array.isArray(guests.childAges) ? guests.childAges : [];
  return ages.length ? ages.map((age) => `${age} ano(s)`).join(', ') : '-';
}

function getBikeText(reservation) {
  const count = Number(reservation.extras?.bikes?.count || 0);
  const days = Number(reservation.extras?.bikes?.days || 0);
  if (!count || !days) return '-';
  return `${count} bicicleta(s) · ${days} dia(s) · ${count * days} bicicleta-dia(s)`;
}

function getDepositRequestText(request) {
  if (request.depositPrepay === true || request.pricing?.depositIncluded === true) {
    return 'Pagar antecipadamente';
  }

  if (request.depositPrepay === false) {
    return 'Pagar na chegada';
  }

  return 'Pagar na chegada';
}

function getGuestAdjustments(reservation) {
  return Array.isArray(reservation?.guestAdjustments) ? reservation.guestAdjustments : [];
}

function getExtraGuestNumberText(adjustment) {
  const adults = Number(adjustment.adults || 0);
  const children = Number(adjustment.children || 0);
  const parts = [];
  if (adults) parts.push(`${adults} adulto${adults === 1 ? '' : 's'}`);
  if (children) parts.push(`${children} criança${children === 1 ? '' : 's'}`);
  return parts.join(' + ') || 'Sem hóspedes';
}

function getExtraGuestAgeText(adjustment) {
  return Array.isArray(adjustment.childAges) && adjustment.childAges.length
    ? adjustment.childAges.map((age) => `${age} ano(s)`).join(', ')
    : '-';
}

function getExtraGuestDateText(reservation, adjustment) {
  return `${formatCompactDate(adjustment.fromDate || adjustment.from)} a ${formatCompactDate(reservation.stay?.checkOut)}`;
}

function getExtraGuestDiscountType(adjustment) {
  return adjustment.discountType || (Number(adjustment.discountPercent || 0) > 0 ? 'percentage' : 'amount');
}

function getExtraGuestPaymentFieldName(adjustment) {
  return `guestAdjustmentPaymentStatus:${adjustment?.id || ''}`;
}

function normalizeExtraGuestPaymentStatus(value) {
  return EXTRA_GUEST_PAYMENT_STATUSES.includes(value) ? value : 'awaiting_transfer';
}

function formatExtraGuestDiscount(adjustment, total) {
  if (!total.discount) return '-';
  if (getExtraGuestDiscountType(adjustment) === 'percentage') {
    return `${Number(adjustment.discountPercent || 0)}% (${renderMoney(total.discount)})`;
  }

  return renderMoney(total.discount);
}

function getExtraGuestPaymentStatusChanges(previousReservation, reservation) {
  const previousById = new Map(getGuestAdjustments(previousReservation).map((adjustment) => [adjustment.id, adjustment]));

  return getGuestAdjustments(reservation).flatMap((adjustment) => {
    const previous = previousById.get(adjustment.id);
    if (!previous) return [];

    const before = normalizeExtraGuestPaymentStatus(previous.paymentStatus);
    const after = normalizeExtraGuestPaymentStatus(adjustment.paymentStatus);
    if (before === after) return [];

    const label = `${getExtraGuestDateText(reservation, adjustment)} - ${getExtraGuestNumberText(adjustment)}`;
    return [`${label}: ${PAYMENT_LABELS[before] || before} -> ${PAYMENT_LABELS[after] || after}`];
  });
}

function renderGuestAdjustmentsSummary(reservation) {
  const totals = calculateExtraGuestAdjustmentTotals(reservation, state);
  if (!totals.length) return '-';
  return totals
    .map(({ adjustment, total }) => `${getExtraGuestDateText(reservation, adjustment)} · ${getExtraGuestNumberText(adjustment)} · ${renderMoney(total)}`)
    .join('; ');
}

function renderGuestAdjustmentsList(reservation) {
  const totals = calculateExtraGuestAdjustmentTotals(reservation, state);
  if (!totals.length) return '<p class="admin-empty">Ainda não há hóspedes extra registados para parte da estadia.</p>';

  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Datas</th><th>Número</th><th>Idades</th><th>Desconto</th><th>Valor a pagar</th><th>Pagamento</th><th></th></tr></thead>
        <tbody>
          ${totals.map(({ adjustment, total, discount }) => `
            <tr>
              <td>${escapeHtml(getExtraGuestDateText(reservation, adjustment))}</td>
              <td>${escapeHtml(getExtraGuestNumberText(adjustment))}</td>
              <td>${escapeHtml(getExtraGuestAgeText(adjustment))}</td>
              <td>${escapeHtml(formatExtraGuestDiscount(adjustment, { discount }))}</td>
              <td>${renderMoney(total)}</td>
              <td>
                <select class="admin-table-select" name="${escapeHtml(getExtraGuestPaymentFieldName(adjustment))}" aria-label="Estado do pagamento dos hóspedes extra">
                  ${EXTRA_GUEST_PAYMENT_STATUSES.map((value) => renderOption(value, PAYMENT_LABELS[value], normalizeExtraGuestPaymentStatus(adjustment.paymentStatus))).join('')}
                </select>
              </td>
              <td>
                <button class="button admin-danger-button admin-small-button" type="button" data-action="remove-guest-adjustment" data-reservation-id="${escapeHtml(reservation.id)}" data-adjustment-id="${escapeHtml(adjustment.id || '')}">${icon('trash')} Remover</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderGuestAdjustmentsDetails(reservation) {
  const totals = calculateExtraGuestAdjustmentTotals(reservation, state);
  if (!totals.length) return '';

  return `
    <div class="admin-record-detail-section">
      <dt>Hóspedes extra</dt>
      <dd>
        <div class="admin-extra-guest-lines">
          ${totals.map(({ adjustment, total, discount }) => `
            <p>
              <strong>${escapeHtml(getExtraGuestNumberText(adjustment))}</strong>
              <span>Idades: ${escapeHtml(getExtraGuestAgeText(adjustment))}</span>
              <span>Datas: ${escapeHtml(getExtraGuestDateText(reservation, adjustment))}</span>
              <span>Desconto: ${escapeHtml(formatExtraGuestDiscount(adjustment, { discount }))}</span>
              <span>Valor a pagar: ${renderMoney(total)}</span>
              <span>Pagamento: ${escapeHtml(PAYMENT_LABELS[adjustment.paymentStatus] || adjustment.paymentStatus || PAYMENT_LABELS.awaiting_transfer)}</span>
            </p>
          `).join('')}
        </div>
      </dd>
    </div>
  `;
}

function getRequestDiscountText(request) {
  const code = request.pricing?.discountCode || '';
  const amount = Number(request.pricing?.discountAmount || 0);
  if (!code && !amount) return '';
  return `${code || 'Desconto'} · -${renderMoney(amount)}`;
}

function getBedPreferenceText(reservation) {
  const value = reservation.preferences?.bed || reservation.guests?.bedPreference || '';
  if (value === 'double') return 'Cama de casal';
  if (value === 'single') return 'Camas individuais';
  return value || '-';
}

function normalizePhoneForHref(phone) {
  const rawValue = String(phone || '').trim();
  if (!rawValue) return '';

  const digits = rawValue.replace(/\D/g, '');
  if (rawValue.startsWith('+')) return `+${digits}`;
  if (rawValue.startsWith('00')) return `+${digits.slice(2)}`;
  if (/^(2|9)\d{8}$/.test(digits)) return `+351${digits}`;
  return digits ? `+${digits}` : '';
}

function getMessageActionSubject(reservation, templateId, fallbackTitle = 'Mensagem') {
  const template = getAvailableMessageTemplates().find((candidate) => candidate.id === templateId);
  const language = reservation?.preferredLanguage || ui.selectedMessageLanguage || 'pt';
  const label = template ? getMessageTemplateLabel(template, language) : fallbackTitle;
  const reservationLabel = reservation?.id ? ` - ${reservation.id}` : '';
  return `O Refúgio - ${label}${reservationLabel}`;
}

function renderMessageQuickActions(options = {}) {
  const {
    copyAction = 'copy-message',
    copyLabel = 'Copiar',
    email = '',
    phone = '',
    subject = 'O Refúgio'
  } = options;
  const cleanEmail = String(email || '').trim();
  const cleanPhone = String(phone || '').trim();
  const normalizedPhone = normalizePhoneForHref(cleanPhone);
  const buttons = [
    `<button class="button button-primary admin-small-button" type="button" data-action="${escapeHtml(copyAction)}">${icon('copy')} ${escapeHtml(copyLabel)}</button>`
  ];

  if (cleanEmail) {
    buttons.push(`<button class="button admin-secondary-button admin-small-button" type="button" data-action="copy-text" data-copy-text="${escapeHtml(cleanEmail)}">${icon('copy')} Copiar email</button>`);
    buttons.push(`<button class="button admin-secondary-button admin-small-button" type="button" data-action="send-message-email" data-email="${escapeHtml(cleanEmail)}" data-subject="${escapeHtml(subject)}">${icon('mail')} Abrir email</button>`);
  }

  if (normalizedPhone) {
    buttons.push(`<button class="button admin-secondary-button admin-small-button" type="button" data-action="send-message-whatsapp" data-phone="${escapeHtml(normalizedPhone)}">${icon('messageCircle')} WhatsApp</button>`);
  }

  return `<div class="admin-button-row admin-message-actions">${buttons.join('')}</div>`;
}

function renderContactDetailRows(contact = {}) {
  const email = String(contact.email || '').trim();
  const phone = String(contact.phone || '').trim();
  const name = String(contact.name || 'Contacto').trim();
  const normalizedPhone = normalizePhoneForHref(phone);
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    email ? `EMAIL:${email}` : '',
    normalizedPhone ? `TEL:${normalizedPhone}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\n');
  const cardLink = email || normalizedPhone
    ? `<a class="admin-icon-button admin-inline-icon-button" href="data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}" download="${escapeHtml(name.replace(/\s+/g, '-').toLowerCase())}.vcf" title="Guardar contacto" aria-label="Guardar contacto">${icon('userPlus')}</a>`
    : '';

  return `
    <div>
      <dt>Email</dt>
      <dd class="admin-contact-line">
        <span>${escapeHtml(email || '-')}</span>
        ${email ? `
          <a class="admin-icon-button admin-inline-icon-button" href="mailto:${encodeURIComponent(email)}" title="Enviar email" aria-label="Enviar email">${icon('mail')}</a>
          <button class="admin-icon-button admin-inline-icon-button" type="button" data-action="copy-text" data-copy-text="${escapeHtml(email)}" title="Copiar email" aria-label="Copiar email">${icon('copy')}</button>
        ` : ''}
      </dd>
    </div>
    <div>
      <dt>Telefone</dt>
      <dd class="admin-contact-line">
        <span>${escapeHtml(phone || '-')}</span>
        ${normalizedPhone ? `
          <a class="admin-icon-button admin-inline-icon-button" href="tel:${escapeHtml(normalizedPhone)}" title="Telefonar" aria-label="Telefonar">${icon('phone')}</a>
          <a class="admin-icon-button admin-inline-icon-button" href="https://wa.me/${escapeHtml(normalizedPhone.replace('+', ''))}" target="_blank" rel="noreferrer" title="Abrir WhatsApp" aria-label="Abrir WhatsApp">${icon('messageCircle')}</a>
          <button class="admin-icon-button admin-inline-icon-button" type="button" data-action="copy-text" data-copy-text="${escapeHtml(phone || normalizedPhone)}" title="Copiar telefone" aria-label="Copiar telefone">${icon('copy')}</button>
          ${cardLink}
        ` : cardLink}
      </dd>
    </div>
  `;
}

function getReservationGuest(reservation) {
  return state.guests.find((guest) => guest.id === reservation.guestId)
    || state.guests.find((guest) => reservation.contact?.email && guest.email?.toLowerCase() === reservation.contact.email.toLowerCase())
    || null;
}

function renderReservationExpandedDetails(reservation, totals) {
  const guest = getReservationGuest(reservation);
  const sourceReference = reservation.sourceReference || '-';
  const ownerNotes = reservation.notes?.owner || '-';
  const operationalNotes = reservation.notes?.operational || '-';

  return `
    <div><dt>Nacionalidade</dt><dd>${escapeHtml(guest?.nationality || '-')}</dd></div>
    <div><dt>Idades das crianças</dt><dd>${escapeHtml(getChildAgeText(reservation.guests))}</dd></div>
    <div><dt>Preferência de camas</dt><dd>${escapeHtml(getBedPreferenceText(reservation))}</dd></div>
    <div><dt>Bicicletas</dt><dd>${escapeHtml(getBikeText(reservation))}</dd></div>
    <div><dt>Referência externa</dt><dd>${escapeHtml(sourceReference)}</dd></div>
    <div><dt>Alojamento</dt><dd>${renderMoney(totals.accommodation)}</dd></div>
    <div><dt>Serviços</dt><dd>${renderMoney(totals.services)}</dd></div>
    <div><dt>Depósito</dt><dd>${renderMoney(totals.deposit)}</dd></div>
    <div><dt>Desconto</dt><dd>${renderMoney(totals.discount)}</dd></div>
    ${renderGuestAdjustmentsDetails(reservation)}
    <div><dt>Notas internas</dt><dd>${escapeHtml(ownerNotes)}</dd></div>
    <div><dt>Notas operacionais</dt><dd>${escapeHtml(operationalNotes)}</dd></div>
  `;
}

function getRequestStatusLabel(status) {
  return {
    new: 'Novo',
    accepted: 'Aceite',
    rejected: 'Rejeitado'
  }[status] || status;
}

function getDraftRequest() {
  return state.websiteRequests.find((request) => request.id === ui.requestDraftId) || null;
}

function renderCatalogText(template = '', values = {}) {
  return Object.entries(values)
    .reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), String(template || ''))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function createRequestMessageDraft(request, templateKey = 'requestResponse') {
  const language = request.preferredLanguage || 'pt';
  const replyTemplates = Array.isArray(messageCatalog?.requestReplies) ? messageCatalog.requestReplies : [];
  const replyTemplate = replyTemplates.find((template) => template.id === templateKey) || replyTemplates[0];
  const quote = request.comments
    ? `\n\n> ${request.comments.replace(/\n/g, '\n> ')}`
    : '';
  const values = {
    guestName: request.contact.name,
    requestId: request.id,
    stayRange: formatStayRange(request.stay),
    quote
  };
  const subjectTemplate = replyTemplate?.subject?.[language] || replyTemplate?.subject?.pt || replyTemplate?.subject?.en || 'Mensagem';
  const bodyTemplate = replyTemplate?.body?.[language] || replyTemplate?.body?.pt || replyTemplate?.body?.en || '';

  return {
    title: renderCatalogText(subjectTemplate, values),
    email: request.contact.email || '',
    phone: request.contact.phone || '',
    language: LANGUAGE_LABELS[language] || language || 'Português',
    text: renderCatalogText(bodyTemplate, values)
  };
}

function getAccessibleNavItems() {
  return NAV_ITEMS.filter((item) => can(currentUser, item.permission));
}

function ensureAccessibleView() {
  if (getAccessibleNavItems().some((item) => item.id === ui.activeView)) return;
  ui.activeView = getAccessibleNavItems()[0]?.id || 'dashboard';
}

function setNotice(message, type = 'success') {
  ui.notice = message;
  ui.noticeType = type;
}

function getLastLoginUsername(users) {
  const storedUsername = localStorage.getItem(LAST_LOGIN_USERNAME_KEY);
  if (storedUsername && users.some((user) => user.username === storedUsername)) {
    return storedUsername;
  }

  return users[0]?.username || '';
}

function rememberLoginUsername(username) {
  if (!username) return;
  localStorage.setItem(LAST_LOGIN_USERNAME_KEY, username);
}

function markFormDirty(form) {
  const formType = form?.dataset?.form || '';
  if (!UNSAVED_FORM_TYPES.has(formType)) return;
  ui.hasUnsavedChanges = true;
  form.classList.add('is-dirty');
}

function clearUnsavedChanges() {
  ui.hasUnsavedChanges = false;
  app.querySelectorAll('form.is-dirty').forEach((form) => form.classList.remove('is-dirty'));
}

function confirmDiscardUnsavedChanges() {
  if (!ui.hasUnsavedChanges) return true;
  const confirmed = window.confirm('Existem altera\u00e7\u00f5es por guardar. Sair sem guardar?');
  if (confirmed) clearUnsavedChanges();
  return confirmed;
}

function updateTypedDiscountField(form) {
  const input = form.querySelector('[data-discount-value-input], [data-reservation-discount-value-input]');
  if (!(input instanceof HTMLInputElement)) return;

  const type = form.querySelector('select[name="discountType"], select[name="type"]')?.value || 'percentage';
  input.placeholder = type === 'amount' ? 'Valor em euros' : 'Percentagem';
  if (type === 'percentage') {
    input.setAttribute('max', '100');
  } else {
    input.removeAttribute('max');
  }
}

async function loadMessageCatalog() {
  try {
    const response = await fetch(MESSAGE_CATALOG_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = await response.json();
    if (!Array.isArray(catalog?.templates)) throw new Error('Catálogo de mensagens inválido.');
    messageCatalog = catalog;
    ui.selectedMessageTemplate = resolveMessageTemplateId(ui.selectedMessageTemplate);
  } catch (error) {
    messageCatalog = { templates: [], requestReplies: [] };
    setNotice('Não foi possível carregar o catálogo de mensagens.', 'danger');
  }
}

async function persist(message) {
  clearUnsavedChanges();
  state = await repository.save(state);
  if (message) setNotice(message);
  renderApp();
}

function renderLogin(error = '') {
  const availableUsers = getAvailableUsers();
  const selectedUsername = getLastLoginUsername(availableUsers);
  const userOptions = availableUsers
    .map((user) => renderOption(user.username, `${user.displayName} · ${ROLE_LABELS[user.role]}`, selectedUsername))
    .join('');

  app.innerHTML = `
    <main class="admin-login-page">
      <section class="admin-login-panel">
        <a class="admin-public-link" href="./index.html">Voltar ao site</a>
        <p class="admin-eyebrow">Administração</p>
        <h1>Gestão de O Refúgio</h1>
        <p class="admin-login-intro">Entre para consultar reservas, pedidos, calendário, preços, despesas e trabalho de funcionários.</p>
        ${error ? `<p class="admin-alert admin-alert-danger">${escapeHtml(error)}</p>` : ''}
        <form class="admin-login-form" data-form="login">
          <label class="admin-field">
            <span>Utilizador</span>
            <select name="username" required>${userOptions}</select>
          </label>
          <label class="admin-field">
            <span>Palavra-passe</span>
            <input name="password" type="password" autocomplete="current-password" required />
          </label>
          <button class="button button-primary admin-login-button" type="submit">Entrar</button>
        </form>
        <div class="admin-prototype-note">
          <strong>Protótipo local</strong>
          <p>Esta página usa dados de demonstração no navegador. Dados reais devem ficar atrás de APIs autenticadas antes da publicação.</p>
        </div>
      </section>
    </main>
  `;
}

async function loadSessionAndState() {
  const session = getStoredSession();
  if (!session) {
    currentUser = null;
    state = null;
    renderLogin();
    return;
  }

  currentUser = session.user;
  state = await repository.load();
  await loadMessageCatalog();
  renderApp();
}

function renderApp() {
  ensureAccessibleView();
  const dashboardCreateReservationButton = ui.activeView === 'dashboard' && can(currentUser, 'reservations:write')
    ? `<button class="button button-primary admin-small-button" type="button" data-action="open-create-reservation">${icon('plus')} Criar reserva</button>`
    : '';
  const dashboardWorkButton = ui.activeView === 'dashboard' ? renderDashboardWorkButton() : '';
  const navItems = getAccessibleNavItems()
    .map((item) => `
      <button class="admin-nav-item${ui.activeView === item.id ? ' is-active' : ''}" type="button" data-action="set-view" data-view="${item.id}">
        ${icon(item.icon)}
        <span>${escapeHtml(item.label)}</span>
      </button>
    `)
    .join('');

  app.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <span class="admin-brand-mark">OR</span>
          <div>
            <strong>O Refúgio</strong>
            <span>Administração</span>
          </div>
        </div>
        <nav class="admin-nav" aria-label="Navegação de administração">
          ${navItems}
        </nav>
        <a class="admin-public-link" href="./index.html">Abrir site público</a>
      </aside>

      <main class="admin-main">
        <header class="admin-topbar">
          <div>
            <p class="admin-eyebrow">Área de gestão</p>
            <h1>${escapeHtml(NAV_ITEMS.find((item) => item.id === ui.activeView)?.label || 'Painel')}</h1>
          </div>
          <div class="admin-topbar-actions">
            ${dashboardCreateReservationButton}
            ${dashboardWorkButton}
            <div class="admin-user-box">
              <div>
                <strong>${escapeHtml(currentUser.displayName)}</strong>
                <span>${escapeHtml(currentUser.roleLabel)}</span>
              </div>
              <button class="admin-icon-button" type="button" data-action="logout" aria-label="Sair">${icon('logOut')}</button>
            </div>
          </div>
        </header>
        ${ui.notice ? `<p class="admin-alert admin-alert-${escapeHtml(ui.noticeType)}">${escapeHtml(ui.notice)}</p>` : ''}
        <section class="admin-view">
          ${renderActiveView()}
        </section>
      </main>
    </div>
  `;
}

function renderActiveView() {
  switch (ui.activeView) {
    case 'calendar':
      return renderCalendarView();
    case 'reservations':
      return renderReservationsView();
    case 'requests':
      return renderRequestsView();
    case 'pricing':
      return renderPricingView();
    case 'expenses':
      return renderExpensesView();
    case 'employees':
      return renderEmployeesView();
    case 'work':
      return renderWorkView();
    case 'messages':
      return renderMessagesView();
    case 'reports':
      return renderReportsView();
    case 'settings':
      return renderSettingsView();
    case 'dashboard':
    default:
      return renderDashboardView();
  }
}

function renderMetric(title, value, detail, tone = '', actionHtml = '') {
  return `
    <article class="admin-kpi ${tone}">
      <div class="admin-kpi-header">
        <span>${escapeHtml(title)}</span>
        ${actionHtml}
      </div>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}

function renderDashboardView() {
  if (currentUser?.role === 'employee') return renderEmployeeDashboardView();

  const summary = summarizeDashboard(state);
  const activeGuestText = summary.activeReservations.length
    ? summary.activeReservations.map((reservation) => reservation.contact.name).join(', ')
    : 'Sem hóspedes atuais';
  const activeWork = state.workSessions.find((session) => !session.end);
  const workerName = state.employees.find((employee) => employee.id === activeWork?.employeeId)?.name || 'Ninguém';
  const currentGuestsMetric = renderMetric(
    'Hóspedes atuais',
    String(summary.activeReservations.length),
    activeGuestText,
    'tone-green',
    renderDashboardMessageButton(summary.activeReservations[0], 'current')
  );
  const nextArrivalMetric = renderMetric(
    'Próxima chegada',
    summary.nextArrival ? summary.nextArrival.contact.name : '-',
    summary.nextArrival ? formatDate(summary.nextArrival.stay.checkIn) : 'Sem chegadas futuras',
    '',
    renderDashboardMessageButton(summary.nextArrival, 'arrival')
  );
  const nextDepartureMetric = renderMetric(
    'Próxima saída',
    summary.nextDeparture ? summary.nextDeparture.contact.name : '-',
    summary.nextDeparture ? formatDate(summary.nextDeparture.stay.checkOut) : 'Sem saídas futuras',
    '',
    renderDashboardMessageButton(summary.nextDeparture, 'departure')
  );
  const timelineMetrics = summary.activeReservations.length
    ? `${nextDepartureMetric}${nextArrivalMetric}`
    : `${nextArrivalMetric}${nextDepartureMetric}`;

  const attentionItems = [
    ...summary.openRequests.map((request) => ({
      title: `Pedido novo · ${request.contact.name}`,
      text: `${formatDate(request.stay.checkIn)} a ${formatDate(request.stay.checkOut)}`,
      view: 'requests'
    })),
    ...summary.awaitingPayment.map((reservation) => ({
      title: `Pagamento em falta · ${reservation.contact.name}`,
      text: `${reservation.id} · ${formatDate(reservation.stay.checkIn)}`,
      view: 'reservations'
    }))
  ];

  return `
    <div class="admin-kpi-grid">
      ${currentGuestsMetric}
      ${timelineMetrics}
      ${renderMetric('Receita prevista', renderMoney(summary.confirmedRevenue), 'Reservas ativas e históricas', 'tone-gold')}
    </div>

    <div class="admin-dashboard-grid">
      <section class="admin-panel attention-panel">
        <div class="admin-panel-heading">
          <div>
            <p class="admin-eyebrow">Atenção</p>
            <h2>O que precisa de ação</h2>
          </div>
        </div>
        ${attentionItems.length ? `
          <div class="admin-task-list">
            ${attentionItems.map((item) => `
              <button class="admin-task" type="button" data-action="set-view" data-view="${item.view}">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.text)}</span>
              </button>
            `).join('')}
          </div>
        ` : '<p class="admin-empty">Não há pedidos ou pagamentos urgentes neste momento.</p>'}
      </section>

      <section class="admin-panel">
        <div class="admin-panel-heading">
          <div>
            <p class="admin-eyebrow">Operação</p>
            <h2>Resumo rápido</h2>
          </div>
        </div>
        <dl class="admin-definition-list">
          <div><dt>Pedidos novos</dt><dd>${summary.openRequests.length}</dd></div>
          <div><dt>A aguardar pagamento</dt><dd>${summary.awaitingPayment.length}</dd></div>
          <div><dt>Funcionário com horário iniciado</dt><dd>${escapeHtml(workerName)}</dd></div>
          <div><dt>Despesas registadas</dt><dd>${renderMoney(summary.expenses)}</dd></div>
          <div><dt>Custo de trabalho estimado</dt><dd>${renderMoney(summary.employeeCosts)}</dd></div>
        </dl>
      </section>
    </div>
  `;
}

function renderEmployeeDashboardView() {
  const employee = getEmployeeForUser(state, currentUser);
  const summary = summarizeDashboard(state);
  const currentMonth = formatDateKey(new Date()).slice(0, 7);

  if (!employee) {
    return `
      <section class="admin-panel">
        <p class="admin-empty">Não existe ficha de funcionário ligada a este utilizador.</p>
      </section>
    `;
  }

  const activeSession = state.workSessions.find((session) => session.employeeId === employee.id && !session.end);
  const monthSessions = state.workSessions.filter((session) => session.employeeId === employee.id && session.date.startsWith(currentMonth));
  const monthHours = monthSessions.reduce((total, session) => total + getWorkDurationHours(session), 0);
  const monthEarnings = calculateEmployeeEarnings(state, employee.id);
  const nextArrival = summary.nextArrival;
  const nextDeparture = summary.nextDeparture;

  return `
    <div class="admin-kpi-grid">
      ${renderMetric('Horas este mês', `${monthHours.toFixed(1)} h`, `${monthSessions.length} sessão(ões)`, 'tone-green')}
      ${renderMetric('Valor este mês', renderMoney(monthEarnings), `${renderMoney(getHourlyRate(employee))}/h atual`, 'tone-gold')}
      ${renderMetric('Estado', activeSession ? 'A trabalhar' : 'Parado', activeSession ? `Desde ${formatDateTime(activeSession.start)}` : 'Sem horário iniciado')}
      ${renderMetric('Hóspedes atuais', String(summary.activeReservations.length), summary.activeReservations.length ? summary.activeReservations.map((reservation) => reservation.contact.name).join(', ') : 'Sem hóspedes atuais')}
    </div>

    <div class="admin-dashboard-grid">
      <section class="admin-panel">
        <div class="admin-panel-heading">
          <div>
            <p class="admin-eyebrow">Relógio de trabalho</p>
            <h2>${escapeHtml(employee.name)}</h2>
          </div>
        </div>
        ${activeSession ? `
          ${renderActiveWorkDetailsForm(employee, activeSession)}
        ` : `
          <form class="admin-form-grid" data-form="work-start">
            ${renderWorkTaskFields(employee)}
            <div class="admin-form-actions">
              <button class="button button-primary" type="submit">${icon('timer')} Iniciar trabalho</button>
              <button class="button admin-secondary-button" type="button" data-action="set-view" data-view="work">Ver histórico</button>
            </div>
          </form>
        `}
      </section>

      <section class="admin-panel">
        <div class="admin-panel-heading">
          <div>
            <p class="admin-eyebrow">Hoje e próximos dias</p>
            <h2>Operação rápida</h2>
          </div>
        </div>
        <dl class="admin-definition-list">
          <div><dt>Próxima chegada</dt><dd>${nextArrival ? `${escapeHtml(nextArrival.contact.name)} · ${formatDate(nextArrival.stay.checkIn)} · ${escapeHtml(nextArrival.stay.checkInTime || state.property.defaultCheckInTime)}` : 'Sem chegadas futuras'}</dd></div>
          <div><dt>Próxima saída</dt><dd>${nextDeparture ? `${escapeHtml(nextDeparture.contact.name)} · ${formatDate(nextDeparture.stay.checkOut)} · ${escapeHtml(nextDeparture.stay.checkOutTime || state.property.defaultCheckOutTime)}` : 'Sem saídas futuras'}</dd></div>
          <div><dt>Pedidos novos</dt><dd>${summary.openRequests.length}</dd></div>
          <div><dt>A aguardar pagamento</dt><dd>${summary.awaitingPayment.length}</dd></div>
        </dl>
        <div class="admin-button-row">
          <button class="button admin-secondary-button admin-small-button" type="button" data-action="set-view" data-view="reservations">Ver reservas</button>
          <button class="button admin-secondary-button admin-small-button" type="button" data-action="set-view" data-view="calendar">Ver calendário</button>
        </div>
      </section>
    </div>
  `;
}

function getCalendarDays(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function renderCalendarView() {
  const monthLabel = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(ui.calendarMonth);
  const todayKey = formatDateKey(new Date());
  const days = getCalendarDays(ui.calendarMonth);
  const selectedEntries = state.reservations.filter((reservation) => reservationTouchesDate(reservation, ui.selectedDate));
  const selectedRequests = state.websiteRequests.filter((request) =>
    request.status === 'new' && reservationTouchesDate({ stay: request.stay }, ui.selectedDate)
  );
  const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return `
    <section class="admin-panel">
      <div class="admin-panel-heading admin-calendar-heading">
        <div>
          <p class="admin-eyebrow">Calendário detalhado</p>
          <h2>${escapeHtml(monthLabel)}</h2>
        </div>
        <div class="admin-button-row">
          ${can(currentUser, 'reservations:write') ? `<button class="button admin-secondary-button admin-small-button" type="button" data-action="open-create-reservation">${icon('plus')} Criar reserva</button>` : ''}
          <button class="button admin-secondary-button admin-small-button" type="button" data-action="calendar-today">${icon('calendarDays')} Hoje</button>
          <button class="admin-icon-button" type="button" data-action="calendar-prev" aria-label="Mês anterior">${icon('arrowLeft')}</button>
          <button class="admin-icon-button" type="button" data-action="calendar-next" aria-label="Mês seguinte">${icon('arrowRight')}</button>
        </div>
      </div>
      <p class="admin-calendar-today-note">Hoje: ${formatCompactDate(todayKey)}</p>
      <div class="admin-calendar-legend">
        ${Object.entries(STATUS_LABELS).filter(([status]) => ['awaiting_payment', 'confirmed', 'checked_in', 'cancelled'].includes(status)).map(([status, label]) => `
          <span>${renderStatusBadge(status)} ${escapeHtml(label)}</span>
        `).join('')}
      </div>
      <div class="admin-calendar-grid">
        ${weekdays.map((day) => `<strong class="admin-calendar-weekday">${day}</strong>`).join('')}
        ${days.map((day) => {
          const dateKey = formatDateKey(day);
          const entries = state.reservations.filter((reservation) => reservationTouchesDate(reservation, dateKey));
          const requests = state.websiteRequests.filter((request) => request.status === 'new' && reservationTouchesDate({ stay: request.stay }, dateKey));
          const isOutsideMonth = day.getMonth() !== ui.calendarMonth.getMonth();
          return `
            <button class="admin-calendar-day${dateKey === ui.selectedDate ? ' is-selected' : ''}${dateKey === todayKey ? ' is-today' : ''}${isOutsideMonth ? ' is-muted' : ''}" type="button" data-action="select-date" data-date="${dateKey}">
              <span class="admin-calendar-number">${day.getDate()}</span>
              <span class="admin-calendar-items">
                ${entries.slice(0, 2).map((reservation) => `<i class="calendar-dot dot-${escapeHtml(reservation.status)}">${escapeHtml(reservation.contact.name)}</i>`).join('')}
                ${requests.length ? `<i class="calendar-dot dot-request">${requests.length} pedido(s)</i>` : ''}
              </span>
            </button>
          `;
        }).join('')}
      </div>
    </section>

    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Dia selecionado</p>
          <h2>${formatDate(ui.selectedDate)}</h2>
        </div>
      </div>
      ${selectedEntries.length || selectedRequests.length ? `
        <div class="admin-record-list">
          ${selectedEntries.map((reservation) => renderReservationSummary(reservation, { context: 'calendar' })).join('')}
          ${selectedRequests.map(renderRequestSummary).join('')}
        </div>
      ` : '<p class="admin-empty">Não há reservas nem pedidos neste dia.</p>'}
    </section>
  `;
}

function renderReservationSummary(reservation, options = {}) {
  const totals = calculateReservationTotals(reservation, state);
  const isExpanded = ui.expandedReservationIds.has(reservation.id);
  const recordClass = [
    'admin-record',
    reservation.status === 'cancelled' ? 'is-cancelled' : '',
    reservation.status === 'awaiting_payment' ? 'is-pending' : ''
  ].filter(Boolean).join(' ');

  return `
    <article class="${recordClass}">
      <div class="admin-record-main">
        <div>
          <strong>${escapeHtml(reservation.contact.name)}</strong>
          <span>${escapeHtml(reservation.id)} · ${formatStayRange(reservation.stay)} · ${formatStayTimes(reservation.stay)}</span>
        </div>
        <div class="admin-record-badges">
          ${renderStatusBadge(reservation.status)}
          ${renderSourceBadge(reservation.source)}
          ${renderLanguageBadge(reservation.preferredLanguage)}
        </div>
      </div>
      <dl class="admin-record-details">
        <div><dt>Hóspedes</dt><dd>${escapeHtml(formatGuestSummary(reservation.guests))}</dd></div>
        ${renderContactDetailRows(reservation.contact)}
        <div><dt>Total</dt><dd>${renderMoney(totals.total)}</dd></div>
        <div><dt>Pagamento</dt><dd>${escapeHtml(PAYMENT_LABELS[reservation.paymentStatus] || reservation.paymentStatus)}</dd></div>
        ${isExpanded ? renderReservationExpandedDetails(reservation, totals) : ''}
      </dl>
      ${renderReservationActions(reservation, options)}
    </article>
  `;
}

function renderRequestSummary(request) {
  const statusLabel = getRequestStatusLabel(request.status);

  return `
    <article class="admin-record${request.status === 'rejected' ? ' is-cancelled' : ''}${request.status === 'new' ? ' is-pending' : ''}">
      <div class="admin-record-main">
        <div>
          <strong>${escapeHtml(request.contact.name)}</strong>
          <span>${escapeHtml(request.id)} · ${formatStayRange(request.stay)} · ${formatStayTimes(request.stay)}</span>
        </div>
        <div class="admin-record-badges">
          ${renderStatusBadge('request')}
          <span class="admin-source">${escapeHtml(statusLabel)}</span>
          <span class="admin-source">${escapeHtml(LANGUAGE_LABELS[request.preferredLanguage] || request.preferredLanguage)}</span>
        </div>
      </div>
      <dl class="admin-record-details">
        <div><dt>Hóspedes</dt><dd>${escapeHtml(formatGuestSummary(request.guests))}</dd></div>
        <div><dt>Idades das crianças</dt><dd>${escapeHtml(getChildAgeText(request.guests))}</dd></div>
        <div><dt>Bicicletas</dt><dd>${escapeHtml(getBikeText(request))}</dd></div>
        <div><dt>Depósito</dt><dd>${escapeHtml(getDepositRequestText(request))}</dd></div>
        ${getRequestDiscountText(request) ? `<div><dt>Desconto</dt><dd>${escapeHtml(getRequestDiscountText(request))}</dd></div>` : ''}
        ${renderContactDetailRows(request.contact)}
        <div><dt>Total estimado</dt><dd>${renderMoney(request.estimatedTotal || 0)}</dd></div>
        <div><dt>Marketing</dt><dd>${request.marketingOptIn ? 'Sim' : 'Não'}</dd></div>
      </dl>
      <p>${escapeHtml(request.comments || 'Sem comentários adicionais.')}</p>
      ${can(currentUser, 'requests:manage') ? `
        <div class="admin-button-row">
          ${request.status === 'new' ? `
            <button class="button button-primary admin-small-button" type="button" data-action="accept-request" data-request-id="${request.id}">${icon('check')} Preparar reserva</button>
            <button class="button admin-secondary-button admin-small-button" type="button" data-action="message-for-request" data-request-id="${request.id}">${icon('mail')} Responder</button>
            <button class="button admin-danger-button admin-small-button" type="button" data-action="reject-request" data-request-id="${request.id}">${icon('trash')} Rejeitar</button>
          ` : ''}
          ${request.status === 'accepted' && request.acceptedReservationId ? `
            <button class="button admin-secondary-button admin-small-button" type="button" data-action="manage-reservation" data-reservation-id="${request.acceptedReservationId}">${icon('edit')} Abrir reserva</button>
          ` : ''}
          ${request.status === 'rejected' ? `
            <button class="button admin-secondary-button admin-small-button" type="button" data-action="restore-request" data-request-id="${request.id}">${icon('rotateCcw')} Restaurar pedido</button>
          ` : ''}
        </div>
      ` : ''}
    </article>
  `;
}

function renderRequestHistorySummary(request) {
  return `
    <article class="admin-record admin-record-compact${request.status === 'rejected' ? ' is-cancelled' : ''}">
      <div class="admin-record-main">
        <div>
          <strong>${escapeHtml(request.id)} · ${escapeHtml(request.contact.name)}</strong>
          <span>${escapeHtml(getRequestStatusLabel(request.status))} · ${formatStayRange(request.stay)} · ${escapeHtml(formatGuestSummary(request.guests))}</span>
        </div>
        <div class="admin-record-badges">
          <span class="admin-source">${escapeHtml(LANGUAGE_LABELS[request.preferredLanguage] || request.preferredLanguage)}</span>
        </div>
      </div>
      <p>${escapeHtml(request.comments || 'Sem comentários adicionais.')}</p>
      ${can(currentUser, 'requests:manage') ? `
        <div class="admin-button-row">
          ${request.status === 'accepted' && request.acceptedReservationId ? `
            <button class="button admin-secondary-button admin-small-button" type="button" data-action="manage-reservation" data-reservation-id="${request.acceptedReservationId}">${icon('edit')} Abrir reserva</button>
          ` : ''}
          ${request.status === 'rejected' ? `
            <button class="button admin-secondary-button admin-small-button" type="button" data-action="restore-request" data-request-id="${request.id}">${icon('rotateCcw')} Restaurar pedido</button>
          ` : ''}
        </div>
      ` : ''}
    </article>
  `;
}

function renderReservationActions(reservation, options = {}) {
  const canWriteReservations = can(currentUser, 'reservations:write');
  const canOperateReservations = can(currentUser, 'reservations:operations');
  if (!canWriteReservations && !canOperateReservations) return '';
  const isCalendar = options.context === 'calendar';
  const isExpanded = ui.expandedReservationIds.has(reservation.id);
  const editLabel = canWriteReservations ? 'Editar' : 'Operação';
  const manageButton = `<button class="button admin-secondary-button admin-small-button" type="button" data-action="manage-reservation" data-reservation-id="${reservation.id}">${icon('edit')} ${isCalendar ? 'Gerir reserva' : editLabel}</button>`;

  return `
    <div class="admin-button-row">
      <button class="button admin-secondary-button admin-small-button" type="button" data-action="toggle-reservation-details" data-reservation-id="${reservation.id}">
        ${isExpanded ? 'Ver menos' : 'Ver mais'}
      </button>
      ${isCalendar ? '' : manageButton}
      ${canWriteReservations && reservation.status === 'awaiting_payment' ? `
        <button class="button button-primary admin-small-button" type="button" data-action="mark-paid" data-reservation-id="${reservation.id}">${icon('check')} Pagamento recebido</button>
      ` : ''}
      <button class="button admin-secondary-button admin-small-button" type="button" data-action="message-for-reservation" data-reservation-id="${reservation.id}">${icon('mail')} Gerar mensagem</button>
      ${isCalendar ? manageButton : ''}
      ${canWriteReservations && reservation.status === 'cancelled' ? `
        <button class="button admin-secondary-button admin-small-button" type="button" data-action="restore-reservation" data-reservation-id="${reservation.id}">${icon('rotateCcw')} Restaurar</button>
      ` : ''}
      ${canWriteReservations && !isCalendar && !['cancelled', 'checked_out'].includes(reservation.status) ? `
        <button class="button admin-danger-button admin-small-button" type="button" data-action="cancel-reservation" data-reservation-id="${reservation.id}">${icon('trash')} Cancelar</button>
      ` : ''}
    </div>
  `;
}

function renderReservationsView() {
  const filteredReservations = getFilteredReservations();
  const statusFilterValue = ACTIVE_RESERVATION_FILTER_STATUSES.includes(ui.reservationFilters.status)
    ? ui.reservationFilters.status
    : 'all';

  return `
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Pesquisa</p>
          <h2>Reservas</h2>
        </div>
        ${can(currentUser, 'reservations:write') ? `
          <button class="button button-primary admin-small-button" type="button" data-action="open-create-reservation">${icon('plus')} Criar reserva</button>
        ` : ''}
      </div>
      <form class="admin-filter-bar" data-form="reservation-filters">
        <label class="admin-field">
          <span>Pesquisar</span>
          <input name="search" type="search" value="${escapeHtml(ui.reservationFilters.search)}" placeholder="Nome, email, telefone ou ID" />
        </label>
        <label class="admin-field">
          <span>Estado</span>
          <select name="status">
            ${renderOption('all', 'Todos ativos/futuros', statusFilterValue)}
            ${ACTIVE_RESERVATION_FILTER_STATUSES.map((value) => renderOption(value, STATUS_LABELS[value], statusFilterValue)).join('')}
          </select>
        </label>
        <label class="admin-field">
          <span>Origem</span>
          <select name="source">
            ${renderOption('all', 'Todas', ui.reservationFilters.source)}
            ${Object.entries(SOURCE_LABELS).map(([value, label]) => renderOption(value, label, ui.reservationFilters.source)).join('')}
          </select>
        </label>
        <button class="button admin-secondary-button" type="button" data-action="clear-reservation-filters">Limpar</button>
      </form>
      <div class="admin-record-list" data-reservation-list>
        ${filteredReservations.length ? filteredReservations.map(renderReservationSummary).join('') : '<p class="admin-empty">Nenhuma reserva corresponde aos filtros.</p>'}
      </div>
    </section>

    ${can(currentUser, 'reservations:write') ? renderCreateReservationForm() : can(currentUser, 'reservations:operations') ? renderReservationOperationsPanel() : `
      <section class="admin-panel">
        <p class="admin-empty">Pode consultar reservas e informação operacional, mas só um proprietário pode criar ou alterar dados financeiros.</p>
      </section>
    `}
    ${renderPastReservationsSection()}
  `;
}

function isPastReservation(reservation) {
  const todayKey = formatDateKey(new Date());
  return ['checked_out', 'cancelled', 'no_show'].includes(reservation.status) || reservation.stay?.checkOut < todayKey;
}

function getPastReservations() {
  return state.reservations
    .filter(isPastReservation)
    .sort((a, b) => String(b.stay?.checkOut || '').localeCompare(String(a.stay?.checkOut || '')));
}

function renderPastReservationsSection() {
  const pastReservations = getPastReservations();
  const toggleLabel = ui.showPastReservations
    ? 'Fechar reservas passadas'
    : `Abrir ${pastReservations.length} reserva(s) passada(s)`;

  return `
    <section class="admin-panel admin-past-reservations">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Histórico</p>
          <h2>Reservas passadas</h2>
        </div>
        <button class="admin-icon-button admin-history-toggle" type="button" data-action="toggle-past-reservations" title="${escapeHtml(toggleLabel)}" aria-label="${escapeHtml(toggleLabel)}">
          ${icon(ui.showPastReservations ? 'chevronUp' : 'chevronDown')}
        </button>
      </div>
      ${ui.showPastReservations ? `
        <div class="admin-record-list">
          ${pastReservations.length ? pastReservations.map(renderPastReservationSummary).join('') : '<p class="admin-empty">Ainda não há reservas passadas, canceladas ou no-show.</p>'}
        </div>
      ` : ''}
    </section>
  `;
}

function renderPastReservationSummary(reservation) {
  const totals = calculateReservationTotals(reservation, state);
  const isExpanded = ui.expandedReservationIds.has(reservation.id);
  const recordClass = [
    'admin-record',
    'admin-record-compact',
    'admin-past-reservation-row',
    reservation.status === 'cancelled' ? 'is-cancelled' : '',
    reservation.status === 'no_show' ? 'is-cancelled' : ''
  ].filter(Boolean).join(' ');

  return `
    <article class="${recordClass}">
      <div class="admin-record-main">
        <div>
          <strong>${escapeHtml(reservation.contact.name)}</strong>
          <span>${formatStayRange(reservation.stay)} · ${escapeHtml(STATUS_LABELS[reservation.status] || reservation.status)} · ${escapeHtml(reservation.id)}</span>
        </div>
        <div class="admin-record-badges">
          ${renderStatusBadge(reservation.status)}
          ${renderSourceBadge(reservation.source)}
          ${renderLanguageBadge(reservation.preferredLanguage)}
          <span class="admin-source">${renderMoney(totals.total)}</span>
          <button class="button admin-secondary-button admin-small-button" type="button" data-action="toggle-reservation-details" data-reservation-id="${reservation.id}">
            ${isExpanded ? 'Fechar detalhes' : 'Ver detalhes'}
          </button>
        </div>
      </div>
      ${isExpanded ? `
        <dl class="admin-record-details">
          <div><dt>Hóspedes</dt><dd>${escapeHtml(formatGuestSummary(reservation.guests))}</dd></div>
          ${renderContactDetailRows(reservation.contact)}
          <div><dt>Pagamento</dt><dd>${escapeHtml(PAYMENT_LABELS[reservation.paymentStatus] || reservation.paymentStatus)}</dd></div>
          <div><dt>Total</dt><dd>${renderMoney(totals.total)}</dd></div>
          ${renderReservationExpandedDetails(reservation, totals)}
        </dl>
        ${can(currentUser, 'reservations:write') && reservation.status === 'cancelled' ? `
          <div class="admin-button-row">
            <button class="button admin-secondary-button admin-small-button" type="button" data-action="restore-reservation" data-reservation-id="${reservation.id}">${icon('rotateCcw')} Restaurar</button>
          </div>
        ` : ''}
      ` : ''}
    </article>
  `;
}

function renderReservationOperationsPanel() {
  const reservation = state.reservations.find((candidate) => candidate.id === ui.editingReservationId);

  if (!reservation) {
    return `
      <section class="admin-panel" id="reservation-operations">
        <div class="admin-panel-heading">
          <div>
            <p class="admin-eyebrow">Operação</p>
            <h2>Atualizar uma reserva</h2>
          </div>
        </div>
        <p class="admin-empty">Escolha “Operação” numa reserva para ajustar horários, idioma ou estado do pagamento/depósito.</p>
      </section>
    `;
  }

  return `
    <section class="admin-panel" id="reservation-operations">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Operação</p>
          <h2>${escapeHtml(reservation.id)} · ${escapeHtml(reservation.contact.name)}</h2>
        </div>
      </div>
      <p class="admin-alert admin-alert-warning">
        Área limitada para funcionários. Preços, datas da estadia, hóspedes e dados financeiros completos continuam reservados aos proprietários.
      </p>
      <form class="admin-form-grid" data-form="reservation-operations">
        <input type="hidden" name="reservationId" value="${escapeHtml(reservation.id)}" />
        <label class="admin-field">
          <span>Hora de check-in</span>
          <input name="checkInTime" type="text" inputmode="numeric" autocomplete="off" value="${escapeHtml(reservation.stay?.checkInTime || state.property.defaultCheckInTime)}" placeholder="HH:MM" pattern="(?:[01]\\d|2[0-3]):[0-5]\\d" />
        </label>
        <label class="admin-field">
          <span>Hora de check-out</span>
          <input name="checkOutTime" type="text" inputmode="numeric" autocomplete="off" value="${escapeHtml(reservation.stay?.checkOutTime || state.property.defaultCheckOutTime)}" placeholder="HH:MM" pattern="(?:[01]\\d|2[0-3]):[0-5]\\d" />
        </label>
        <label class="admin-field">
          <span>Idioma preferido</span>
          <select name="preferredLanguage">
            ${Object.entries(LANGUAGE_LABELS).map(([value, label]) => renderOption(value, label, reservation.preferredLanguage || 'pt')).join('')}
          </select>
        </label>
        <label class="admin-field">
          <span>Pagamento / depósito</span>
          <select name="paymentStatus">
            ${['awaiting_transfer', 'deposit_paid', 'paid'].map((value) => renderOption(value, PAYMENT_LABELS[value], reservation.paymentStatus || 'awaiting_transfer')).join('')}
          </select>
        </label>
        <div class="admin-form-actions">
          <button class="button button-primary" type="submit">${icon('check')} Guardar operação</button>
          <button class="button admin-secondary-button" type="button" data-action="cancel-reservation-edit">Cancelar</button>
        </div>
      </form>
    </section>
  `;
}

function getFilteredReservations() {
  const search = ui.reservationFilters.search.trim().toLowerCase();
  const statusFilter = ACTIVE_RESERVATION_FILTER_STATUSES.includes(ui.reservationFilters.status)
    ? ui.reservationFilters.status
    : 'all';
  return state.reservations
    .filter((reservation) => !isPastReservation(reservation))
    .filter((reservation) => statusFilter === 'all' || reservation.status === statusFilter)
    .filter((reservation) => ui.reservationFilters.source === 'all' || reservation.source === ui.reservationFilters.source)
    .filter((reservation) => {
      if (!search) return true;
      return [
        reservation.id,
        reservation.contact.name,
        reservation.contact.email,
        reservation.contact.phone,
        reservation.sourceReference
      ].some((value) => String(value || '').toLowerCase().includes(search));
    })
    .sort((a, b) => a.stay.checkIn.localeCompare(b.stay.checkIn));
}

function renderCreateReservationForm() {
  const editingReservation = state.reservations.find((reservation) => reservation.id === ui.editingReservationId);
  const editingGuest = editingReservation ? getReservationGuest(editingReservation) : null;
  const draftRequest = editingReservation ? null : getDraftRequest();
  const today = formatDateKey(new Date());
  const tomorrow = formatDateKey(new Date(Date.now() + 86400000));
  const defaults = {
    websiteRequestId: draftRequest?.id || '',
    reservationId: editingReservation?.id || '',
    guestName: editingReservation?.contact?.name || draftRequest?.contact?.name || '',
    email: editingReservation?.contact?.email || draftRequest?.contact?.email || '',
    phone: editingReservation?.contact?.phone || draftRequest?.contact?.phone || '',
    nationality: editingGuest?.nationality || draftRequest?.contact?.nationality || draftRequest?.nationality || '',
    checkIn: editingReservation?.stay?.checkIn || draftRequest?.stay?.checkIn || today,
    checkOut: editingReservation?.stay?.checkOut || draftRequest?.stay?.checkOut || tomorrow,
    checkInTime: editingReservation?.stay?.checkInTime || draftRequest?.stay?.checkInTime || state.property.defaultCheckInTime,
    checkOutTime: editingReservation?.stay?.checkOutTime || draftRequest?.stay?.checkOutTime || state.property.defaultCheckOutTime,
    source: editingReservation?.source || (draftRequest ? 'website' : 'private'),
    sourceReference: editingReservation?.sourceReference || draftRequest?.id || '',
    adults: Number(editingReservation?.guests?.adults || draftRequest?.guests?.adults || 2),
    children: Number(editingReservation?.guests?.children || draftRequest?.guests?.children || 0),
    childAges: Array.isArray(editingReservation?.guests?.childAges)
      ? editingReservation.guests.childAges.join(', ')
      : Array.isArray(draftRequest?.guests?.childAges) ? draftRequest.guests.childAges.join(', ') : '',
    preferredLanguage: editingReservation?.preferredLanguage || draftRequest?.preferredLanguage || 'pt',
    status: editingReservation?.status || 'awaiting_payment',
    bedPreference: editingReservation?.preferences?.bed || editingReservation?.guests?.bedPreference || draftRequest?.preferences?.bed || draftRequest?.guests?.bedPreference || '',
    bikeCount: Number(editingReservation?.extras?.bikes?.count || draftRequest?.extras?.bikes?.count || 0),
    bikeDays: Number(editingReservation?.extras?.bikes?.days || draftRequest?.extras?.bikes?.days || 0),
    discountType: editingReservation?.pricing?.discountType || draftRequest?.pricing?.discountType || (Number(editingReservation?.pricing?.discountAmount || draftRequest?.pricing?.discountAmount || 0) > 0 ? 'amount' : 'percentage'),
    discountPercent: Number(editingReservation?.pricing?.discountPercent || draftRequest?.pricing?.discountPercent || 0),
    discountAmount: Number(editingReservation?.pricing?.discountAmount || draftRequest?.pricing?.discountAmount || 0),
    discountCode: editingReservation?.pricing?.discountCode || draftRequest?.pricing?.discountCode || '',
    depositIncluded: Boolean(editingReservation?.pricing?.depositIncluded || draftRequest?.depositPrepay || draftRequest?.pricing?.depositIncluded),
    ownerNotes: editingReservation?.notes?.owner || draftRequest?.comments || '',
    operationalNotes: editingReservation?.notes?.operational || '',
    marketingOptIn: Boolean(editingReservation?.marketingOptIn || draftRequest?.marketingOptIn)
  };

  return `
    <section class="admin-panel" id="create-reservation">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Nova reserva</p>
          <h2>${editingReservation ? `Editar ${escapeHtml(editingReservation.id)}` : 'Criar manualmente'}</h2>
        </div>
      </div>
      ${editingReservation ? `
        <p class="admin-alert admin-alert-success">
          Está a editar uma reserva existente. As alterações ficam registadas no histórico local do protótipo.
        </p>
      ` : ''}
      ${draftRequest ? `
        <p class="admin-alert admin-alert-success">
          Pedido ${escapeHtml(draftRequest.id)} carregado no formulário. O pedido só passa para o histórico depois de guardar esta reserva.
        </p>
      ` : ''}
      <form class="admin-form-grid" data-form="create-reservation">
        <input name="websiteRequestId" type="hidden" value="${escapeHtml(defaults.websiteRequestId)}" />
        <input name="reservationId" type="hidden" value="${escapeHtml(defaults.reservationId)}" />
        <input name="discountCode" type="hidden" value="${escapeHtml(defaults.discountCode)}" />
        <label class="admin-field">
          <span>Nome do hóspede *</span>
          <input name="guestName" type="text" value="${escapeHtml(defaults.guestName)}" required />
        </label>
        <label class="admin-field">
          <span>Email *</span>
          <input name="email" type="email" value="${escapeHtml(defaults.email)}" required />
        </label>
        <label class="admin-field">
          <span>Telefone</span>
          <input name="phone" type="tel" value="${escapeHtml(defaults.phone)}" />
        </label>
        <label class="admin-field">
          <span>Nacionalidade</span>
          <input name="nationality" type="text" value="${escapeHtml(defaults.nationality)}" placeholder="Ex.: Portugal, França, Alemanha" />
        </label>
        <label class="admin-field">
          <span>Check-in *</span>
          ${renderAdminDateControl({ name: 'checkIn', value: formatDateInputValue(defaults.checkIn), required: true })}
        </label>
        <label class="admin-field">
          <span>Check-out *</span>
          ${renderAdminDateControl({ name: 'checkOut', value: formatDateInputValue(defaults.checkOut), required: true })}
        </label>
        <label class="admin-field">
          <span>Referência externa</span>
          <input name="sourceReference" type="text" value="${escapeHtml(defaults.sourceReference)}" placeholder="Ex.: pedido website ou Booking.com" />
        </label>
        <label class="admin-field">
          <span>Hora de check-in</span>
          <input name="checkInTime" type="text" inputmode="numeric" autocomplete="off" value="${escapeHtml(defaults.checkInTime)}" placeholder="HH:MM" pattern="(?:[01]\\d|2[0-3]):[0-5]\\d" />
        </label>
        <label class="admin-field">
          <span>Hora de check-out</span>
          <input name="checkOutTime" type="text" inputmode="numeric" autocomplete="off" value="${escapeHtml(defaults.checkOutTime)}" placeholder="HH:MM" pattern="(?:[01]\\d|2[0-3]):[0-5]\\d" />
        </label>
        <label class="admin-field">
          <span>Origem</span>
          <select name="source">
            ${Object.entries(SOURCE_LABELS).map(([value, label]) => renderOption(value, label, defaults.source)).join('')}
          </select>
        </label>
        <label class="admin-field">
          <span>Adultos</span>
          <input name="adults" type="number" min="1" max="${state.property.occupancyLimit}" value="${defaults.adults}" required />
        </label>
        <label class="admin-field">
          <span>Crianças</span>
          <input name="children" type="number" min="0" max="${state.property.occupancyLimit - 1}" value="${defaults.children}" />
        </label>
        <label class="admin-field">
          <span>Idades das crianças</span>
          <input name="childAges" type="text" value="${escapeHtml(defaults.childAges)}" placeholder="Ex.: 4, 9" />
        </label>
        <label class="admin-field">
          <span>Idioma do hóspede</span>
          <select name="preferredLanguage">
            ${Object.entries(LANGUAGE_LABELS).map(([value, label]) => renderOption(value, label, defaults.preferredLanguage)).join('')}
          </select>
        </label>
        <label class="admin-field">
          <span>Estado</span>
          <select name="status">
            ${['awaiting_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'request'].map((value) => renderOption(value, STATUS_LABELS[value], defaults.status)).join('')}
          </select>
        </label>
        <label class="admin-field">
          <span>Preferência de camas</span>
          <select name="bedPreference">
            ${renderOption('', 'Sem preferência registada', defaults.bedPreference)}
            ${renderOption('double', 'Cama de casal', defaults.bedPreference)}
            ${renderOption('single', 'Camas individuais', defaults.bedPreference)}
          </select>
        </label>
        <label class="admin-field">
          <span>Bicicletas</span>
          <input name="bikeCount" type="number" min="0" max="6" value="${defaults.bikeCount}" />
        </label>
        <label class="admin-field">
          <span>Dias de bicicleta</span>
          <input name="bikeDays" type="number" min="0" value="${defaults.bikeDays}" />
        </label>
        <label class="admin-field">
          <span>Tipo de desconto</span>
          <select name="discountType">
            ${renderOption('percentage', 'Percentagem', defaults.discountType)}
            ${renderOption('amount', 'Valor fixo', defaults.discountType)}
          </select>
        </label>
        <label class="admin-field">
          <span>Desconto</span>
          <input name="discountValue" type="number" min="0" ${defaults.discountType === 'percentage' ? 'max="100"' : ''} step="1" value="${defaults.discountType === 'amount' ? defaults.discountAmount : defaults.discountPercent}" data-reservation-discount-value-input placeholder="${defaults.discountType === 'amount' ? 'Valor em euros' : 'Percentagem'}" />
        </label>
        <label class="admin-checkbox">
          <input name="depositIncluded" type="checkbox" ${defaults.depositIncluded ? 'checked' : ''} />
          <span>Incluir depósito de segurança no valor a transferir</span>
        </label>
        <label class="admin-checkbox">
          <input name="marketingOptIn" type="checkbox" ${defaults.marketingOptIn ? 'checked' : ''} />
          <span>Hóspede aceitou receber novidades, ofertas e descontos</span>
        </label>
        <label class="admin-field admin-field-full">
          <span>Notas internas</span>
          <textarea name="ownerNotes" rows="3">${escapeHtml(defaults.ownerNotes)}</textarea>
        </label>
        <label class="admin-field admin-field-full">
          <span>Notas operacionais</span>
          <textarea name="operationalNotes" rows="2">${escapeHtml(defaults.operationalNotes)}</textarea>
        </label>
        ${editingReservation ? `
          <div class="admin-field admin-field-full" id="extra-guests-editor">
            ${getGuestAdjustments(editingReservation).length ? renderGuestAdjustmentsList(editingReservation) : ''}
            <div class="admin-button-row">
              <button class="button admin-secondary-button admin-small-button" type="button" data-action="toggle-extra-guest-form">
                ${icon(ui.showExtraGuestForm ? 'chevronUp' : 'plus')} ${ui.showExtraGuestForm ? 'Fechar hóspedes extra' : 'Adicionar hóspede extra'}
              </button>
            </div>
          </div>
          ${ui.showExtraGuestForm ? `
            <label class="admin-field">
              <span>Chegada</span>
              ${renderAdminDateControl({ name: 'extraGuestFromDate', value: formatDateInputValue(editingReservation.status === 'checked_in' ? today : defaults.checkIn), placeholder: 'dd/mm/aaaa' })}
            </label>
            <label class="admin-field">
              <span>Adultos extra</span>
              <input name="extraGuestAdults" type="number" min="0" max="${state.property.occupancyLimit}" value="0" />
            </label>
            <label class="admin-field">
              <span>Crianças extra</span>
              <input name="extraGuestChildren" type="number" min="0" max="${state.property.occupancyLimit}" value="0" />
            </label>
            <label class="admin-field">
              <span>Idades das crianças extra</span>
              <input name="extraGuestChildAges" type="text" placeholder="Ex.: 5, 8" />
            </label>
            <label class="admin-field">
              <span>Tipo de desconto</span>
              <select name="extraGuestDiscountType">
                ${renderOption('amount', 'Valor fixo', 'amount')}
                ${renderOption('percentage', 'Percentagem', 'amount')}
              </select>
            </label>
            <label class="admin-field">
              <span>Desconto dos hóspedes extra</span>
              <input name="extraGuestDiscount" type="number" min="0" step="1" value="0" />
            </label>
            <label class="admin-field">
              <span>Estado do pagamento</span>
              <select name="extraGuestPaymentStatus">
                ${EXTRA_GUEST_PAYMENT_STATUSES.map((value) => renderOption(value, PAYMENT_LABELS[value], 'awaiting_transfer')).join('')}
              </select>
            </label>
          ` : ''}
        ` : ''}
        <label class="admin-field admin-field-full">
          <span>Colar email da Booking.com</span>
          <textarea name="bookingPaste" rows="4" placeholder="Cole aqui o email da Booking.com para consultar enquanto preenche a reserva. A extração automática fica para uma próxima versão."></textarea>
        </label>
        <div class="admin-form-actions">
          <button class="button button-primary" type="submit">${editingReservation ? `${icon('check')} Guardar alterações` : `${icon('plus')} Criar reserva`}</button>
          ${editingReservation ? `<button class="button admin-secondary-button" type="button" data-action="cancel-reservation-edit">Cancelar edição</button>` : ''}
        </div>
      </form>
    </section>
  `;
}

function renderRequestsView() {
  const openRequests = state.websiteRequests.filter((request) => request.status === 'new');
  const closedRequests = state.websiteRequests.filter((request) => request.status !== 'new');

  return `
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Pedidos do site</p>
          <h2>Por rever</h2>
        </div>
      </div>
      ${openRequests.length ? `
        <div class="admin-record-list">${openRequests.map(renderRequestSummary).join('')}</div>
      ` : '<p class="admin-empty">Não há pedidos novos do website.</p>'}
    </section>
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Histórico</p>
          <h2>Pedidos já tratados</h2>
        </div>
      </div>
      ${closedRequests.length ? `
        <div class="admin-record-list">${closedRequests.map(renderRequestHistorySummary).join('')}</div>
      ` : '<p class="admin-empty">Ainda não há histórico de pedidos tratados.</p>'}
    </section>
  `;
}

function renderPricingView() {
  requirePermission(currentUser, 'pricing:view');
  const seasons = state.pricing.seasons || [];
  const hasFullRecurringCoverage = recurringSeasonsCoverYear(seasons);
  const activeRule = getActivePricingRule();

  return `
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Preços por época</p>
          <h2>Alojamento</h2>
        </div>
      </div>
      <p class="admin-alert ${activeRule ? 'admin-alert-success' : 'admin-alert-warning'}">
        ${activeRule
          ? `Ativo hoje: ${escapeHtml(activeRule.title)} (${renderMoney(activeRule.adultNight)}/adulto/noite, mínimo cobrado ${state.pricing.minimumPaidAdults || 2} adultos; ${renderMoney(activeRule.childNight)}/criança/noite).`
          : `Ativo hoje: preço base (${renderMoney(state.pricing.adultNight)}/adulto/noite, mínimo cobrado ${state.pricing.minimumPaidAdults || 2} adultos; ${renderMoney(state.pricing.childNight)}/criança/noite).`}
        ${hasFullRecurringCoverage ? 'As épocas anuais cobrem o ano inteiro; o preço base fica apenas como segurança.' : 'O preço base é obrigatório porque as épocas anuais não cobrem o ano inteiro.'}
      </p>
      <form class="admin-form-grid" data-form="pricing">
        <label class="admin-field">
          <span>Preço base adulto/noite</span>
          <input name="adultNight" type="number" min="0" step="0.01" value="${state.pricing.adultNight}" ${can(currentUser, 'pricing:write') ? '' : 'disabled'} />
        </label>
        <label class="admin-field">
          <span>Mínimo cobrado de adultos</span>
          <input name="minimumPaidAdults" type="number" min="1" step="1" value="${state.pricing.minimumPaidAdults || 2}" ${can(currentUser, 'pricing:write') ? '' : 'disabled'} />
        </label>
        <label class="admin-field">
          <span>Preço base criança/noite</span>
          <input name="childNight" type="number" min="0" step="0.01" value="${state.pricing.childNight}" ${can(currentUser, 'pricing:write') ? '' : 'disabled'} />
        </label>
        ${can(currentUser, 'pricing:write') ? `
          <div class="admin-form-actions">
            <button class="button button-primary" type="submit">${icon('check')} Guardar preço base</button>
          </div>
        ` : ''}
      </form>
      ${renderSeasonList(seasons)}
      ${can(currentUser, 'pricing:write') ? renderSeasonForm() : ''}
    </section>

    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Descontos por grupo</p>
          <h2>Redução por noite</h2>
        </div>
      </div>
      ${renderGroupDiscountList()}
      ${can(currentUser, 'pricing:write') ? renderGroupDiscountForm() : ''}
    </section>

    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Serviços e extras</p>
          <h2>Valores separados</h2>
        </div>
      </div>
      <form class="admin-form-grid" data-form="service-pricing">
        <label class="admin-field">
          <span>Bicicleta/dia</span>
          <input name="bikeDay" type="number" min="0" step="1" value="${state.pricing.bikeDay}" ${can(currentUser, 'pricing:write') ? '' : 'disabled'} />
        </label>
        <label class="admin-field">
          <span>Depósito</span>
          <input name="securityDeposit" type="number" min="0" step="1" value="${state.pricing.securityDeposit}" ${can(currentUser, 'pricing:write') ? '' : 'disabled'} />
        </label>
        ${can(currentUser, 'pricing:write') ? `
          <div class="admin-form-actions">
            <button class="button button-primary" type="submit">${icon('check')} Guardar serviços</button>
          </div>
        ` : ''}
      </form>
    </section>

    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Promoções</p>
          <h2>Descontos e códigos</h2>
        </div>
      </div>
      ${renderDiscountList()}
      ${can(currentUser, 'pricing:write') ? renderDiscountForm() : ''}
    </section>
  `;
}

function renderSeasonList(seasons) {
  if (!seasons.length) return '<p class="admin-empty">Ainda não há preços sazonais configurados.</p>';

  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Nome</th><th>Tipo</th><th>Período</th><th>Adulto/noite</th><th>Criança/noite</th><th>Estado</th><th>Notas</th><th></th></tr></thead>
        <tbody>
          ${seasons.map((season) => `
            <tr>
              <td>${escapeHtml(season.title)}</td>
              <td>${(season.kind || 'dated') === 'recurring' ? 'Anual' : 'Data específica'}</td>
              <td>${escapeHtml(formatSeasonPeriod(season))}</td>
              <td>${renderMoney(season.adultNight)}</td>
              <td>${renderMoney(season.childNight)}</td>
              <td>${isSeasonActiveToday(season) ? '<span class="admin-status status-confirmed">Ativa hoje</span>' : '<span class="admin-source">Inativa hoje</span>'}</td>
              <td>${escapeHtml(season.notes || '-')}</td>
              <td>
                ${can(currentUser, 'pricing:write') ? `
                  <div class="admin-button-row">
                    <button class="button admin-secondary-button admin-small-button" type="button" data-action="edit-season" data-season-id="${season.id}">${icon('edit')} Editar</button>
                    <button class="button admin-danger-button admin-small-button" type="button" data-action="remove-season" data-season-id="${season.id}">${icon('trash')} Remover</button>
                  </div>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderSeasonForm() {
  const editingSeason = (state.pricing.seasons || []).find((season) => season.id === ui.editingSeasonId);
  const kind = editingSeason?.kind || 'recurring';
  const startValue = kind === 'dated'
    ? formatDateInputValue(editingSeason?.startDate || '')
    : formatMonthDay(editingSeason?.startMonthDay || '04-01');
  const endValue = kind === 'dated'
    ? formatDateInputValue(editingSeason?.endDate || '')
    : formatMonthDay(editingSeason?.endMonthDay || '09-30');

  return `
    <form class="admin-form-grid admin-subform" data-form="season">
      <input name="seasonId" type="hidden" value="${escapeHtml(editingSeason?.id || '')}" />
      <label class="admin-field">
        <span>Nome da época</span>
        <input name="title" type="text" value="${escapeHtml(editingSeason?.title || '')}" placeholder="Ex.: Verão, Natal, Páscoa" required />
      </label>
      <label class="admin-field">
        <span>Tipo</span>
        <select name="kind">
          ${renderOption('recurring', 'Época anual sem ano', kind)}
          ${renderOption('dated', 'Override com data completa', kind)}
        </select>
      </label>
      <label class="admin-field">
        <span>Início</span>
        ${renderAdminDateControl({ name: 'startDate', value: startValue, placeholder: 'dd/mm ou dd/mm/aaaa', pattern: getAdminFlexibleDateInputPattern(), required: true })}
      </label>
      <label class="admin-field">
        <span>Fim</span>
        ${renderAdminDateControl({ name: 'endDate', value: endValue, placeholder: 'dd/mm ou dd/mm/aaaa', pattern: getAdminFlexibleDateInputPattern(), required: true })}
      </label>
      <label class="admin-field">
        <span>Preço adulto/noite</span>
        <input name="adultNight" type="number" min="0" step="0.01" value="${Number(editingSeason?.adultNight ?? state.pricing.adultNight)}" required />
      </label>
      <p class="admin-form-note">A cobrança mínima de adultos vem do preço base: ${state.pricing.minimumPaidAdults || 2} adulto(s).</p>
      <label class="admin-field">
        <span>Criança/noite</span>
        <input name="childNight" type="number" min="0" step="0.01" value="${Number(editingSeason?.childNight ?? state.pricing.childNight)}" required />
      </label>
      <label class="admin-field">
        <span>Notas</span>
        <input name="notes" type="text" value="${escapeHtml(editingSeason?.notes || '')}" />
      </label>
      <div class="admin-form-actions">
        <button class="button admin-secondary-button" type="submit">${editingSeason ? `${icon('check')} Guardar época` : `${icon('plus')} Adicionar época`}</button>
        ${editingSeason ? '<button class="button admin-secondary-button" type="button" data-action="cancel-season-edit">Cancelar edição</button>' : ''}
      </div>
    </form>
  `;
}

function renderGroupDiscountList() {
  const discounts = state.pricing.groupDiscounts || [];
  if (!discounts.length) return '<p class="admin-empty">Ainda não há reduções por tamanho do grupo.</p>';

  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>A partir de</th><th>Redução/noite</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          ${discounts.map((discount) => `
            <tr>
              <td>${Number(discount.minGuests || 0)} hóspedes</td>
              <td>${renderMoney(discount.amountPerNight)}</td>
              <td>${discount.active === false ? 'Inativa' : 'Ativa'}</td>
              <td>
                ${can(currentUser, 'pricing:write') ? `
                  <button class="button admin-danger-button admin-small-button" type="button" data-action="remove-group-discount" data-group-discount-id="${discount.id}">${icon('trash')} Remover</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderGroupDiscountForm() {
  return `
    <form class="admin-form-grid admin-subform" data-form="group-discount">
      <label class="admin-field">
        <span>A partir de quantos hóspedes</span>
        <input name="minGuests" type="number" min="2" max="${state.property.occupancyLimit}" value="4" required />
      </label>
      <label class="admin-field">
        <span>Redução por noite</span>
        <input name="amountPerNight" type="number" min="0" step="1" value="5" required />
      </label>
      <label class="admin-checkbox">
        <input name="active" type="checkbox" checked />
        <span>Redução ativa</span>
      </label>
      <div class="admin-form-actions">
        <button class="button admin-secondary-button" type="submit">${icon('plus')} Adicionar redução</button>
      </div>
    </form>
  `;
}

function createDiscountCode() {
  return `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function getRecurringSeasonDays(season) {
  const start = monthDayOrdinal(season.startMonthDay);
  const end = monthDayOrdinal(season.endMonthDay);
  if (!start || !end) return new Set();

  const days = new Set();
  if (start <= end) {
    for (let day = start; day <= end; day += 1) days.add(day);
  } else {
    for (let day = start; day <= 366; day += 1) days.add(day);
    for (let day = 1; day <= end; day += 1) days.add(day);
  }
  return days;
}

function recurringSeasonsCoverYear(seasons = []) {
  const coveredDays = new Set();
  seasons
    .filter((season) => (season.kind || 'dated') === 'recurring')
    .forEach((season) => getRecurringSeasonDays(season).forEach((day) => coveredDays.add(day)));

  return coveredDays.size >= 366;
}

function recurringSeasonsOverlap(a, b) {
  const aDays = getRecurringSeasonDays(a);
  return [...getRecurringSeasonDays(b)].some((day) => aDays.has(day));
}

function formatSeasonPeriod(season) {
  if ((season.kind || 'dated') === 'recurring') {
    return `${formatMonthDay(season.startMonthDay)} - ${formatMonthDay(season.endMonthDay)} · todos os anos`;
  }

  return `${formatCompactDate(season.startDate)} - ${formatCompactDate(season.endDate)} · datas específicas`;
}

function isSeasonActiveToday(season, todayKey = formatDateKey(new Date())) {
  if (season.active === false) return false;

  if ((season.kind || 'dated') === 'recurring') {
    const today = parseDateKey(todayKey);
    const todayOrdinal = monthDayOrdinal(`${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    return getRecurringSeasonDays(season).has(todayOrdinal);
  }

  return season.startDate <= todayKey && season.endDate >= todayKey;
}

function getActivePricingRule() {
  const todayKey = formatDateKey(new Date());
  const datedOverride = (state.pricing.seasons || []).find((season) =>
    (season.kind || 'dated') === 'dated' && isSeasonActiveToday(season, todayKey)
  );
  const recurringSeason = (state.pricing.seasons || []).find((season) =>
    season.kind === 'recurring' && isSeasonActiveToday(season, todayKey)
  );

  return datedOverride || recurringSeason || null;
}

function getDiscountType(discount) {
  return discount.type || (Number(discount.amount || 0) > 0 ? 'amount' : 'percentage');
}

function renderDiscountValue(discount) {
  return getDiscountType(discount) === 'amount'
    ? renderMoney(discount.amount)
    : `${Number(discount.percentage || 0)}%`;
}

function renderDiscountUses(discount) {
  const maxUses = Number(discount.maxUses || 0);
  const usedCount = Number(discount.usedCount || 0);
  return maxUses ? `${usedCount}/${maxUses}` : 'Ilimitado';
}

function renderDiscountPeriod(discount) {
  const start = discount.startDate ? formatCompactDate(discount.startDate) : '';
  const end = discount.endDate ? formatCompactDate(discount.endDate) : '';
  if (start && end) return `${start} - ${end}`;
  if (start) return `Desde ${start}`;
  if (end) return `Até ${end}`;
  return 'Sem limite';
}

function formatMaxUsesInputValue(value) {
  const maxUses = Math.max(0, Number(value || 0));
  return maxUses ? String(maxUses) : 'Não';
}

function parseMaxUsesInputValue(value) {
  const normalizedValue = String(value || '').trim().toLowerCase();
  if (!normalizedValue || normalizedValue === 'não' || normalizedValue === 'nao' || normalizedValue === 'no') return 0;
  const numberValue = Number(normalizedValue.replace(',', '.'));
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error('O máximo de usos deve ser "Não" ou um número igual ou superior a 1.');
  }
  return Math.max(0, Math.floor(numberValue));
}

function normalizeMaxUsesInput(input) {
  input.value = formatMaxUsesInputValue(parseMaxUsesInputValue(input.value));
}

function renderDiscountList() {
  if (!state.pricing.discounts.length) return '<p class="admin-empty">Ainda não há descontos configurados.</p>';

  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Nome</th><th>Código</th><th>Período</th><th>Desconto</th><th>Usos</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          ${state.pricing.discounts.map((discount) => `
            <tr>
              <td>${escapeHtml(discount.title)}</td>
              <td><code>${escapeHtml(discount.code || '-')}</code></td>
              <td>${escapeHtml(renderDiscountPeriod(discount))}</td>
              <td>${renderDiscountValue(discount)}</td>
              <td>${renderDiscountUses(discount)}</td>
              <td>${discount.active ? 'Ativo' : 'Inativo'}</td>
              <td>
                ${can(currentUser, 'pricing:write') ? `
                  <div class="admin-button-row">
                    <button class="button admin-secondary-button admin-small-button" type="button" data-action="edit-discount" data-discount-id="${discount.id}">${icon('edit')} Editar</button>
                    <button class="button admin-danger-button admin-small-button" type="button" data-action="remove-discount" data-discount-id="${discount.id}">${icon('trash')} Remover</button>
                  </div>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderDiscountForm() {
  const editingDiscount = state.pricing.discounts.find((discount) => discount.id === ui.editingDiscountId);
  const discountType = editingDiscount ? getDiscountType(editingDiscount) : 'percentage';
  const discountValue = discountType === 'amount'
    ? Number(editingDiscount?.amount || 0)
    : Number(editingDiscount?.percentage || 10);

  return `
    <form class="admin-form-grid admin-subform" data-form="discount">
      <input name="discountId" type="hidden" value="${escapeHtml(editingDiscount?.id || '')}" />
      <label class="admin-field">
        <span>Nome</span>
        <input name="title" type="text" value="${escapeHtml(editingDiscount?.title || '')}" required />
      </label>
      <label class="admin-field">
        <span>Código</span>
        <span class="admin-input-action">
          <input name="code" type="text" value="${escapeHtml(editingDiscount?.code || '')}" placeholder="Ex.: REFUGIO10" />
          <button class="admin-icon-button admin-inline-icon-button" type="button" data-action="generate-discount-code" title="Gerar código aleatório" aria-label="Gerar código aleatório">${icon('dice')}</button>
        </span>
      </label>
      <label class="admin-field">
        <span>Início</span>
        ${renderAdminDateControl({ name: 'startDate', value: formatDateInputValue(editingDiscount?.startDate || ''), placeholder: 'Sem limite' })}
      </label>
      <label class="admin-field">
        <span>Fim</span>
        ${renderAdminDateControl({ name: 'endDate', value: formatDateInputValue(editingDiscount?.endDate || ''), placeholder: 'Sem limite' })}
      </label>
      <label class="admin-field">
        <span>Tipo</span>
        <select name="type">
          ${renderOption('percentage', 'Percentagem', discountType)}
          ${renderOption('amount', 'Valor fixo', discountType)}
        </select>
      </label>
      <label class="admin-field">
        <span>Valor do desconto</span>
        <input name="discountValue" type="number" min="0" ${discountType === 'percentage' ? 'max="100"' : ''} step="1" value="${discountValue}" data-discount-value-input placeholder="${discountType === 'amount' ? 'Valor em euros' : 'Percentagem'}" />
      </label>
      <label class="admin-field">
        <span>Máximo de usos</span>
        <input name="maxUses" type="text" inputmode="numeric" autocomplete="off" value="${escapeHtml(formatMaxUsesInputValue(editingDiscount?.maxUses || 0))}" data-max-uses-input />
      </label>
      <label class="admin-field">
        <span>Aplica-se a</span>
        <select name="appliesTo">
          ${renderOption('accommodation', 'Alojamento', editingDiscount?.appliesTo || 'accommodation')}
          ${renderOption('services', 'Serviços', editingDiscount?.appliesTo || 'accommodation')}
          ${renderOption('both', 'Alojamento e serviços', editingDiscount?.appliesTo || 'accommodation')}
        </select>
      </label>
      <label class="admin-checkbox">
        <input name="active" type="checkbox" ${editingDiscount?.active === false ? '' : 'checked'} />
        <span>Desconto ativo</span>
      </label>
      <div class="admin-form-actions">
        <button class="button button-primary" type="submit">${editingDiscount ? `${icon('check')} Guardar desconto` : `${icon('plus')} Adicionar desconto`}</button>
        ${editingDiscount ? `<button class="button admin-secondary-button" type="button" data-action="cancel-discount-edit">Cancelar edição</button>` : ''}
      </div>
    </form>
  `;
}

function renderExpensesView() {
  requirePermission(currentUser, 'expenses:view');
  const totalExpenses = state.expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
  const employeeCosts = state.workSessions.reduce((total, session) => total + getWorkSessionCost(session), 0);

  return `
    <div class="admin-kpi-grid">
      ${renderMetric('Despesas manuais', renderMoney(totalExpenses), `${state.expenses.length} registo(s)`)}
      ${renderMetric('Custos de funcionários', renderMoney(employeeCosts), 'Calculado pelas horas registadas', 'tone-gold')}
    </div>
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Despesas</p>
          <h2>Registos manuais</h2>
        </div>
      </div>
      ${renderExpenseTable()}
      ${can(currentUser, 'expenses:write') ? renderExpenseForm() : ''}
    </section>
  `;
}

function renderExpenseTable() {
  if (!state.expenses.length) return '<p class="admin-empty">Ainda não há despesas registadas.</p>';

  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Data</th><th>Categoria</th><th>Descrição</th><th>Notas</th><th>Valor</th><th></th></tr></thead>
        <tbody>
          ${state.expenses.map((expense) => `
            <tr>
              <td>${formatDate(expense.date)}</td>
              <td>${escapeHtml(EXPENSE_LABELS[expense.category] || expense.category)}</td>
              <td>${escapeHtml(expense.description)}</td>
              <td>${escapeHtml(expense.notes || '-')}</td>
              <td>${renderMoney(expense.amount)}</td>
              <td>
                ${can(currentUser, 'expenses:write') ? `
                  <div class="admin-button-row">
                    <button class="button admin-secondary-button admin-small-button" type="button" data-action="edit-expense" data-expense-id="${expense.id}">${icon('edit')} Editar</button>
                    <button class="button admin-danger-button admin-small-button" type="button" data-action="remove-expense" data-expense-id="${expense.id}">${icon('trash')} Remover</button>
                  </div>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderExpenseForm() {
  const editingExpense = state.expenses.find((expense) => expense.id === ui.editingExpenseId);

  return `
    <form class="admin-form-grid admin-subform" data-form="expense">
      <input name="expenseId" type="hidden" value="${escapeHtml(editingExpense?.id || '')}" />
      <label class="admin-field">
        <span>Data</span>
        ${renderAdminDateControl({ name: 'date', value: formatDateInputValue(editingExpense?.date || formatDateKey(new Date())), required: true })}
      </label>
      <label class="admin-field">
        <span>Categoria</span>
        <select name="category">${Object.entries(EXPENSE_LABELS).map(([value, label]) => renderOption(value, label, editingExpense?.category || 'outros')).join('')}</select>
      </label>
      <label class="admin-field">
        <span>Valor</span>
        <input name="amount" type="number" min="0" step="0.01" value="${Number(editingExpense?.amount || 0)}" required />
      </label>
      <label class="admin-field admin-field-full">
        <span>Descrição</span>
        <input name="description" type="text" value="${escapeHtml(editingExpense?.description || '')}" required />
      </label>
      <label class="admin-field admin-field-full">
        <span>Notas</span>
        <textarea name="notes" rows="3">${escapeHtml(editingExpense?.notes || '')}</textarea>
      </label>
      <div class="admin-form-actions">
        <button class="button admin-secondary-button" type="submit">${editingExpense ? `${icon('check')} Guardar despesa` : `${icon('plus')} Adicionar despesa`}</button>
        ${editingExpense ? '<button class="button admin-secondary-button" type="button" data-action="cancel-expense-edit">Cancelar edição</button>' : ''}
      </div>
    </form>
  `;
}

function renderEmployeesView() {
  requirePermission(currentUser, 'employees:view');

  return `
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Funcionários</p>
          <h2>Acessos, taxas e custos</h2>
        </div>
      </div>
      <div class="admin-record-list">
        ${state.employees.map((employee) => {
          const monthEarnings = calculateEmployeeEarnings(state, employee.id);
          const monthSessions = state.workSessions.filter((session) => session.employeeId === employee.id && session.date.startsWith(formatDateKey(new Date()).slice(0, 7)));
          const monthHours = monthSessions.reduce((total, session) => total + getWorkDurationHours(session), 0);
          const activeSession = state.workSessions.find((session) => session.employeeId === employee.id && !session.end);
          const sessionCount = state.workSessions.filter((session) => session.employeeId === employee.id).length;
          const isExpanded = ui.expandedEmployeeIds.has(employee.id);
          return `
            <article class="admin-record">
              <div class="admin-record-main">
                <div>
                  <strong>${escapeHtml(employee.name)}</strong>
                  <span>${employee.active ? 'Ativo' : 'Inativo'} · ${escapeHtml(ROLE_LABELS[employee.role] || employee.role)} · ${escapeHtml(ROLE_LABELS[employee.permissionsProfile] || employee.permissionsProfile)}</span>
                </div>
                <div class="admin-record-badges">
                  <span class="admin-source">${renderMoney(getHourlyRate(employee))}/h</span>
                  ${activeSession ? '<span class="admin-status status-checked_in">Horário iniciado</span>' : ''}
                  <button class="button admin-secondary-button admin-small-button" type="button" data-action="toggle-employee-details" data-employee-id="${employee.id}">
                    ${isExpanded ? 'Fechar detalhes' : 'Ver detalhes'}
                  </button>
                </div>
              </div>
              <dl class="admin-record-details">
                <div><dt>Horas este mês</dt><dd>${monthHours.toFixed(1)} h</dd></div>
                <div><dt>Ganhos este mês</dt><dd>${renderMoney(monthEarnings)}</dd></div>
                <div><dt>Modo habitual</dt><dd>${escapeHtml(COMPENSATION_LABELS[getEmployeeDefaultCompensation(employee)])}</dd></div>
                <div><dt>Sessões registadas</dt><dd>${sessionCount}</dd></div>
              </dl>
              ${isExpanded ? `
                <div class="admin-employee-details">
                  ${can(currentUser, 'employees:manage') ? `
                    <div class="admin-employee-control-grid">
                      ${renderEmployeeProfileForm(employee)}
                      <form class="admin-inline-form" data-form="employee-rate">
                        <input type="hidden" name="employeeId" value="${employee.id}" />
                        <label class="admin-field">
                          <span>Nova taxa/hora</span>
                          <input name="rate" type="number" min="0" step="0.01" value="${getHourlyRate(employee)}" />
                        </label>
                        <label class="admin-field">
                          <span>Desde</span>
                          ${renderAdminDateControl({ name: 'from', value: formatDateInputValue(formatDateKey(new Date())) })}
                        </label>
                        <button class="button admin-secondary-button admin-small-button" type="submit">${icon('check')} Guardar taxa</button>
                      </form>
                    </div>
                  ` : ''}
                  <div class="admin-section-heading">
                    <div>
                      <p class="admin-eyebrow">Tarefas e custos</p>
                      <h3>Histórico de trabalho</h3>
                    </div>
                  </div>
                  ${renderEmployeeSessionSummary(employee)}
                  ${can(currentUser, 'employees:manage') ? renderEmployeeWorkCorrectionForm(employee) : ''}
                </div>
              ` : ''}
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderEmployeeProfileForm(employee) {
  return `
    <form class="admin-inline-form" data-form="employee-profile">
      <input type="hidden" name="employeeId" value="${employee.id}" />
      <label class="admin-field">
        <span>Modo habitual</span>
        <select name="compensationDefault">
          ${renderCompensationOptions(getEmployeeDefaultCompensation(employee))}
        </select>
      </label>
      <button class="button admin-secondary-button admin-small-button" type="submit">${icon('check')} Guardar modo</button>
    </form>
  `;
}

function renderEmployeeSessionSummary(employee) {
  const sessions = state.workSessions
    .filter((session) => session.employeeId === employee.id)
    .sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')));

  if (!sessions.length) return '<p class="admin-empty">Sem sessões registadas.</p>';
  return renderWorkTable(sessions, { editable: can(currentUser, 'employees:manage') });
}

function renderEmployeeWorkCorrectionForm(employee) {
  const editingSession = state.workSessions.find((session) => session.id === ui.editingWorkSessionId && session.employeeId === employee.id);
  const title = editingSession ? 'Editar sessão de trabalho' : 'Adicionar sessão de trabalho';
  const buttonLabel = editingSession ? `${icon('check')} Guardar sessão` : `${icon('plus')} Adicionar horas`;

  return `
    <form class="admin-form-grid admin-subform" data-form="employee-work" data-work-form-for="${employee.id}">
      <input type="hidden" name="employeeId" value="${employee.id}" />
      <input type="hidden" name="workSessionId" value="${escapeHtml(editingSession?.id || '')}" />
      <div class="admin-form-intro admin-field-full">
        <p class="admin-eyebrow">${escapeHtml(title)}</p>
      </div>
      <label class="admin-field">
        <span>Data</span>
        ${renderAdminDateControl({ name: 'date', value: formatDateInputValue(editingSession?.date || formatDateKey(new Date())), required: true })}
      </label>
      <label class="admin-field">
        <span>Início</span>
        <input name="start" type="time" value="${escapeHtml(formatTimeInputValue(editingSession?.start))}" required />
      </label>
      <label class="admin-field">
        <span>Fim</span>
        <input name="end" type="time" value="${escapeHtml(formatTimeInputValue(editingSession?.end))}" required />
      </label>
      ${renderWorkTaskFields(employee, editingSession)}
      <label class="admin-field admin-field-full">
        <span>Notas</span>
        <input name="notes" type="text" value="${escapeHtml(editingSession?.notes || '')}" />
      </label>
      <div class="admin-form-actions">
        <button class="button admin-secondary-button admin-small-button" type="submit">${buttonLabel}</button>
        ${editingSession ? '<button class="button admin-secondary-button admin-small-button" type="button" data-action="cancel-work-session-edit">Cancelar edição</button>' : ''}
      </div>
    </form>
  `;
}

function getEmployeeDefaultCompensation(employee) {
  return employee.compensationDefault || (employee.role === 'employee' ? 'paid' : 'free');
}

function renderCompensationOptions(selectedValue) {
  return Object.entries(COMPENSATION_LABELS)
    .map(([value, label]) => renderOption(value, label, selectedValue))
    .join('');
}

function renderWorkTaskFields(employee, selectedSession = null) {
  const defaultCompensation = selectedSession?.compensationType || getEmployeeDefaultCompensation(employee);
  const selectedTasks = new Set(selectedSession?.tasks || []);

  return `
    <label class="admin-field">
      <span>Tipo de trabalho</span>
      <select name="compensationType">
        ${renderCompensationOptions(defaultCompensation)}
      </select>
    </label>
    <fieldset class="admin-work-task-set">
      <legend>O que foi feito?</legend>
      <div class="admin-work-task-grid">
        ${Object.entries(WORK_TASK_LABELS).map(([value, label]) => `
          <label class="admin-work-task-option">
            <input name="tasks" type="checkbox" value="${escapeHtml(value)}" ${selectedTasks.has(value) ? 'checked' : ''} />
            <span>${escapeHtml(label)}</span>
          </label>
        `).join('')}
      </div>
    </fieldset>
    <label class="admin-field admin-field-full">
      <span>Detalhes de "Outro" ou notas rápidas</span>
      <input name="otherDetails" type="text" value="${escapeHtml(selectedSession?.otherDetails || '')}" placeholder="Ex.: telefonemas, ajuda no exterior, compras específicas..." />
    </label>
  `;
}

function getWorkFormDetails(data, employee) {
  const tasks = data.getAll('tasks').map(String);
  const otherDetails = String(data.get('otherDetails') || '').trim();

  if (otherDetails && !tasks.includes('other')) {
    tasks.push('other');
  }

  const compensationType = String(data.get('compensationType') || getEmployeeDefaultCompensation(employee));
  const dateInput = String(data.get('date') || '').trim();
  const rateDate = dateInput ? parseAdminDateInput(dateInput, 'Data do trabalho') : formatDateKey(new Date());

  return {
    compensationType,
    tasks,
    otherDetails,
    rateSnapshot: compensationType === 'paid' ? getHourlyRate(employee, rateDate) : 0
  };
}

function renderSessionTasks(session) {
  const labels = (session.tasks || []).map((task) => WORK_TASK_LABELS[task] || task);
  if (session.otherDetails) labels.push(session.otherDetails);
  return labels.length ? labels.join(', ') : '-';
}

function renderActiveWorkDetailsForm(employee, session) {
  return `
    <form class="admin-form-grid admin-active-work" data-form="work-active-details" id="active-work-editor">
      <input type="hidden" name="workSessionId" value="${escapeHtml(session.id)}" />
      <input type="hidden" name="date" value="${escapeHtml(session.date)}" />
      <div class="admin-form-intro admin-field-full">
        <p><strong>Desde:</strong> ${escapeHtml(formatDateTime(session.start))}</p>
      </div>
      ${renderWorkTaskFields(employee, session)}
      <div class="admin-form-actions">
        <button class="button admin-secondary-button" type="submit">${icon('check')} Guardar tipo e tarefas</button>
        <button class="button button-primary" type="button" data-action="stop-work">${icon('timer')} Terminar trabalho</button>
      </div>
    </form>
  `;
}

function renderWorkView() {
  const employee = getEmployeeForUser(state, currentUser);
  if (!employee) {
    return '<section class="admin-panel"><p class="admin-empty">Não existe ficha de funcionário ligada a este utilizador.</p></section>';
  }

  const activeSession = state.workSessions.find((session) => session.employeeId === employee.id && !session.end);
  const editingOwnSession = state.workSessions.find((session) => session.id === ui.editingWorkSessionId && session.employeeId === employee.id && session.end);
  const monthEarnings = calculateEmployeeEarnings(state, employee.id);
  const monthSessions = state.workSessions
    .filter((session) => session.employeeId === employee.id && session.date.startsWith(formatDateKey(new Date()).slice(0, 7)))
    .sort((a, b) => b.date.localeCompare(a.date));
  const monthHours = monthSessions.reduce((total, session) => total + getWorkDurationHours(session), 0);
  const manualToggleLabel = ui.showManualWorkForm
    ? (activeSession ? 'Fechar horas manuais' : 'Usar relógio de trabalho')
    : 'Adicionar horas manualmente';
  const manualToggleIcon = ui.showManualWorkForm
    ? (activeSession ? 'chevronUp' : 'timer')
    : 'plus';

  return `
    <div class="admin-kpi-grid">
      ${renderMetric('Horas este mês', `${monthHours.toFixed(1)} h`, `${monthSessions.length} sessão(ões)`)}
      ${renderMetric('Ganhos este mês', renderMoney(monthEarnings), `${renderMoney(getHourlyRate(employee))}/h atual`, 'tone-green')}
      ${renderMetric('Estado', activeSession ? 'A trabalhar' : 'Parado', activeSession ? `Desde ${formatDateTime(activeSession.start)}` : 'Sem horário iniciado')}
    </div>
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Relógio de trabalho</p>
          <h2>${escapeHtml(employee.name)}</h2>
        </div>
      </div>
      ${activeSession ? `
        ${renderActiveWorkDetailsForm(employee, activeSession)}
      ` : ui.showManualWorkForm ? '' : `
        <form class="admin-form-grid" data-form="work-start">
          ${renderWorkTaskFields(employee)}
          <div class="admin-form-actions">
            <button class="button button-primary" type="submit">${icon('timer')} Iniciar trabalho</button>
          </div>
        </form>
      `}
      ${editingOwnSession ? '' : `
        <div class="admin-work-manual-row">
          <button class="button admin-secondary-button admin-small-button" type="button" data-action="toggle-manual-work-form">
            ${icon(manualToggleIcon)} ${manualToggleLabel}
          </button>
        </div>
      `}
      ${ui.showManualWorkForm ? `
        <form class="admin-form-grid admin-subform" data-form="work-manual" id="own-work-editor">
          <input type="hidden" name="workSessionId" value="${escapeHtml(editingOwnSession?.id || '')}" />
          <label class="admin-field">
            <span>Data</span>
            ${renderAdminDateControl({ name: 'date', value: formatDateInputValue(editingOwnSession?.date || formatDateKey(new Date())), required: true })}
          </label>
          <label class="admin-field">
            <span>Início</span>
            <input name="start" type="time" value="${escapeHtml(formatTimeInputValue(editingOwnSession?.start))}" required />
          </label>
          <label class="admin-field">
            <span>Fim</span>
            <input name="end" type="time" value="${escapeHtml(formatTimeInputValue(editingOwnSession?.end))}" required />
          </label>
          ${renderWorkTaskFields(employee, editingOwnSession)}
          <label class="admin-field admin-field-full">
            <span>Notas</span>
            <input name="notes" type="text" value="${escapeHtml(editingOwnSession?.notes || '')}" />
          </label>
          <div class="admin-form-actions">
            <button class="button admin-secondary-button" type="submit">${editingOwnSession ? `${icon('check')} Guardar alterações` : `${icon('plus')} Guardar horas`}</button>
            ${editingOwnSession ? '<button class="button admin-secondary-button" type="button" data-action="cancel-own-work-session-edit">Cancelar edição</button>' : ''}
          </div>
        </form>
      ` : ''}
    </section>
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Histórico</p>
          <h2>Sessões recentes</h2>
        </div>
      </div>
      ${renderWorkTable(monthSessions, { editable: true, own: true })}
    </section>
  `;
}

function renderWorkTable(sessions, options = {}) {
  if (!sessions.length) return '<p class="admin-empty">Ainda não há horas registadas este mês.</p>';
  const showActions = Boolean(options.editable || options.own);

  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Data</th><th>Início</th><th>Fim</th><th>Duração</th><th>Tipo</th><th>Tarefas</th><th>Valor</th>${showActions ? '<th>Ações</th>' : ''}</tr></thead>
        <tbody>
          ${sessions.map((session) => `
            <tr>
              <td>${formatDate(session.date)}</td>
              <td>${formatDateTime(session.start)}</td>
              <td>${session.end ? formatDateTime(session.end) : 'Em curso'}</td>
              <td>${getWorkDurationHours(session).toFixed(1)} h</td>
              <td>${escapeHtml(COMPENSATION_LABELS[session.compensationType || 'paid'] || session.compensationType)}</td>
              <td>${escapeHtml(renderSessionTasks(session))}</td>
              <td>${renderMoney(getWorkSessionCost(session))}</td>
              ${showActions ? `
                <td>
                  <div class="admin-button-row">
                    ${options.own ? `
                      <button class="button admin-secondary-button admin-small-button" type="button" data-action="edit-own-work-session" data-work-session-id="${session.id}">${icon('edit')} ${session.end ? 'Editar' : 'Atualizar'}</button>
                      ${session.end ? `<button class="button admin-danger-button admin-small-button" type="button" data-action="remove-own-work-session" data-work-session-id="${session.id}">${icon('trash')} Remover</button>` : ''}
                    ` : `
                      <button class="button admin-secondary-button admin-small-button" type="button" data-action="edit-work-session" data-work-session-id="${session.id}">${icon('edit')} Editar</button>
                    `}
                  </div>
                </td>
              ` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderMessagesView() {
  const templates = getAvailableMessageTemplates();
  const selectedTemplateId = getSelectedMessageTemplateId();
  if (selectedTemplateId && ui.selectedMessageTemplate !== selectedTemplateId) {
    ui.selectedMessageTemplate = selectedTemplateId;
  }

  const reservations = state.reservations
    .filter((reservation) => reservation.status !== 'cancelled')
    .sort((a, b) => a.stay.checkIn.localeCompare(b.stay.checkIn));
  const selectedReservationId = ui.messageDraft
    ? ui.selectedMessageReservationId
    : ui.selectedMessageReservationId || reservations[0]?.id || 'standalone';
  const isStandaloneMessage = selectedReservationId === 'standalone';
  const selectedReservation = isStandaloneMessage
    ? null
    : state.reservations.find((reservation) => reservation.id === selectedReservationId);
  const message = selectedTemplateId
    ? selectedReservation
      ? generateGuestMessage(selectedReservation, state, selectedTemplateId, messageCatalog)
      : generateStandaloneMessage(state, ui.selectedMessageLanguage, selectedTemplateId, messageCatalog)
    : '';
  const draft = ui.messageDraft;

  return `
    ${draft ? `
      <section class="admin-panel">
        <div class="admin-panel-heading">
          <div>
            <p class="admin-eyebrow">Rascunho de pedido</p>
            <h2>${escapeHtml(draft.title)}</h2>
          </div>
        </div>
        <div class="admin-message-meta">
          <span>${escapeHtml(draft.language)}</span>
          <span>${escapeHtml(draft.email || 'Sem email')}</span>
        </div>
        <textarea class="admin-message-output">${escapeHtml(draft.text)}</textarea>
        ${renderMessageQuickActions({
          copyAction: 'copy-draft-message',
          copyLabel: 'Copiar rascunho',
          email: draft.email,
          phone: draft.phone,
          subject: `O Refúgio - ${draft.title}`,
          message: draft.text
        })}
      </section>
    ` : ''}
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Comunicação com hóspedes</p>
          <h2>Mensagem pronta a copiar</h2>
        </div>
      </div>
      <form class="admin-form-grid" data-form="message">
        <label class="admin-field">
          <span>Reserva</span>
          <select name="reservationId">
            ${renderOption('standalone', 'Sem reserva específica', selectedReservationId)}
            ${reservations.map((reservation) => renderOption(reservation.id, `${reservation.id} · ${reservation.contact.name}`, selectedReservationId)).join('')}
          </select>
        </label>
        <label class="admin-field">
          <span>Modelo</span>
          <select name="template" ${templates.length ? '' : 'disabled'}>
            ${templates.map((template) => renderOption(template.id, getMessageTemplateLabel(template, 'pt'), selectedTemplateId)).join('')}
          </select>
        </label>
        <label class="admin-field">
          <span>Idioma sem reserva</span>
          <select name="language" ${isStandaloneMessage ? '' : 'disabled'}>
            ${Object.entries(LANGUAGE_LABELS).map(([value, label]) => renderOption(value, label, ui.selectedMessageLanguage)).join('')}
          </select>
        </label>
        <div class="admin-form-actions">
          <button class="button admin-secondary-button" type="submit">${icon('check')} Atualizar mensagem</button>
        </div>
      </form>
      ${!templates.length ? '<p class="admin-empty">Não há modelos configurados em locales/messages.json.</p>' : selectedReservation || isStandaloneMessage ? `
        <div class="admin-message-meta">
          <span>${escapeHtml(selectedReservation ? LANGUAGE_LABELS[selectedReservation.preferredLanguage] || selectedReservation.preferredLanguage : LANGUAGE_LABELS[ui.selectedMessageLanguage])}</span>
          <span>${escapeHtml(selectedReservation ? selectedReservation.contact.email || 'Sem email' : 'Sem reserva específica')}</span>
        </div>
        <textarea class="admin-message-output">${escapeHtml(message)}</textarea>
        ${renderMessageQuickActions({
          email: selectedReservation?.contact?.email || '',
          phone: selectedReservation?.contact?.phone || '',
          subject: getMessageActionSubject(selectedReservation, selectedTemplateId),
          message
        })}
      ` : draft ? '' : '<p class="admin-empty">Ainda não há reservas para gerar mensagens.</p>'}
    </section>
  `;
}

function renderReportsView() {
  const report = buildReportData();

  return `
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Período</p>
          <h2>Estatísticas e relatórios</h2>
        </div>
      </div>
      <form class="admin-filter-bar" data-form="report-filters">
        <label class="admin-field">
          <span>Analisar</span>
          <select name="period">
            ${renderOption('all', 'Todo o histórico', ui.reportFilters.period)}
            ${renderOption('year', 'Este ano', ui.reportFilters.period)}
            ${renderOption('season', 'Verão deste ano', ui.reportFilters.period)}
            ${renderOption('quarter', 'Trimestre atual', ui.reportFilters.period)}
            ${renderOption('month', 'Este mês', ui.reportFilters.period)}
            ${renderOption('week', 'Esta semana', ui.reportFilters.period)}
            ${renderOption('custom', 'Intervalo personalizado', ui.reportFilters.period)}
          </select>
        </label>
        <label class="admin-field">
          <span>Início personalizado</span>
          ${renderAdminDateControl({ name: 'startDate', value: formatDateInputValue(ui.reportFilters.startDate) })}
        </label>
        <label class="admin-field">
          <span>Fim personalizado</span>
          ${renderAdminDateControl({ name: 'endDate', value: formatDateInputValue(ui.reportFilters.endDate) })}
        </label>
        <button class="button admin-secondary-button" type="submit">${icon('check')} Atualizar</button>
      </form>
      <p class="admin-empty">Período ativo: ${escapeHtml(report.range.label)}</p>
    </section>

    <div class="admin-kpi-grid">
      ${renderMetric('Reservas', String(report.reservations.count), `${report.reservations.cancelled} cancelada(s)`)}
      ${renderMetric('Noites reservadas', String(report.reservations.nights), `${report.reservations.occupancyRate}% ocupação estimada`)}
      ${renderMetric('Receita', renderMoney(report.revenue.total), `${renderMoney(report.revenue.averageReservation)} por reserva`, 'tone-gold')}
      ${renderMetric('Resultado estimado', renderMoney(report.performance.profit), `Receita - despesas`, report.performance.profit >= 0 ? 'tone-green' : '')}
    </div>

    <section class="admin-dashboard-grid">
      <article class="admin-panel">
        <div class="admin-panel-heading"><div><p class="admin-eyebrow">Reservas</p><h2>Operação</h2></div></div>
        <dl class="admin-definition-list">
          <div><dt>Duração média</dt><dd>${report.reservations.averageStay} noite(s)</dd></div>
          <div><dt>Lead time médio</dt><dd>${report.reservations.averageLeadTime} dia(s)</dd></div>
          <div><dt>Entradas</dt><dd>${report.reservations.arrivals}</dd></div>
          <div><dt>Saídas</dt><dd>${report.reservations.departures}</dd></div>
          <div><dt>Período mais ocupado</dt><dd>${escapeHtml(report.reservations.busiestPeriod)}</dd></div>
          <div><dt>Reservas repetidas</dt><dd>${report.guests.repeatBookings}</dd></div>
        </dl>
      </article>
      <article class="admin-panel">
        <div class="admin-panel-heading"><div><p class="admin-eyebrow">Hóspedes</p><h2>Perfil</h2></div></div>
        <dl class="admin-definition-list">
          <div><dt>Total de hóspedes</dt><dd>${report.guests.total}</dd></div>
          <div><dt>Tamanho médio do grupo</dt><dd>${report.guests.averageGroupSize}</dd></div>
          <div><dt>Novos vs repetidos</dt><dd>${report.guests.newGuests} novos · ${report.guests.returningGuests} repetidos</dd></div>
        </dl>
        ${renderCountList(report.guests.groupSizes, {})}
      </article>
    </section>

    <section class="admin-dashboard-grid">
      <article class="admin-panel">
        <div class="admin-panel-heading"><div><p class="admin-eyebrow">Receita</p><h2>Origem do valor</h2></div></div>
        <dl class="admin-definition-list">
          <div><dt>Alojamento</dt><dd>${renderMoney(report.revenue.accommodation)}</dd></div>
          <div><dt>Serviços</dt><dd>${renderMoney(report.revenue.services)}</dd></div>
          <div><dt>Receita/noite</dt><dd>${renderMoney(report.revenue.averageNightly)}</dd></div>
          <div><dt>Valor médio/reserva</dt><dd>${renderMoney(report.revenue.averageReservation)}</dd></div>
        </dl>
        ${renderCountList(report.reservations.bySource, SOURCE_LABELS)}
      </article>
      <article class="admin-panel">
        <div class="admin-panel-heading"><div><p class="admin-eyebrow">Despesas</p><h2>Custos e resultado</h2></div></div>
        <dl class="admin-definition-list">
          <div><dt>Total de despesas</dt><dd>${renderMoney(report.expenses.total)}</dd></div>
          <div><dt>Custos de trabalho</dt><dd>${renderMoney(report.expenses.employeeCosts)}</dd></div>
          <div><dt>Resultado estimado</dt><dd>${renderMoney(report.performance.profit)}</dd></div>
        </dl>
        ${renderCountList(report.expenses.byCategory, EXPENSE_LABELS)}
      </article>
    </section>

    <section class="admin-dashboard-grid">
      <article class="admin-panel">
        <div class="admin-panel-heading"><div><p class="admin-eyebrow">Idiomas</p><h2>Preferência dos hóspedes</h2></div></div>
        ${renderCountList(report.guests.byLanguage, LANGUAGE_LABELS)}
      </article>
      <article class="admin-panel">
        <div class="admin-panel-heading"><div><p class="admin-eyebrow">Nacionalidade</p><h2>Registos conhecidos</h2></div></div>
        ${renderCountList(report.guests.byNationality, {})}
      </article>
    </section>

    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Exportar</p>
          <h2>Relatórios CSV</h2>
        </div>
      </div>
      <div class="admin-button-row">
        <button class="button admin-secondary-button" type="button" data-action="export-report" data-report="reservations">${icon('download')} Reservas</button>
        <button class="button admin-secondary-button" type="button" data-action="export-report" data-report="expenses">${icon('download')} Despesas</button>
        <button class="button admin-secondary-button" type="button" data-action="export-report" data-report="work">${icon('download')} Horas e custos</button>
        <button class="button admin-secondary-button" type="button" data-action="export-report" data-report="summary">${icon('download')} Resumo financeiro</button>
      </div>
    </section>
  `;
}

function getReportRange() {
  const now = new Date();
  const todayKey = formatDateKey(now);
  const year = now.getFullYear();
  const month = now.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const startOfWeek = addDays(now, -((now.getDay() + 6) % 7));
  const endOfWeek = addDays(startOfWeek, 6);

  if (ui.reportFilters.period === 'year') {
    return { start: `${year}-01-01`, end: `${year}-12-31`, label: `Ano ${year}` };
  }
  if (ui.reportFilters.period === 'season') {
    return { start: `${year}-06-01`, end: `${year}-09-30`, label: `Verão ${year}` };
  }
  if (ui.reportFilters.period === 'quarter') {
    const start = new Date(year, quarterStartMonth, 1);
    const end = new Date(year, quarterStartMonth + 3, 0);
    return { start: formatDateKey(start), end: formatDateKey(end), label: `Trimestre ${Math.floor(month / 3) + 1} de ${year}` };
  }
  if (ui.reportFilters.period === 'month') {
    return { start: `${year}-${String(month + 1).padStart(2, '0')}-01`, end: formatDateKey(new Date(year, month + 1, 0)), label: `Mês atual` };
  }
  if (ui.reportFilters.period === 'week') {
    return { start: formatDateKey(startOfWeek), end: formatDateKey(endOfWeek), label: `Semana atual` };
  }
  if (ui.reportFilters.period === 'custom' && ui.reportFilters.startDate && ui.reportFilters.endDate) {
    return { start: ui.reportFilters.startDate, end: ui.reportFilters.endDate, label: `${formatCompactDate(ui.reportFilters.startDate)} a ${formatCompactDate(ui.reportFilters.endDate)}` };
  }

  return { start: '', end: todayKey, label: 'Todo o histórico' };
}

function dateInRange(dateKey, range) {
  if (!dateKey) return false;
  if (range.start && dateKey < range.start) return false;
  if (range.end && dateKey > range.end) return false;
  return true;
}

function average(values) {
  const validValues = values.filter((value) => Number.isFinite(value));
  if (!validValues.length) return 0;
  return Math.round((validValues.reduce((total, value) => total + value, 0) / validValues.length) * 10) / 10;
}

function addCount(counts, key, amount = 1) {
  const safeKey = key || 'Sem dados';
  counts[safeKey] = (counts[safeKey] || 0) + amount;
}

function buildReportData() {
  const range = getReportRange();
  const countedReservations = state.reservations.filter((reservation) =>
    dateInRange(reservation.stay.checkIn, range) &&
    ['awaiting_payment', 'confirmed', 'checked_in', 'checked_out'].includes(reservation.status)
  );
  const cancelledReservations = state.reservations.filter((reservation) =>
    dateInRange(reservation.stay.checkIn, range) &&
    ['cancelled', 'no_show'].includes(reservation.status)
  );
  const expenses = state.expenses.filter((expense) => dateInRange(expense.date, range));
  const workSessions = state.workSessions.filter((session) => dateInRange(session.date, range));
  const totals = countedReservations.map((reservation) => calculateReservationTotals(reservation, state));
  const nights = totals.reduce((total, item) => total + item.nights, 0);
  const revenue = totals.reduce((acc, item) => {
    acc.accommodation += item.accommodation;
    acc.services += item.services;
    acc.total += item.total;
    return acc;
  }, { accommodation: 0, services: 0, total: 0 });
  const expenseTotal = expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
  const employeeCosts = workSessions.reduce((total, session) => total + getWorkSessionCost(session), 0);
  const bySource = {};
  const byLanguage = {};
  const groupSizes = {};
  const byNationality = {};
  const reservationsByMonth = {};
  const guestReservationCounts = {};

  countedReservations.forEach((reservation) => {
    addCount(bySource, reservation.source);
    addCount(byLanguage, reservation.preferredLanguage);
    addCount(groupSizes, `${getGuestCount(reservation)} hóspedes`);
    addCount(reservationsByMonth, reservation.stay.checkIn.slice(0, 7));
    if (reservation.guestId) addCount(guestReservationCounts, reservation.guestId);
  });

  state.guests.forEach((guest) => addCount(byNationality, guest.nationality || 'Sem dados'));

  const rangeDays = range.start && range.end
    ? Math.max(1, Math.round((parseDateKey(range.end) - parseDateKey(range.start)) / 86400000) + 1)
    : Math.max(1, nights || 1);
  const busiestPeriod = Object.entries(reservationsByMonth).sort((a, b) => b[1] - a[1])[0];
  const leadTimes = countedReservations.map((reservation) => {
    const created = reservation.createdAt ? new Date(reservation.createdAt) : null;
    if (!created || Number.isNaN(created.getTime())) return 0;
    return Math.max(0, Math.round((parseDateKey(reservation.stay.checkIn) - created) / 86400000));
  });
  const totalGuests = countedReservations.reduce((total, reservation) => total + getGuestCount(reservation), 0);
  const returningGuestIds = Object.values(guestReservationCounts).filter((count) => count > 1).length;
  const expensesByCategory = {};
  expenses.forEach((expense) => addCount(expensesByCategory, expense.category, Number(expense.amount || 0)));

  return {
    range,
    reservations: {
      count: countedReservations.length,
      cancelled: cancelledReservations.length,
      nights,
      occupancyRate: Math.min(100, Math.round((nights / rangeDays) * 100)),
      averageStay: average(totals.map((item) => item.nights)),
      averageLeadTime: average(leadTimes),
      arrivals: countedReservations.length,
      departures: countedReservations.filter((reservation) => dateInRange(reservation.stay.checkOut, range)).length,
      busiestPeriod: busiestPeriod ? `${busiestPeriod[0]} (${busiestPeriod[1]} reserva(s))` : 'Sem dados',
      bySource
    },
    guests: {
      total: totalGuests,
      averageGroupSize: average(countedReservations.map(getGuestCount)),
      groupSizes,
      byLanguage,
      byNationality,
      repeatBookings: Object.values(guestReservationCounts).filter((count) => count > 1).reduce((total, count) => total + count - 1, 0),
      newGuests: Math.max(0, Object.keys(guestReservationCounts).length - returningGuestIds),
      returningGuests: returningGuestIds
    },
    revenue: {
      total: revenue.total,
      accommodation: revenue.accommodation,
      services: revenue.services,
      averageReservation: countedReservations.length ? revenue.total / countedReservations.length : 0,
      averageNightly: nights ? revenue.total / nights : 0
    },
    expenses: {
      total: expenseTotal,
      employeeCosts,
      byCategory: expensesByCategory
    },
    performance: {
      profit: revenue.total - expenseTotal - employeeCosts
    },
    countedReservations,
    expensesRaw: expenses,
    workSessions
  };
}

function renderCountList(counts, labels) {
  const entries = Object.entries(counts);
  if (!entries.length) return '<p class="admin-empty">Sem dados suficientes.</p>';
  const max = Math.max(...entries.map(([, count]) => count));

  return `
    <div class="admin-bar-list">
      ${entries.map(([key, count]) => `
        <div class="admin-bar-row">
          <span>${escapeHtml(labels[key] || key)}</span>
          <i style="--bar-size:${Math.max(8, (count / max) * 100)}%"></i>
          <strong>${count}</strong>
        </div>
      `).join('')}
    </div>
  `;
}

function renderSettingsView() {
  return `
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Protótipo</p>
          <h2>Limites e próximos passos</h2>
        </div>
      </div>
      <div class="admin-note-list">
        <p><strong>Admin em português:</strong> esta área não usa os ficheiros públicos de i18n.</p>
        <p><strong>Dados:</strong> a UI fala com uma camada de repositório. Neste protótipo, o repositório usa localStorage; em produção, deve ser trocado por APIs autenticadas.</p>
        <p><strong>Segurança:</strong> não coloque dados reais, documentos de identificação ou informação financeira sensível neste modo local.</p>
      </div>
      <div class="admin-button-row">
        ${can(currentUser, 'data:export') ? `<button class="button admin-secondary-button" type="button" data-action="export-data">${icon('download')} Exportar dados JSON</button>` : ''}
        ${can(currentUser, 'data:reset') ? `<button class="button admin-danger-button" type="button" data-action="reset-demo">${icon('trash')} Repor dados de demonstração</button>` : ''}
      </div>
    </section>
    <section class="admin-panel">
      <div class="admin-panel-heading">
        <div>
          <p class="admin-eyebrow">Log</p>
          <h2>Histórico de alterações</h2>
        </div>
      </div>
      ${renderAuditFilters()}
      ${renderAuditList()}
    </section>
  `;
}

function renderAuditFilters() {
  const entityTypes = [...new Set(state.auditLog.map((entry) => entry.entityType).filter(Boolean))].sort();
  const actors = [...new Set(state.auditLog.map((entry) => entry.actorName).filter(Boolean))].sort();

  return `
    <form class="admin-filter-bar" data-form="audit-filters">
      <label class="admin-field">
        <span>Pesquisar</span>
        <input name="search" type="search" value="${escapeHtml(ui.auditFilters.search)}" placeholder="Ação, pessoa, entidade ou ID" />
      </label>
      <label class="admin-field">
        <span>Tipo</span>
        <select name="entityType">
          ${renderOption('all', 'Todos', ui.auditFilters.entityType)}
          ${entityTypes.map((type) => renderOption(type, type, ui.auditFilters.entityType)).join('')}
        </select>
      </label>
      <label class="admin-field">
        <span>Pessoa</span>
        <select name="actor">
          ${renderOption('all', 'Todas', ui.auditFilters.actor)}
          ${actors.map((actor) => renderOption(actor, actor, ui.auditFilters.actor)).join('')}
        </select>
      </label>
      <button class="button admin-secondary-button" type="button" data-action="clear-audit-filters">Limpar</button>
    </form>
  `;
}

function getFilteredAuditLog() {
  const search = ui.auditFilters.search.trim().toLowerCase();
  return state.auditLog
    .filter((entry) => ui.auditFilters.entityType === 'all' || entry.entityType === ui.auditFilters.entityType)
    .filter((entry) => ui.auditFilters.actor === 'all' || entry.actorName === ui.auditFilters.actor)
    .filter((entry) => {
      if (!search) return true;
      return [entry.id, entry.actorName, entry.action, entry.entityType, entry.entityId]
        .some((value) => String(value || '').toLowerCase().includes(search));
    })
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
}

function formatAuditValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '-';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function humanizeAuditDetailKey(key) {
  return String(key || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
}

function getAuditEntityDetailRows(entry) {
  const rows = [];

  Object.entries(entry.details || {}).forEach(([key, value]) => {
    rows.push([humanizeAuditDetailKey(key), formatAuditValue(value)]);
  });

  if (entry.entityType === 'reservation') {
    const reservation = state.reservations.find((candidate) => candidate.id === entry.entityId);
    if (!reservation) return rows;
    const totals = calculateReservationTotals(reservation, state);
    rows.push(
      ['Hóspede', reservation.contact?.name || '-'],
      ['Datas', formatStayRange(reservation.stay)],
      ['Estado atual', STATUS_LABELS[reservation.status] || reservation.status],
      ['Pagamento atual', PAYMENT_LABELS[reservation.paymentStatus] || reservation.paymentStatus],
      ['Hóspedes', formatGuestSummary(reservation.guests)],
      ['Hóspedes extra', renderGuestAdjustmentsSummary(reservation)],
      ['Total atual', renderMoney(totals.total)]
    );
  } else if (entry.entityType === 'websiteRequest') {
    const request = state.websiteRequests.find((candidate) => candidate.id === entry.entityId);
    if (!request) return rows;
    rows.push(
      ['Contacto', request.contact?.name || '-'],
      ['Datas', formatStayRange(request.stay)],
      ['Estado atual', getRequestStatusLabel(request.status)],
      ['Depósito', getDepositRequestText(request)],
      ['Total estimado', renderMoney(request.estimatedTotal || 0)]
    );
  } else if (entry.entityType === 'expense') {
    const expense = state.expenses.find((candidate) => candidate.id === entry.entityId);
    if (!expense) return rows;
    rows.push(
      ['Data', formatCompactDate(expense.date)],
      ['Categoria', EXPENSE_LABELS[expense.category] || expense.category],
      ['Descrição', expense.description],
      ['Valor', renderMoney(expense.amount)],
      ['Notas', expense.notes || '-']
    );
  } else if (entry.entityType === 'workSession') {
    const session = state.workSessions.find((candidate) => candidate.id === entry.entityId);
    const employee = state.employees.find((candidate) => candidate.id === session?.employeeId);
    if (!session) return rows;
    rows.push(
      ['Pessoa', employee?.name || session.employeeId],
      ['Início', formatDateTime(session.start)],
      ['Fim', session.end ? formatDateTime(session.end) : 'Em curso'],
      ['Tipo', COMPENSATION_LABELS[session.compensationType || 'paid'] || session.compensationType],
      ['Tarefas', renderSessionTasks(session)],
      ['Custo', renderMoney(getWorkSessionCost(session))]
    );
  } else if (entry.entityType === 'employee') {
    const employee = state.employees.find((candidate) => candidate.id === entry.entityId);
    if (!employee) return rows;
    rows.push(
      ['Nome', employee.name],
      ['Perfil', ROLE_LABELS[employee.permissionsProfile] || employee.permissionsProfile],
      ['Modo habitual', COMPENSATION_LABELS[getEmployeeDefaultCompensation(employee)]],
      ['Taxa atual', `${renderMoney(getHourlyRate(employee))}/h`]
    );
  } else if (entry.entityType === 'pricing') {
    const season = (state.pricing.seasons || []).find((candidate) => candidate.id === entry.entityId);
    const discount = (state.pricing.discounts || []).find((candidate) => candidate.id === entry.entityId);
    if (season) {
      rows.push(
        ['Época', season.title],
        ['Período', formatSeasonPeriod(season)],
        ['Adulto/noite', renderMoney(season.adultNight)],
        ['Criança/noite', renderMoney(season.childNight)]
      );
    } else if (discount) {
      rows.push(
        ['Desconto', discount.title],
        ['Código', discount.code || '-'],
        ['Valor', renderDiscountValue(discount)],
        ['Período', renderDiscountPeriod(discount)]
      );
    } else if (entry.entityId === 'base') {
      rows.push(
        ['Adulto/noite base', renderMoney(state.pricing.adultNight)],
        ['Mínimo cobrado', `${state.pricing.minimumPaidAdults || 2} adulto(s)`],
        ['Criança/noite base', renderMoney(state.pricing.childNight)]
      );
    } else if (entry.entityId === 'services') {
      rows.push(
        ['Bicicleta/dia', renderMoney(state.pricing.bikeDay)],
        ['Depósito', renderMoney(state.pricing.securityDeposit)]
      );
    }
  }

  return rows;
}

function renderAuditEntryDetails(entry) {
  const rows = getAuditEntityDetailRows(entry);
  if (!rows.length) return '<div><dt>Detalhes</dt><dd>Sem detalhes adicionais para esta alteração.</dd></div>';
  return rows
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(formatAuditValue(value))}</dd></div>`)
    .join('');
}

function renderAuditList() {
  const entries = getFilteredAuditLog();

  return `
    <div class="admin-record-list" data-audit-list>
      ${entries.length ? entries.map((entry) => {
        const isExpanded = ui.expandedAuditIds.has(entry.id);
        return `
          <article class="admin-record admin-record-compact">
            <button class="admin-audit-row" type="button" data-action="toggle-audit" data-audit-id="${entry.id}">
              <strong>${escapeHtml(formatDateTime(entry.at))}</strong>
              <span>${escapeHtml(entry.actorName)} · ${escapeHtml(entry.action)} · ${escapeHtml(entry.entityType)} ${escapeHtml(entry.entityId)}</span>
            </button>
            ${isExpanded ? `
              <dl class="admin-record-details">
                <div><dt>ID</dt><dd>${escapeHtml(entry.id)}</dd></div>
                <div><dt>Utilizador</dt><dd>${escapeHtml(entry.actorName)} (${escapeHtml(entry.actorId)})</dd></div>
                <div><dt>Entidade</dt><dd>${escapeHtml(entry.entityType)} · ${escapeHtml(entry.entityId)}</dd></div>
                <div><dt>Quando</dt><dd>${escapeHtml(formatDateTime(entry.at))}</dd></div>
                ${renderAuditEntryDetails(entry)}
              </dl>
            ` : ''}
          </article>
        `;
      }).join('') : '<p class="admin-empty">Nenhuma alteração corresponde aos filtros.</p>'}
    </div>
  `;
}

function buildReservationFromForm(form) {
  const data = new FormData(form);
  const reservationId = String(data.get('reservationId') || '').trim();
  const existingReservation = reservationId
    ? state.reservations.find((reservation) => reservation.id === reservationId)
    : null;
  const checkIn = parseAdminDateInput(data.get('checkIn'), 'Check-in');
  const checkOut = parseAdminDateInput(data.get('checkOut'), 'Check-out');
  const adults = Math.max(1, Number(data.get('adults') || 1));
  const children = Math.max(0, Number(data.get('children') || 0));
  const totalGuests = adults + children;
  const childAges = String(data.get('childAges') || '')
    .split(/[,;\n]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
  const existingGuestAdjustments = getGuestAdjustments(existingReservation).map((adjustment) => {
    const fieldName = getExtraGuestPaymentFieldName(adjustment);
    return {
      ...adjustment,
      paymentStatus: data.has(fieldName)
        ? normalizeExtraGuestPaymentStatus(String(data.get(fieldName) || 'awaiting_transfer'))
        : normalizeExtraGuestPaymentStatus(adjustment.paymentStatus)
    };
  });
  const extraGuestAdults = Math.max(0, Number(data.get('extraGuestAdults') || 0));
  const extraGuestChildren = Math.max(0, Number(data.get('extraGuestChildren') || 0));
  const extraGuestTotal = extraGuestAdults + extraGuestChildren;
  const extraGuestChildAges = String(data.get('extraGuestChildAges') || '')
    .split(/[,;\n]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
  const extraGuestDiscountType = String(data.get('extraGuestDiscountType') || 'amount');
  const extraGuestDiscount = Math.max(0, Number(data.get('extraGuestDiscount') || 0));
  const extraGuestPaymentStatus = normalizeExtraGuestPaymentStatus(String(data.get('extraGuestPaymentStatus') || 'awaiting_transfer'));
  const extraGuestFromDateInput = String(data.get('extraGuestFromDate') || '').trim();

  if (!checkIn || !checkOut || parseDateKey(checkOut) <= parseDateKey(checkIn)) {
    throw new Error('O check-out deve ser depois do check-in.');
  }

  if (totalGuests > state.property.occupancyLimit) {
    throw new Error(`O limite atual é de ${state.property.occupancyLimit} hóspedes.`);
  }

  if (childAges.some((age) => !Number.isFinite(age) || age < 0 || age > 12)) {
    throw new Error('As idades das crianças devem estar entre 0 e 12 anos.');
  }

  if (extraGuestChildAges.some((age) => !Number.isFinite(age) || age < 0 || age > 12)) {
    throw new Error('As idades das crianças extra devem estar entre 0 e 12 anos.');
  }

  if (extraGuestTotal && !extraGuestFromDateInput) {
    throw new Error('Indique a data de chegada dos hóspedes extra.');
  }

  if (extraGuestTotal) {
    const extraGuestFromDate = parseAdminDateInput(extraGuestFromDateInput, 'Chegada do hóspede extra');
    if (extraGuestFromDate < checkIn || extraGuestFromDate >= checkOut) {
      throw new Error('A chegada do hóspede extra deve ficar dentro das datas da estadia.');
    }

    existingGuestAdjustments.push({
      id: makeId('GUESTADD', existingGuestAdjustments),
      fromDate: extraGuestFromDate,
      adults: extraGuestAdults,
      children: extraGuestChildren,
      childAges: extraGuestChildAges,
      discountType: extraGuestDiscountType,
      discountPercent: extraGuestDiscountType === 'percentage' ? Math.min(100, extraGuestDiscount) : 0,
      discountAmount: extraGuestDiscountType === 'amount' ? extraGuestDiscount : 0,
      paymentStatus: extraGuestPaymentStatus,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    });
  }

  const maxGuestLoad = totalGuests + existingGuestAdjustments.reduce((total, adjustment) =>
    total + Number(adjustment.adults || 0) + Number(adjustment.children || 0),
    0
  );

  if (maxGuestLoad > state.property.occupancyLimit) {
    throw new Error(`Com os hóspedes extra, o limite atual é de ${state.property.occupancyLimit} hóspedes.`);
  }

  const contact = {
    name: String(data.get('guestName') || '').trim(),
    email: String(data.get('email') || '').trim(),
    phone: String(data.get('phone') || '').trim()
  };
  const guestNationality = String(data.get('nationality') || '').trim();
  const websiteRequestId = String(data.get('websiteRequestId') || '').trim();
  const preferredLanguage = String(data.get('preferredLanguage') || 'pt');
  const status = String(data.get('status') || 'awaiting_payment');
  const checkInTime = normalizeAdminTime(data.get('checkInTime') || state.property.defaultCheckInTime, 'Hora de check-in');
  const checkOutTime = normalizeAdminTime(data.get('checkOutTime') || state.property.defaultCheckOutTime, 'Hora de check-out');
  const discountType = String(data.get('discountType') || 'percentage');
  const discountValue = Math.max(0, Number(data.get('discountValue') || 0));
  const paymentStatus = status === 'confirmed'
    ? 'paid'
    : existingReservation?.paymentStatus || 'awaiting_transfer';

  return {
    id: reservationId || makeId('RES', state.reservations),
    guestId: existingReservation?.guestId || '',
    source: String(data.get('source') || 'private'),
    sourceReference: String(data.get('sourceReference') || websiteRequestId || '').trim(),
    status,
    paymentStatus,
    preferredLanguage,
    contact,
    stay: {
      checkIn,
      checkOut,
      checkInTime,
      checkOutTime
    },
    guests: {
      adults,
      children,
      childAges
    },
    preferences: {
      bed: String(data.get('bedPreference') || '')
    },
    pricing: {
      adultNight: state.pricing.adultNight,
      minimumPaidAdults: state.pricing.minimumPaidAdults || 2,
      childNight: state.pricing.childNight,
      bikeDay: state.pricing.bikeDay,
      discountType,
      discountPercent: discountType === 'percentage' ? Math.min(100, discountValue) : 0,
      discountAmount: discountType === 'amount' ? discountValue : 0,
      discountCode: String(data.get('discountCode') || '').trim(),
      depositIncluded: data.get('depositIncluded') === 'on'
    },
    extras: {
      bikes: {
        count: Math.max(0, Number(data.get('bikeCount') || 0)),
        days: Math.max(0, Number(data.get('bikeDays') || 0))
      }
    },
    guestAdjustments: existingGuestAdjustments,
    marketingOptIn: data.get('marketingOptIn') === 'on',
    guestNationality,
    websiteRequestId,
    notes: {
      owner: String(data.get('ownerNotes') || '').trim(),
      operational: String(data.get('operationalNotes') || '').trim()
    },
    createdAt: existingReservation?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: existingReservation?.createdBy || currentUser.id
  };
}

function handleLoginSubmit(form) {
  const data = new FormData(form);
  const username = String(data.get('username') || '');
  rememberLoginUsername(username);

  return login(username, String(data.get('password') || ''))
    .then(loadSessionAndState)
    .catch((error) => renderLogin(error.message));
}

async function handleCreateReservation(form) {
  requirePermission(currentUser, 'reservations:write');
  const reservation = buildReservationFromForm(form);
  const existingIndex = state.reservations.findIndex((candidate) => candidate.id === reservation.id);
  const isEditing = existingIndex >= 0;
  const previousReservation = isEditing ? state.reservations[existingIndex] : null;
  const extraGuestPaymentStatusChanges = isEditing
    ? getExtraGuestPaymentStatusChanges(previousReservation, reservation)
    : [];
  const conflicts = findReservationConflicts(state, reservation, isEditing ? reservation.id : '');

  if (conflicts.length) {
    requirePermission(currentUser, 'reservations:override-conflict');
    const confirmed = window.confirm(`Esta reserva entra em conflito com ${conflicts.map((item) => item.id).join(', ')}. Guardar mesmo assim?`);
    if (!confirmed) return;
  }

  const guest = getOrCreateGuest(state, reservation.contact, reservation.preferredLanguage, reservation.guestNationality);
  reservation.guestId = guest.id;
  delete reservation.guestNationality;
  if (isEditing) {
    state.reservations[existingIndex] = reservation;
    addAudit(state, currentUser, 'Reserva editada', 'reservation', reservation.id, extraGuestPaymentStatusChanges.length ? {
      'Pagamento dos hóspedes extra': extraGuestPaymentStatusChanges
    } : {});
  } else {
    state.reservations.push(reservation);
  }

  if (!isEditing && reservation.websiteRequestId) {
    const request = state.websiteRequests.find((candidate) => candidate.id === reservation.websiteRequestId);
    if (request) {
      request.status = 'accepted';
      request.acceptedReservationId = reservation.id;
      request.updatedAt = new Date().toISOString();
      addAudit(state, currentUser, 'Pedido do website convertido em reserva a aguardar pagamento', 'reservation', reservation.id);
    }
  } else if (!isEditing) {
    addAudit(state, currentUser, 'Reserva criada manualmente', 'reservation', reservation.id);
  }

  ui.messageDraft = null;
  ui.requestDraftId = '';
  ui.editingReservationId = '';
  ui.reservationFilters.search = '';
  if (!isEditing) {
    ui.selectedMessageReservationId = reservation.id;
    ui.selectedMessageTemplate = resolveMessageTemplateId('paymentInstructions');
    ui.activeView = 'messages';
  }
  await persist(isEditing ? `Reserva ${reservation.id} atualizada.` : `Reserva ${reservation.id} criada.`);
}

async function handleAcceptRequest(requestId) {
  requirePermission(currentUser, 'requests:manage');
  const request = state.websiteRequests.find((candidate) => candidate.id === requestId);
  if (!request || request.status !== 'new') throw new Error('Pedido não encontrado ou já tratado.');

  const conflicts = findReservationConflicts(state, { stay: request.stay });

  if (conflicts.length) {
    const confirmed = window.confirm(`Este pedido entra em conflito com ${conflicts.map((item) => item.id).join(', ')}. Preparar mesmo assim?`);
    if (!confirmed) return;
  }

  ui.reservationFilters.search = '';
  ui.reservationFilters.status = 'all';
  ui.reservationFilters.source = 'all';
  setNotice(`Pedido ${request.id} carregado no formulário de nova reserva.`);
  openCreateReservation(request.id);
}

async function handleRejectRequest(requestId) {
  requirePermission(currentUser, 'requests:manage');
  const request = state.websiteRequests.find((candidate) => candidate.id === requestId);
  if (!request || request.status !== 'new') return;
  if (!window.confirm(`Rejeitar o pedido ${request.id}?`)) return;
  request.status = 'rejected';
  request.updatedAt = new Date().toISOString();
  addAudit(state, currentUser, 'Pedido do website rejeitado', 'websiteRequest', request.id);
  ui.messageDraft = createRequestMessageDraft(request, 'requestRejected');
  ui.selectedMessageReservationId = '';
  ui.activeView = 'messages';
  await persist(`Pedido ${request.id} rejeitado.`);
}

async function handleMarkPaid(reservationId) {
  requirePermission(currentUser, 'reservations:write');
  const reservation = state.reservations.find((candidate) => candidate.id === reservationId);
  if (!reservation) return;
  reservation.status = 'confirmed';
  reservation.paymentStatus = 'paid';
  reservation.updatedAt = new Date().toISOString();
  addAudit(state, currentUser, 'Pagamento marcado como recebido', 'reservation', reservation.id);
  ui.selectedMessageReservationId = reservation.id;
  await persist(`Pagamento de ${reservation.id} marcado como recebido.`);
}

async function handleReservationOperationsSubmit(form) {
  requirePermission(currentUser, 'reservations:operations');
  const data = new FormData(form);
  const reservation = state.reservations.find((candidate) => candidate.id === data.get('reservationId'));

  if (!reservation) throw new Error('Reserva não encontrada.');

  reservation.stay.checkInTime = normalizeAdminTime(data.get('checkInTime') || state.property.defaultCheckInTime, 'Hora de check-in');
  reservation.stay.checkOutTime = normalizeAdminTime(data.get('checkOutTime') || state.property.defaultCheckOutTime, 'Hora de check-out');
  reservation.preferredLanguage = String(data.get('preferredLanguage') || reservation.preferredLanguage || 'pt');
  reservation.paymentStatus = String(data.get('paymentStatus') || reservation.paymentStatus || 'awaiting_transfer');

  if (reservation.paymentStatus === 'paid' && reservation.status === 'awaiting_payment') {
    reservation.status = 'confirmed';
  }

  reservation.updatedAt = new Date().toISOString();
  ui.editingReservationId = '';
  addAudit(state, currentUser, 'Dados operacionais da reserva atualizados', 'reservation', reservation.id);
  await persist(`Operação de ${reservation.id} guardada.`);
}

async function handleCancelReservation(reservationId) {
  requirePermission(currentUser, 'reservations:write');
  const reservation = state.reservations.find((candidate) => candidate.id === reservationId);
  if (!reservation || !window.confirm(`Cancelar a reserva ${reservation.id}?`)) return;
  reservation.previousStatusBeforeCancel = reservation.status;
  reservation.status = 'cancelled';
  reservation.updatedAt = new Date().toISOString();
  addAudit(state, currentUser, 'Reserva cancelada', 'reservation', reservation.id);
  await persist(`Reserva ${reservation.id} cancelada.`);
}

async function handleRestoreReservation(reservationId) {
  requirePermission(currentUser, 'reservations:write');
  const reservation = state.reservations.find((candidate) => candidate.id === reservationId);
  if (!reservation || reservation.status !== 'cancelled') return;

  const conflicts = findReservationConflicts(state, reservation, reservation.id);
  if (conflicts.length) {
    requirePermission(currentUser, 'reservations:override-conflict');
    const confirmed = window.confirm(`Esta reserva entra em conflito com ${conflicts.map((item) => item.id).join(', ')}. Restaurar mesmo assim?`);
    if (!confirmed) return;
  }

  reservation.status = reservation.previousStatusBeforeCancel || 'awaiting_payment';
  delete reservation.previousStatusBeforeCancel;
  reservation.updatedAt = new Date().toISOString();
  addAudit(state, currentUser, 'Reserva restaurada', 'reservation', reservation.id);
  await persist(`Reserva ${reservation.id} restaurada.`);
}

async function handlePricingSubmit(form) {
  requirePermission(currentUser, 'pricing:write');
  const data = new FormData(form);
  state.pricing.adultNight = Math.max(0, Number(data.get('adultNight') || 0));
  state.pricing.minimumPaidAdults = Math.max(1, Number(data.get('minimumPaidAdults') || 2));
  state.pricing.childNight = Math.max(0, Number(data.get('childNight') || 0));
  addAudit(state, currentUser, 'Preços de alojamento atualizados', 'pricing', 'base');
  await persist('Preços de alojamento guardados.');
}

async function handleServicePricingSubmit(form) {
  requirePermission(currentUser, 'pricing:write');
  const data = new FormData(form);
  state.pricing.bikeDay = Math.max(0, Number(data.get('bikeDay') || 0));
  state.pricing.securityDeposit = Math.max(0, Number(data.get('securityDeposit') || 0));
  addAudit(state, currentUser, 'Preços de serviços atualizados', 'pricing', 'services');
  await persist('Preços de serviços guardados.');
}

async function handleSeasonSubmit(form) {
  requirePermission(currentUser, 'pricing:write');
  const data = new FormData(form);
  const seasonId = String(data.get('seasonId') || '');
  const kind = String(data.get('kind') || 'recurring');
  const startInput = String(data.get('startDate') || '');
  const endInput = String(data.get('endDate') || '');
  const startDate = kind === 'dated' ? parseAdminDateInput(startInput, 'Início da época') : '';
  const endDate = kind === 'dated' ? parseAdminDateInput(endInput, 'Fim da época') : '';
  const startMonthDay = kind === 'recurring' ? parseAdminMonthDayInput(startInput, 'Início da época') : '';
  const endMonthDay = kind === 'recurring' ? parseAdminMonthDayInput(endInput, 'Fim da época') : '';

  if (kind === 'dated' && parseDateKey(endDate) < parseDateKey(startDate)) {
    throw new Error('A data final da época não pode ser anterior ao início.');
  }

  state.pricing.seasons ||= [];
  const candidate = { kind, startDate, endDate, startMonthDay, endMonthDay };
  const overlaps = state.pricing.seasons.filter((season) => {
    if (season.id === seasonId) return false;
    const seasonKind = season.kind || 'dated';
    if (kind === 'dated' && seasonKind === 'dated') {
      return dateRangeOverlaps(startDate, endDate, season.startDate, season.endDate);
    }
    if (kind === 'recurring' && seasonKind === 'recurring') {
      return recurringSeasonsOverlap(candidate, season);
    }
    return false;
  });

  if (overlaps.length) {
    throw new Error(`Esta época sobrepõe-se a ${overlaps.map((season) => season.title).join(', ')}.`);
  }

  const existingSeason = state.pricing.seasons.find((item) => item.id === seasonId);
  const season = existingSeason || {
    id: makeId('SEASON', state.pricing.seasons),
    active: true
  };

  Object.assign(season, {
    kind,
    title: String(data.get('title') || '').trim(),
    startDate,
    endDate,
    startMonthDay,
    endMonthDay,
    adultNight: Math.max(0, Number(data.get('adultNight') || state.pricing.adultNight)),
    childNight: Math.max(0, Number(data.get('childNight') || state.pricing.childNight)),
    notes: String(data.get('notes') || '').trim(),
    active: season.active !== false
  });

  if (!existingSeason) state.pricing.seasons.push(season);
  ui.editingSeasonId = '';
  addAudit(state, currentUser, existingSeason ? 'Preço sazonal atualizado' : 'Preço sazonal criado', 'pricing', season.id, {
    title: season.title,
    period: formatSeasonPeriod(season),
    adultNight: season.adultNight,
    childNight: season.childNight
  });
  await persist(existingSeason ? 'Época atualizada.' : 'Época adicionada.');
}

async function handleGroupDiscountSubmit(form) {
  requirePermission(currentUser, 'pricing:write');
  const data = new FormData(form);
  state.pricing.groupDiscounts ||= [];
  const minGuests = Math.max(2, Number(data.get('minGuests') || 2));
  const existing = state.pricing.groupDiscounts.find((discount) => Number(discount.minGuests) === minGuests);

  if (existing) {
    existing.amountPerNight = Math.max(0, Number(data.get('amountPerNight') || 0));
    existing.active = data.get('active') === 'on';
  } else {
    state.pricing.groupDiscounts.push({
      id: makeId('GROUPDISC', state.pricing.groupDiscounts),
      minGuests,
      amountPerNight: Math.max(0, Number(data.get('amountPerNight') || 0)),
      active: data.get('active') === 'on'
    });
  }

  state.pricing.groupDiscounts.sort((a, b) => Number(a.minGuests) - Number(b.minGuests));
  addAudit(state, currentUser, 'Redução por grupo atualizada', 'pricing', 'group-discount');
  await persist('Redução por grupo guardada.');
}

async function handleDiscountSubmit(form) {
  requirePermission(currentUser, 'pricing:write');
  const data = new FormData(form);
  const startDate = parseOptionalAdminDateInput(data.get('startDate'), 'Início do desconto');
  const endDate = parseOptionalAdminDateInput(data.get('endDate'), 'Fim do desconto');
  const type = String(data.get('type') || 'percentage');
  const discountValue = Math.max(0, Number(data.get('discountValue') || 0));
  const percentage = type === 'percentage' ? Math.min(100, discountValue) : 0;
  const amount = type === 'amount' ? discountValue : 0;

  if (startDate && endDate && parseDateKey(endDate) < parseDateKey(startDate)) {
    throw new Error('A data final do desconto não pode ser anterior ao início.');
  }

  if (type === 'percentage' && percentage <= 0) {
    throw new Error('Indique uma percentagem de desconto superior a 0.');
  }

  if (type === 'amount' && amount <= 0) {
    throw new Error('Indique um valor fixo de desconto superior a 0.');
  }

  const discountId = String(data.get('discountId') || '');
  const discount = state.pricing.discounts.find((candidate) => candidate.id === discountId) || {
    id: makeId('DISC', state.pricing.discounts),
    usedCount: 0
  };

  Object.assign(discount, {
    title: String(data.get('title') || '').trim(),
    code: String(data.get('code') || createDiscountCode()).trim().toUpperCase(),
    type,
    percentage,
    amount,
    maxUses: parseMaxUsesInputValue(data.get('maxUses')),
    startDate,
    endDate,
    appliesTo: String(data.get('appliesTo') || 'accommodation'),
    active: data.get('active') === 'on'
  });

  if (!discountId) state.pricing.discounts.push(discount);
  ui.editingDiscountId = '';
  addAudit(state, currentUser, discountId ? 'Desconto atualizado' : 'Desconto criado', 'pricing', discount.id);
  await persist(discountId ? 'Desconto atualizado.' : 'Desconto criado.');
}

async function handleExpenseSubmit(form) {
  requirePermission(currentUser, 'expenses:write');
  const data = new FormData(form);
  const expenseId = String(data.get('expenseId') || '');
  const existingExpense = state.expenses.find((expense) => expense.id === expenseId);
  const date = parseAdminDateInput(data.get('date'), 'Data da despesa');

  const expense = existingExpense || {
    id: makeId('EXP', state.expenses)
  };

  Object.assign(expense, {
    date,
    category: String(data.get('category') || 'outros'),
    description: String(data.get('description') || '').trim(),
    amount: Math.max(0, Number(data.get('amount') || 0)),
    notes: String(data.get('notes') || '').trim()
  });

  if (!existingExpense) state.expenses.unshift(expense);
  ui.editingExpenseId = '';
  addAudit(state, currentUser, existingExpense ? 'Despesa atualizada' : 'Despesa adicionada', 'expense', expense.id, {
    description: expense.description,
    category: EXPENSE_LABELS[expense.category] || expense.category,
    amount: expense.amount,
    date: formatCompactDate(expense.date)
  });
  await persist(existingExpense ? 'Despesa atualizada.' : 'Despesa adicionada.');
}

async function handleEmployeeRateSubmit(form) {
  requirePermission(currentUser, 'employees:manage');
  const data = new FormData(form);
  const employee = state.employees.find((candidate) => candidate.id === data.get('employeeId'));
  if (!employee) return;
  const from = parseAdminDateInput(data.get('from') || formatDateInputValue(formatDateKey(new Date())), 'Data da taxa');
  employee.hourlyRates.push({
    from,
    rate: Math.max(0, Number(data.get('rate') || 0))
  });
  employee.hourlyRates.sort((a, b) => a.from.localeCompare(b.from));
  addAudit(state, currentUser, 'Taxa horária atualizada', 'employee', employee.id);
  await persist(`Taxa de ${employee.name} atualizada.`);
}

async function handleEmployeeProfileSubmit(form) {
  requirePermission(currentUser, 'employees:manage');
  const data = new FormData(form);
  const employee = state.employees.find((candidate) => candidate.id === data.get('employeeId'));
  if (!employee) return;

  employee.compensationDefault = String(data.get('compensationDefault') || getEmployeeDefaultCompensation(employee));
  addAudit(state, currentUser, 'Modo habitual de trabalho atualizado', 'employee', employee.id);
  await persist(`Modo habitual de ${employee.name} atualizado.`);
}

async function handleEmployeeWorkSubmit(form) {
  requirePermission(currentUser, 'employees:manage');
  const data = new FormData(form);
  const employee = state.employees.find((candidate) => candidate.id === data.get('employeeId'));
  const workSessionId = String(data.get('workSessionId') || '');
  const date = parseAdminDateInput(data.get('date'), 'Data do trabalho');
  const start = String(data.get('start') || '');
  const end = String(data.get('end') || '');
  const startDateTime = `${date}T${start}:00`;
  const endDateTime = `${date}T${end}:00`;

  if (!employee) throw new Error('Funcionário não encontrado.');
  if (new Date(endDateTime) <= new Date(startDateTime)) throw new Error('A hora final deve ser depois da hora inicial.');

  const workDetails = getWorkFormDetails(data, employee);
  const payload = {
    employeeId: employee.id,
    date,
    start: startDateTime,
    end: endDateTime,
    rateSnapshot: workDetails.rateSnapshot,
    compensationType: workDetails.compensationType,
    tasks: workDetails.tasks,
    otherDetails: workDetails.otherDetails,
    notes: String(data.get('notes') || '').trim()
  };

  if (workSessionId) {
    const session = state.workSessions.find((candidate) => candidate.id === workSessionId);
    if (!session) throw new Error('Sessão de trabalho não encontrada.');
    Object.assign(session, payload);
    state.workSessions.sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')));
    ui.editingWorkSessionId = '';
    addAudit(state, currentUser, 'Sessão de trabalho atualizada', 'workSession', session.id);
    await persist(`Sessão de ${employee.name} atualizada.`);
    return;
  }

  const session = {
    id: makeId('WORK', state.workSessions),
    ...payload
  };
  state.workSessions.unshift(session);
  addAudit(state, currentUser, 'Horas de funcionário adicionadas/corrigidas', 'workSession', session.id);
  await persist(`Horas de ${employee.name} guardadas.`);
}

async function handleManualWorkSubmit(form) {
  requirePermission(currentUser, 'work:own');
  const employee = getEmployeeForUser(state, currentUser);
  const data = new FormData(form);
  const workSessionId = String(data.get('workSessionId') || '');
  const date = parseAdminDateInput(data.get('date'), 'Data do trabalho');
  const start = String(data.get('start') || '');
  const end = String(data.get('end') || '');
  const startDateTime = `${date}T${start}:00`;
  const endDateTime = `${date}T${end}:00`;

  if (!employee) throw new Error('Não existe funcionário ligado a este utilizador.');
  if (new Date(endDateTime) <= new Date(startDateTime)) throw new Error('A hora final deve ser depois da hora inicial.');

  const workDetails = getWorkFormDetails(data, employee);
  const payload = {
    employeeId: employee.id,
    date,
    start: startDateTime,
    end: endDateTime,
    rateSnapshot: workDetails.rateSnapshot,
    compensationType: workDetails.compensationType,
    tasks: workDetails.tasks,
    otherDetails: workDetails.otherDetails,
    notes: String(data.get('notes') || '').trim()
  };

  if (workSessionId) {
    const session = state.workSessions.find((candidate) => candidate.id === workSessionId && candidate.employeeId === employee.id);
    if (!session) throw new Error('Sessão de trabalho não encontrada.');
    Object.assign(session, payload);
    state.workSessions.sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')));
    ui.editingWorkSessionId = '';
    ui.showManualWorkForm = false;
    addAudit(state, currentUser, 'Sessão própria de trabalho atualizada', 'workSession', session.id);
    await persist('Horas atualizadas.');
    return;
  }

  state.workSessions.unshift({
    id: makeId('WORK', state.workSessions),
    ...payload
  });
  ui.editingWorkSessionId = '';
  ui.showManualWorkForm = false;
  addAudit(state, currentUser, 'Horas adicionadas manualmente', 'workSession', state.workSessions[0].id);
  await persist('Horas adicionadas.');
}

async function handleActiveWorkDetailsSubmit(form) {
  requirePermission(currentUser, 'work:own');
  const employee = getEmployeeForUser(state, currentUser);
  const data = new FormData(form);
  const session = state.workSessions.find((candidate) =>
    candidate.id === data.get('workSessionId') &&
    candidate.employeeId === employee?.id &&
    !candidate.end
  );

  if (!employee) throw new Error('Não existe funcionário ligado a este utilizador.');
  if (!session) throw new Error('Horário iniciado não encontrado.');

  const workDetails = getWorkFormDetails(data, employee);
  session.rateSnapshot = workDetails.rateSnapshot;
  session.compensationType = workDetails.compensationType;
  session.tasks = workDetails.tasks;
  session.otherDetails = workDetails.otherDetails;
  addAudit(state, currentUser, 'Tipo e tarefas do horário ativo atualizados', 'workSession', session.id);
  await persist('Tipo e tarefas atualizados.');
}

async function handleStartWork(form) {
  requirePermission(currentUser, 'work:own');
  const employee = getEmployeeForUser(state, currentUser);
  if (!employee) throw new Error('Não existe funcionário ligado a este utilizador.');

  if (state.workSessions.some((session) => session.employeeId === employee.id && !session.end)) {
    throw new Error('Já existe um horário iniciado.');
  }

  const now = new Date();
  const date = formatDateKey(now);
  const workDetails = getWorkFormDetails(new FormData(form), employee);
  state.workSessions.unshift({
    id: makeId('WORK', state.workSessions),
    employeeId: employee.id,
    date,
    start: now.toISOString(),
    end: null,
    rateSnapshot: workDetails.rateSnapshot,
    compensationType: workDetails.compensationType,
    tasks: workDetails.tasks,
    otherDetails: workDetails.otherDetails,
    notes: ''
  });
  ui.showManualWorkForm = false;
  addAudit(state, currentUser, 'Horário iniciado', 'workSession', state.workSessions[0].id);
  await persist('Horário iniciado.');
}

async function handleQuickStartWork() {
  requirePermission(currentUser, 'work:own');
  const employee = getEmployeeForUser(state, currentUser);
  if (!employee) throw new Error('Não existe funcionário ligado a este utilizador.');

  if (state.workSessions.some((session) => session.employeeId === employee.id && !session.end)) {
    throw new Error('Já existe um horário iniciado.');
  }

  const now = new Date();
  const date = formatDateKey(now);
  const compensationType = getEmployeeDefaultCompensation(employee);
  state.workSessions.unshift({
    id: makeId('WORK', state.workSessions),
    employeeId: employee.id,
    date,
    start: now.toISOString(),
    end: null,
    rateSnapshot: compensationType === 'paid' ? getHourlyRate(employee, date) : 0,
    compensationType,
    tasks: ['other'],
    otherDetails: 'Iniciado no painel',
    notes: ''
  });
  addAudit(state, currentUser, 'Horário iniciado no painel', 'workSession', state.workSessions[0].id);
  await persist('Horário iniciado.');
}

async function handleStopWork() {
  requirePermission(currentUser, 'work:own');
  const employee = getEmployeeForUser(state, currentUser);
  const session = state.workSessions.find((candidate) => candidate.employeeId === employee?.id && !candidate.end);
  if (!session) throw new Error('Não há horário iniciado.');

  session.end = new Date().toISOString();
  if (getWorkDurationHours(session) > 8 && !window.confirm('Este horário tem mais de 8 horas. Guardar mesmo assim?')) {
    session.end = null;
    return;
  }

  addAudit(state, currentUser, 'Horário terminado', 'workSession', session.id);
  await persist('Horário terminado.');
}

function syncReservationFiltersFromForm(form) {
  const data = new FormData(form);
  ui.reservationFilters.search = String(data.get('search') || '');
  ui.reservationFilters.status = String(data.get('status') || 'all');
  ui.reservationFilters.source = String(data.get('source') || 'all');
}

function updateReservationList() {
  const list = app.querySelector('[data-reservation-list]');
  if (!list) return;

  const filteredReservations = getFilteredReservations();
  list.innerHTML = filteredReservations.length
    ? filteredReservations.map(renderReservationSummary).join('')
    : '<p class="admin-empty">Nenhuma reserva corresponde aos filtros.</p>';
}

function handleReservationFilters(form) {
  syncReservationFiltersFromForm(form);
  renderApp();
}

function clearReservationFilters() {
  ui.reservationFilters.search = '';
  ui.reservationFilters.status = 'all';
  ui.reservationFilters.source = 'all';
  renderApp();
}

function syncAuditFiltersFromForm(form) {
  const data = new FormData(form);
  ui.auditFilters.search = String(data.get('search') || '');
  ui.auditFilters.entityType = String(data.get('entityType') || 'all');
  ui.auditFilters.actor = String(data.get('actor') || 'all');
}

function updateAuditList() {
  const list = app.querySelector('[data-audit-list]');
  if (!list) return;
  list.outerHTML = renderAuditList();
}

function clearAuditFilters() {
  ui.auditFilters.search = '';
  ui.auditFilters.entityType = 'all';
  ui.auditFilters.actor = 'all';
  renderApp();
}

function toggleAuditEntry(auditId) {
  if (ui.expandedAuditIds.has(auditId)) {
    ui.expandedAuditIds.delete(auditId);
  } else {
    ui.expandedAuditIds.add(auditId);
  }

  renderApp();
}

function toggleEmployeeDetails(employeeId) {
  if (!confirmDiscardUnsavedChanges()) return;

  if (ui.expandedEmployeeIds.has(employeeId)) {
    ui.expandedEmployeeIds.delete(employeeId);
    const editingSession = state.workSessions.find((session) => session.id === ui.editingWorkSessionId);
    if (editingSession?.employeeId === employeeId) ui.editingWorkSessionId = '';
  } else {
    ui.expandedEmployeeIds.add(employeeId);
  }

  renderApp();
}

function scrollToAdminEditor(selector) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function editWorkSession(sessionId) {
  const session = state.workSessions.find((candidate) => candidate.id === sessionId);
  if (!session) return;

  if (!confirmDiscardUnsavedChanges()) return;
  ui.expandedEmployeeIds.add(session.employeeId);
  ui.editingWorkSessionId = session.id;
  renderApp();
  scrollToAdminEditor(`[data-work-form-for="${session.employeeId}"]`);
}

function editOwnWorkSession(sessionId) {
  const employee = getEmployeeForUser(state, currentUser);
  const session = state.workSessions.find((candidate) => candidate.id === sessionId && candidate.employeeId === employee?.id);
  if (!session) return;

  if (!confirmDiscardUnsavedChanges()) return;
  ui.activeView = 'work';
  if (session.end) {
    ui.editingWorkSessionId = session.id;
    ui.showManualWorkForm = true;
    renderApp();
    scrollToAdminEditor('#own-work-editor');
    return;
  }

  ui.editingWorkSessionId = '';
  ui.showManualWorkForm = false;
  renderApp();
  scrollToAdminEditor('#active-work-editor');
}

function cancelWorkSessionEdit() {
  if (!confirmDiscardUnsavedChanges()) return;
  ui.editingWorkSessionId = '';
  renderApp();
}

function cancelOwnWorkSessionEdit() {
  if (!confirmDiscardUnsavedChanges()) return;
  ui.editingWorkSessionId = '';
  ui.showManualWorkForm = false;
  renderApp();
}

function openCreateReservation(requestId = '') {
  ui.requestDraftId = requestId;
  ui.editingReservationId = '';
  ui.showExtraGuestForm = false;
  ui.activeView = 'reservations';
  renderApp();
  scrollToAdminEditor('#create-reservation');
}

function manageReservation(reservationId) {
  ui.activeView = 'reservations';
  ui.editingReservationId = reservationId;
  ui.showExtraGuestForm = false;
  ui.requestDraftId = '';
  ui.reservationFilters.search = reservationId;
  ui.reservationFilters.status = 'all';
  ui.reservationFilters.source = 'all';
  ui.expandedReservationIds.add(reservationId);
  renderApp();
  scrollToAdminEditor('#create-reservation, #reservation-operations');
}

function cancelReservationEdit() {
  ui.editingReservationId = '';
  ui.showExtraGuestForm = false;
  ui.reservationFilters.search = '';
  renderApp();
}

function toggleReservationDetails(reservationId) {
  if (ui.expandedReservationIds.has(reservationId)) {
    ui.expandedReservationIds.delete(reservationId);
  } else {
    ui.expandedReservationIds.add(reservationId);
  }

  renderApp();
}

function togglePastReservations() {
  ui.showPastReservations = !ui.showPastReservations;
  renderApp();
}

function toggleManualWorkForm() {
  if (ui.showManualWorkForm && !confirmDiscardUnsavedChanges()) return;
  ui.editingWorkSessionId = '';
  ui.showManualWorkForm = !ui.showManualWorkForm;
  renderApp();
}

function toggleExtraGuestForm() {
  if (ui.showExtraGuestForm && !confirmDiscardUnsavedChanges()) return;
  ui.showExtraGuestForm = !ui.showExtraGuestForm;
  renderApp();
  if (ui.showExtraGuestForm) scrollToAdminEditor('#extra-guests-editor');
}

function openNativeDatePicker(button) {
  const control = button.closest('[data-date-control]');
  const textInput = control?.querySelector('[data-date-text]');
  const pickerInput = control?.querySelector('[data-date-picker]');
  if (!(pickerInput instanceof HTMLInputElement)) return;

  pickerInput.value = getDatePickerValueFromText(textInput?.value || '') || formatDateKey(new Date());

  if (typeof pickerInput.showPicker === 'function') {
    try {
      pickerInput.showPicker();
      return;
    } catch (error) {
      // Fall back to the older focus/click behavior below.
    }
  }

  pickerInput.focus();
  pickerInput.click();
}

function syncNativeDatePicker(pickerInput) {
  const control = pickerInput.closest('[data-date-control]');
  const textInput = control?.querySelector('[data-date-text]');
  if (!(textInput instanceof HTMLInputElement) || !pickerInput.value) return;

  textInput.value = formatDateInputValue(pickerInput.value);
  const form = pickerInput.closest('form[data-form]');
  if (form) markFormDirty(form);
}

async function handleRestoreRequest(requestId) {
  requirePermission(currentUser, 'requests:manage');
  const request = state.websiteRequests.find((candidate) => candidate.id === requestId);
  if (!request || request.status !== 'rejected') return;

  request.status = 'new';
  request.updatedAt = new Date().toISOString();
  addAudit(state, currentUser, 'Pedido do website restaurado', 'websiteRequest', request.id);
  await persist(`Pedido ${request.id} restaurado.`);
}

function handleMessageForRequest(requestId) {
  const request = state.websiteRequests.find((candidate) => candidate.id === requestId);
  if (!request) return;

  ui.messageDraft = createRequestMessageDraft(request, 'requestResponse');
  ui.selectedMessageReservationId = '';
  ui.activeView = 'messages';
  renderApp();
}

async function copyText(text) {
  if (!text) return;
  await navigator.clipboard.writeText(text);
  setNotice('Texto copiado.');
  renderApp();
}

function getMessageTextFromAction(target) {
  const panel = target?.closest?.('.admin-panel');
  const textarea = panel?.querySelector?.('.admin-message-output');
  if (textarea instanceof HTMLTextAreaElement) return textarea.value;
  return '';
}

async function removeSeason(seasonId) {
  requirePermission(currentUser, 'pricing:write');
  if (!window.confirm('Remover este preço sazonal?')) return;

  state.pricing.seasons = (state.pricing.seasons || []).filter((season) => season.id !== seasonId);
  if (ui.editingSeasonId === seasonId) ui.editingSeasonId = '';
  addAudit(state, currentUser, 'Preço sazonal removido', 'pricing', seasonId);
  await persist('Época removida.');
}

function editSeason(seasonId) {
  ui.editingSeasonId = seasonId;
  renderApp();
  scrollToAdminEditor('form[data-form="season"]');
}

function cancelSeasonEdit() {
  ui.editingSeasonId = '';
  renderApp();
}

async function removeGuestAdjustment(reservationId, adjustmentId) {
  requirePermission(currentUser, 'reservations:write');
  const reservation = state.reservations.find((candidate) => candidate.id === reservationId);
  if (!reservation || !adjustmentId) return;
  if (!window.confirm('Remover este hóspede extra da reserva?')) return;

  reservation.guestAdjustments = getGuestAdjustments(reservation).filter((adjustment) => adjustment.id !== adjustmentId);
  reservation.updatedAt = new Date().toISOString();
  addAudit(state, currentUser, 'Hóspede extra removido', 'reservation', reservation.id, {
    adjustmentId
  });
  await persist(`Hóspede extra removido de ${reservation.id}.`);
}

async function removeDiscount(discountId) {
  requirePermission(currentUser, 'pricing:write');
  if (!window.confirm('Remover este desconto?')) return;

  state.pricing.discounts = state.pricing.discounts.filter((discount) => discount.id !== discountId);
  if (ui.editingDiscountId === discountId) ui.editingDiscountId = '';
  addAudit(state, currentUser, 'Desconto removido', 'pricing', discountId);
  await persist('Desconto removido.');
}

async function removeGroupDiscount(discountId) {
  requirePermission(currentUser, 'pricing:write');
  if (!window.confirm('Remover esta redução por grupo?')) return;

  state.pricing.groupDiscounts = (state.pricing.groupDiscounts || []).filter((discount) => discount.id !== discountId);
  addAudit(state, currentUser, 'Redução por grupo removida', 'pricing', discountId);
  await persist('Redução por grupo removida.');
}

function editDiscount(discountId) {
  ui.editingDiscountId = discountId;
  renderApp();
  scrollToAdminEditor('form[data-form="discount"]');
}

function cancelDiscountEdit() {
  ui.editingDiscountId = '';
  renderApp();
}

function editExpense(expenseId) {
  ui.editingExpenseId = expenseId;
  renderApp();
  scrollToAdminEditor('form[data-form="expense"]');
}

function cancelExpenseEdit() {
  ui.editingExpenseId = '';
  renderApp();
}

async function removeExpense(expenseId) {
  requirePermission(currentUser, 'expenses:write');
  if (!window.confirm('Remover esta despesa?')) return;

  const expense = state.expenses.find((candidate) => candidate.id === expenseId);
  state.expenses = state.expenses.filter((candidate) => candidate.id !== expenseId);
  if (ui.editingExpenseId === expenseId) ui.editingExpenseId = '';
  addAudit(state, currentUser, 'Despesa removida', 'expense', expenseId, {
    description: expense?.description || '',
    amount: expense?.amount || 0
  });
  await persist('Despesa removida.');
}

async function removeOwnWorkSession(sessionId) {
  requirePermission(currentUser, 'work:own');
  const employee = getEmployeeForUser(state, currentUser);
  const session = state.workSessions.find((candidate) => candidate.id === sessionId && candidate.employeeId === employee?.id);
  if (!session) return;
  if (!session.end) throw new Error('Termine o horário antes de o remover.');
  if (!window.confirm('Remover esta sessão do seu histórico?')) return;

  state.workSessions = state.workSessions.filter((candidate) => candidate.id !== sessionId);
  if (ui.editingWorkSessionId === sessionId) {
    ui.editingWorkSessionId = '';
    ui.showManualWorkForm = false;
  }
  addAudit(state, currentUser, 'Sessão própria de trabalho removida', 'workSession', sessionId, {
    date: formatCompactDate(session.date),
    duration: `${getWorkDurationHours(session).toFixed(1)} h`,
    tasks: renderSessionTasks(session)
  });
  await persist('Sessão de trabalho removida.');
}

function fillDiscountCode() {
  const input = app.querySelector('form[data-form="discount"] input[name="code"]');
  if (input instanceof HTMLInputElement) {
    input.value = createDiscountCode();
    input.focus();
    const form = input.closest('form[data-form]');
    if (form) markFormDirty(form);
  }
}

function handleMessageSubmit(form) {
  const data = new FormData(form);
  ui.selectedMessageReservationId = String(data.get('reservationId') || '');
  ui.selectedMessageTemplate = resolveMessageTemplateId(String(data.get('template') || ''));
  ui.selectedMessageLanguage = String(data.get('language') || ui.selectedMessageLanguage || 'pt');
  ui.messageDraft = null;
  renderApp();
}

function handleReportFilters(form) {
  const data = new FormData(form);
  const period = String(data.get('period') || 'all');
  ui.reportFilters.period = period;
  ui.reportFilters.startDate = '';
  ui.reportFilters.endDate = '';

  if (period === 'custom') {
    ui.reportFilters.startDate = parseAdminDateInput(data.get('startDate'), 'Início personalizado');
    ui.reportFilters.endDate = parseAdminDateInput(data.get('endDate'), 'Fim personalizado');
    if (parseDateKey(ui.reportFilters.endDate) < parseDateKey(ui.reportFilters.startDate)) {
      throw new Error('O fim personalizado deve ser depois do início.');
    }
  }

  renderApp();
}

async function copyMessage(target = null) {
  const editedMessage = getMessageTextFromAction(target);
  if (editedMessage) {
    await copyText(editedMessage);
    return;
  }

  if (ui.messageDraft) {
    await copyText(ui.messageDraft.text);
    return;
  }

  const reservation = state.reservations.find((candidate) => candidate.id === (ui.selectedMessageReservationId || state.reservations[0]?.id));
  if (!reservation || ui.selectedMessageReservationId === 'standalone') {
    await copyText(generateStandaloneMessage(state, ui.selectedMessageLanguage, getSelectedMessageTemplateId(), messageCatalog));
    return;
  }
  const message = generateGuestMessage(reservation, state, getSelectedMessageTemplateId(), messageCatalog);
  await copyText(message);
}

function sendMessageEmail(target) {
  const email = String(target.dataset.email || '').trim();
  if (!email) return;
  const subject = String(target.dataset.subject || 'O Refúgio').trim();
  const message = getMessageTextFromAction(target);
  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

function sendMessageWhatsapp(target) {
  const phone = String(target.dataset.phone || '').replace(/\D/g, '');
  if (!phone) return;
  const message = getMessageTextFromAction(target);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function exportData() {
  requirePermission(currentUser, 'data:export');
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `refugio-admin-${formatDateKey(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvEscape).join(';')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportReport(type) {
  requirePermission(currentUser, 'reports:view');
  const report = buildReportData();
  const suffix = `${formatDateKey(new Date())}.csv`;

  if (type === 'reservations') {
    downloadCsv(`refugio-reservas-${suffix}`, [
      ['ID', 'Hóspede', 'Origem', 'Estado', 'Check-in', 'Check-out', 'Noites', 'Hóspedes', 'Receita'],
      ...report.countedReservations.map((reservation) => {
        const totals = calculateReservationTotals(reservation, state);
        return [
          reservation.id,
          reservation.contact.name,
          SOURCE_LABELS[reservation.source] || reservation.source,
          STATUS_LABELS[reservation.status] || reservation.status,
          formatCompactDate(reservation.stay.checkIn),
          formatCompactDate(reservation.stay.checkOut),
          totals.nights,
          getGuestCount(reservation),
          totals.total
        ];
      })
    ]);
    return;
  }

  if (type === 'expenses') {
    downloadCsv(`refugio-despesas-${suffix}`, [
      ['Data', 'Categoria', 'Descrição', 'Notas', 'Valor'],
      ...report.expensesRaw.map((expense) => [
        formatCompactDate(expense.date),
        EXPENSE_LABELS[expense.category] || expense.category,
        expense.description,
        expense.notes || '',
        expense.amount
      ])
    ]);
    return;
  }

  if (type === 'work') {
    downloadCsv(`refugio-horas-${suffix}`, [
      ['Data', 'Pessoa', 'Início', 'Fim', 'Horas', 'Tipo', 'Tarefas', 'Custo'],
      ...report.workSessions.map((session) => {
        const employee = state.employees.find((candidate) => candidate.id === session.employeeId);
        return [
          formatCompactDate(session.date),
          employee?.name || session.employeeId,
          formatDateTime(session.start),
          session.end ? formatDateTime(session.end) : 'Em curso',
          getWorkDurationHours(session),
          COMPENSATION_LABELS[session.compensationType || 'paid'] || session.compensationType,
          renderSessionTasks(session),
          getWorkSessionCost(session)
        ];
      })
    ]);
    return;
  }

  downloadCsv(`refugio-resumo-${suffix}`, [
    ['Métrica', 'Valor'],
    ['Período', report.range.label],
    ['Reservas', report.reservations.count],
    ['Noites', report.reservations.nights],
    ['Receita total', report.revenue.total],
    ['Receita alojamento', report.revenue.accommodation],
    ['Receita serviços', report.revenue.services],
    ['Despesas', report.expenses.total],
    ['Custos de trabalho', report.expenses.employeeCosts],
    ['Resultado estimado', report.performance.profit]
  ]);
}

async function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  ui.notice = '';
  const action = target.dataset.action;

  try {
    if (action === 'set-view') {
      const nextView = target.dataset.view || 'dashboard';
      if (nextView !== ui.activeView && !confirmDiscardUnsavedChanges()) return;
      ui.activeView = nextView;
      renderApp();
      return;
    }

    if (action === 'open-create-reservation') {
      if (!confirmDiscardUnsavedChanges()) return;
      openCreateReservation();
      return;
    }

    if (action === 'clear-reservation-filters') {
      clearReservationFilters();
      return;
    }

    if (action === 'clear-audit-filters') {
      clearAuditFilters();
      return;
    }

    if (action === 'open-date-picker') {
      openNativeDatePicker(target);
      return;
    }

    if (action === 'toggle-audit') {
      toggleAuditEntry(target.dataset.auditId || '');
      return;
    }

    if (action === 'toggle-employee-details') {
      toggleEmployeeDetails(target.dataset.employeeId || '');
      return;
    }

    if (action === 'edit-work-session') {
      editWorkSession(target.dataset.workSessionId || '');
      return;
    }

    if (action === 'edit-own-work-session') {
      editOwnWorkSession(target.dataset.workSessionId || '');
      return;
    }

    if (action === 'cancel-work-session-edit') {
      cancelWorkSessionEdit();
      return;
    }

    if (action === 'cancel-own-work-session-edit') {
      cancelOwnWorkSessionEdit();
      return;
    }

    if (action === 'toggle-reservation-details') {
      toggleReservationDetails(target.dataset.reservationId || '');
      return;
    }

    if (action === 'toggle-past-reservations') {
      togglePastReservations();
      return;
    }

    if (action === 'toggle-manual-work-form') {
      toggleManualWorkForm();
      return;
    }

    if (action === 'toggle-extra-guest-form') {
      toggleExtraGuestForm();
      return;
    }

    if (action === 'manage-reservation') {
      if (!confirmDiscardUnsavedChanges()) return;
      manageReservation(target.dataset.reservationId || '');
      return;
    }

    if (action === 'cancel-reservation-edit') {
      if (!confirmDiscardUnsavedChanges()) return;
      cancelReservationEdit();
      return;
    }

    if (action === 'copy-text') {
      await copyText(target.dataset.copyText || '');
      return;
    }

    if (action === 'edit-season') {
      if (!confirmDiscardUnsavedChanges()) return;
      editSeason(target.dataset.seasonId || '');
      return;
    }

    if (action === 'cancel-season-edit') {
      if (!confirmDiscardUnsavedChanges()) return;
      cancelSeasonEdit();
      return;
    }

    if (action === 'edit-discount') {
      if (!confirmDiscardUnsavedChanges()) return;
      editDiscount(target.dataset.discountId || '');
      return;
    }

    if (action === 'cancel-discount-edit') {
      if (!confirmDiscardUnsavedChanges()) return;
      cancelDiscountEdit();
      return;
    }

    if (action === 'edit-expense') {
      if (!confirmDiscardUnsavedChanges()) return;
      editExpense(target.dataset.expenseId || '');
      return;
    }

    if (action === 'cancel-expense-edit') {
      if (!confirmDiscardUnsavedChanges()) return;
      cancelExpenseEdit();
      return;
    }

    if (action === 'generate-discount-code') {
      fillDiscountCode();
      return;
    }

    if (action === 'logout') {
      if (!confirmDiscardUnsavedChanges()) return;
      logout();
      await loadSessionAndState();
      return;
    }

    if (action === 'calendar-prev') {
      ui.calendarMonth.setMonth(ui.calendarMonth.getMonth() - 1);
      renderApp();
      return;
    }

    if (action === 'calendar-next') {
      ui.calendarMonth.setMonth(ui.calendarMonth.getMonth() + 1);
      renderApp();
      return;
    }

    if (action === 'calendar-today') {
      const today = new Date();
      ui.selectedDate = formatDateKey(today);
      ui.calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      renderApp();
      return;
    }

    if (action === 'select-date') {
      ui.selectedDate = target.dataset.date || ui.selectedDate;
      renderApp();
      return;
    }

    if (action === 'accept-request') await handleAcceptRequest(target.dataset.requestId);
    if (action === 'reject-request') await handleRejectRequest(target.dataset.requestId);
    if (action === 'restore-request') await handleRestoreRequest(target.dataset.requestId);
    if (action === 'message-for-request') handleMessageForRequest(target.dataset.requestId);
    if (action === 'mark-paid') await handleMarkPaid(target.dataset.reservationId);
    if (action === 'cancel-reservation') await handleCancelReservation(target.dataset.reservationId);
    if (action === 'restore-reservation') await handleRestoreReservation(target.dataset.reservationId);
    if (action === 'message-for-reservation') {
      ui.selectedMessageReservationId = target.dataset.reservationId || '';
      ui.selectedMessageTemplate = resolveMessageTemplateId(target.dataset.template || ui.selectedMessageTemplate);
      ui.messageDraft = null;
      ui.activeView = 'messages';
      renderApp();
    }
    if (action === 'quick-start-work') await handleQuickStartWork();
    if (action === 'stop-work') await handleStopWork();
    if (action === 'copy-message') await copyMessage(target);
    if (action === 'copy-draft-message') await copyMessage(target);
    if (action === 'send-message-email') sendMessageEmail(target);
    if (action === 'send-message-whatsapp') sendMessageWhatsapp(target);
    if (action === 'remove-season') await removeSeason(target.dataset.seasonId);
    if (action === 'remove-guest-adjustment') await removeGuestAdjustment(target.dataset.reservationId, target.dataset.adjustmentId);
    if (action === 'remove-discount') await removeDiscount(target.dataset.discountId);
    if (action === 'remove-expense') await removeExpense(target.dataset.expenseId);
    if (action === 'remove-own-work-session') await removeOwnWorkSession(target.dataset.workSessionId);
    if (action === 'remove-group-discount') await removeGroupDiscount(target.dataset.groupDiscountId);
    if (action === 'export-data') exportData();
    if (action === 'export-report') exportReport(target.dataset.report || 'summary');
    if (action === 'reset-demo' && confirmDiscardUnsavedChanges() && window.confirm('Repor todos os dados de demonstração?')) {
      state = await repository.reset();
      addAudit(state, currentUser, 'Dados de demonstração repostos', 'system', 'reset');
      await persist('Dados de demonstração repostos.');
    }
  } catch (error) {
    setNotice(error.message || 'Não foi possível concluir a ação.', 'danger');
    renderApp();
  }
}

async function handleSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  ui.notice = '';

  try {
    const formType = form.dataset.form;
    if (formType === 'login') return handleLoginSubmit(form);
    if (formType === 'create-reservation') await handleCreateReservation(form);
    if (formType === 'reservation-operations') await handleReservationOperationsSubmit(form);
    if (formType === 'reservation-filters') handleReservationFilters(form);
    if (formType === 'pricing') await handlePricingSubmit(form);
    if (formType === 'service-pricing') await handleServicePricingSubmit(form);
    if (formType === 'season') await handleSeasonSubmit(form);
    if (formType === 'group-discount') await handleGroupDiscountSubmit(form);
    if (formType === 'discount') await handleDiscountSubmit(form);
    if (formType === 'expense') await handleExpenseSubmit(form);
    if (formType === 'employee-profile') await handleEmployeeProfileSubmit(form);
    if (formType === 'employee-rate') await handleEmployeeRateSubmit(form);
    if (formType === 'employee-work') await handleEmployeeWorkSubmit(form);
    if (formType === 'work-active-details') await handleActiveWorkDetailsSubmit(form);
    if (formType === 'work-start') await handleStartWork(form);
    if (formType === 'work-manual') await handleManualWorkSubmit(form);
    if (formType === 'message') handleMessageSubmit(form);
    if (formType === 'report-filters') handleReportFilters(form);
    clearUnsavedChanges();
  } catch (error) {
    setNotice(error.message || 'Não foi possível guardar.', 'danger');
    renderApp();
  }
}

function handleChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

  if (target instanceof HTMLInputElement && target.matches('[data-date-picker]')) {
    syncNativeDatePicker(target);
    return;
  }

  if (target instanceof HTMLInputElement && target.matches('[data-max-uses-input]')) {
    try {
      target.setCustomValidity('');
      normalizeMaxUsesInput(target);
    } catch (error) {
      target.setCustomValidity(error.message);
      target.reportValidity();
      return;
    }
  }

  const filterForm = target.closest('form[data-form="reservation-filters"]');
  if (filterForm) {
    syncReservationFiltersFromForm(filterForm);
    updateReservationList();
    return;
  }

  const auditFilterForm = target.closest('form[data-form="audit-filters"]');
  if (auditFilterForm) {
    syncAuditFiltersFromForm(auditFilterForm);
    updateAuditList();
    return;
  }

  const typedDiscountForm = target.closest('form[data-form="create-reservation"], form[data-form="discount"]');
  if (typedDiscountForm && (target.name === 'discountType' || target.name === 'type')) {
    updateTypedDiscountField(typedDiscountForm);
  }

  const changedForm = target.closest('form[data-form]');
  if (changedForm) markFormDirty(changedForm);

  if (!(target instanceof HTMLSelectElement)) return;
  if (target.name !== 'username' || !target.closest('form[data-form="login"]')) return;

  rememberLoginUsername(target.value);
}

function handleInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;

  const filterForm = target.closest('form[data-form="reservation-filters"]');
  if (filterForm) {
    syncReservationFiltersFromForm(filterForm);
    updateReservationList();
    return;
  }

  const auditFilterForm = target.closest('form[data-form="audit-filters"]');
  if (auditFilterForm) {
    syncAuditFiltersFromForm(auditFilterForm);
    updateAuditList();
    return;
  }

  const changedForm = target.closest('form[data-form]');
  if (changedForm) markFormDirty(changedForm);
}

app.addEventListener('click', handleClick);
app.addEventListener('submit', handleSubmit);
app.addEventListener('change', handleChange);
app.addEventListener('input', handleInput);
window.addEventListener('beforeunload', (event) => {
  if (!ui.hasUnsavedChanges) return;
  event.preventDefault();
  event.returnValue = '';
});

loadSessionAndState();
