// ISO 3166-1 alpha-2 snapshot; browsers localize the labels through Intl.DisplayNames.
const COUNTRY_CODES = `
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ
VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW
`.trim().split(/\s+/);

const optionCache = new Map();

function normalizeLookupValue(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase();
}

function getDisplayNames(locale = 'pt-PT') {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' });
  } catch {
    return null;
  }
}

export function getCountryOptions(locale = 'pt-PT') {
  const cacheKey = String(locale || 'pt-PT');
  if (optionCache.has(cacheKey)) return optionCache.get(cacheKey);

  const displayNames = getDisplayNames(cacheKey);
  const options = COUNTRY_CODES.map((code) => ({
    code,
    name: displayNames?.of(code) || code
  })).sort((left, right) => left.name.localeCompare(right.name, cacheKey, { sensitivity: 'base' }));

  optionCache.set(cacheKey, options);
  return options;
}

export function resolveCountryCode(value = '', locale = 'pt-PT') {
  const normalizedValue = normalizeLookupValue(value);
  if (!normalizedValue) return '';

  const uppercaseValue = String(value).trim().toUpperCase();
  if (COUNTRY_CODES.includes(uppercaseValue)) return uppercaseValue;

  const locales = [...new Set([locale, 'pt-PT', 'en', 'fr', 'es'])];
  for (const candidateLocale of locales) {
    const match = getCountryOptions(candidateLocale)
      .find((country) => normalizeLookupValue(country.name) === normalizedValue);
    if (match) return match.code;
  }

  return '';
}

export function getCountryName(code = '', locale = 'pt-PT') {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!COUNTRY_CODES.includes(normalizedCode)) return '';
  return getDisplayNames(locale)?.of(normalizedCode) || normalizedCode;
}

export function renderCountrySelect(select, locale = 'pt-PT', options = {}) {
  if (!(select instanceof HTMLSelectElement)) return;
  const selectedCode = resolveCountryCode(options.selectedCode || select.value, locale);
  const fragment = document.createDocumentFragment();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = options.placeholder || '';
  placeholder.disabled = true;
  placeholder.hidden = true;
  placeholder.selected = !selectedCode;
  fragment.append(placeholder);

  getCountryOptions(locale).forEach(({ code, name }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    option.selected = code === selectedCode;
    fragment.append(option);
  });

  select.replaceChildren(fragment);
}

export function normalizeAddress(address = {}, legacyCountry = '') {
  const countryCode = resolveCountryCode(address.countryCode || address.country || legacyCountry);
  return {
    street: String(address.street || '').trim(),
    postalCode: String(address.postalCode || '').trim(),
    city: String(address.city || '').trim(),
    countryCode
  };
}

export function isCompleteAddress(address = {}) {
  const normalized = normalizeAddress(address);
  return Boolean(normalized.street && normalized.postalCode && normalized.city && normalized.countryCode);
}

export function formatAddress(address = {}, locale = 'pt-PT') {
  const normalized = normalizeAddress(address);
  if (!normalized.street && !normalized.postalCode && !normalized.city && !normalized.countryCode) return '';

  const locality = [normalized.postalCode, normalized.city].filter(Boolean).join(' ');
  const country = getCountryName(normalized.countryCode, locale) || normalized.countryCode;
  return [normalized.street, locality, country].filter(Boolean).join(', ');
}
