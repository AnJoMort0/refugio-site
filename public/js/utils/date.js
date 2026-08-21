export function parseDateKey(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateKey(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function diffCalendarDays(startDateKey, endDateKey) {
  if (!startDateKey || !endDateKey) return 0;
  return Math.round((parseDateKey(endDateKey) - parseDateKey(startDateKey)) / 86400000);
}

export function monthDayOrdinal(monthDay) {
  const [month, day] = String(monthDay || '').split('-').map(Number);
  const date = new Date(2028, month - 1, day);
  const start = new Date(2028, 0, 1);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.round((date - start) / 86400000) + 1;
}
