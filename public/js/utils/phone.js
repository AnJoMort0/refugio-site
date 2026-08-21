export function isValidPhoneNumber(value) {
  const trimmedValue = String(value || '').trim();
  const digitsOnly = trimmedValue.replace(/\D/g, '');
  const hasInternationalPrefix = /^(?:\+|00)[0-9][0-9\s()\-]{5,}$/.test(trimmedValue);
  const hasPortugueseLocalFormat = /^(?:2|9)\d{8}$/.test(digitsOnly);

  return hasInternationalPrefix || hasPortugueseLocalFormat;
}
