import { addDays, diffCalendarDays, formatDateKey, monthDayOrdinal, parseDateKey } from '../utils/date.js';

const ADMIN_STORAGE_KEY = 'refugio-admin-prototype-state-v1';

function toPrice(value, fallback = 0) {
  const price = Number(value);
  return Number.isFinite(price) && value !== '' && value !== null ? price : fallback;
}

function getBasePrices(pricing = {}) {
  return {
    adultNight: toPrice(pricing.adultNight ?? pricing.adultPerNight),
    childNight: toPrice(pricing.childNight ?? pricing.childPerNight)
  };
}

export function pricingRuleTouchesDate(rule, dateKey) {
  if (!dateKey || rule?.active === false) return false;

  if (rule?.kind === 'recurring') {
    const date = parseDateKey(dateKey);
    if (!date || Number.isNaN(date.getTime())) return false;

    const current = monthDayOrdinal(
      `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );
    const start = monthDayOrdinal(rule.startMonthDay);
    const end = monthDayOrdinal(rule.endMonthDay);
    if (!start || !end) return false;

    return start <= end
      ? current >= start && current <= end
      : current >= start || current <= end;
  }

  return Boolean(rule?.startDate && rule?.endDate && rule.startDate <= dateKey && rule.endDate >= dateKey);
}

function getPricingRulesForDate(pricing, dateKey) {
  const rules = Array.isArray(pricing?.seasons) ? pricing.seasons : [];
  return {
    datedRule: rules.find((rule) => (rule.kind || 'dated') === 'dated' && pricingRuleTouchesDate(rule, dateKey)) || null,
    recurringRule: rules.find((rule) => rule.kind === 'recurring' && pricingRuleTouchesDate(rule, dateKey)) || null
  };
}

function pricesFromRule(rule, fallback) {
  return {
    adultNight: toPrice(rule?.adultNight, fallback.adultNight),
    childNight: toPrice(rule?.childNight, fallback.childNight)
  };
}

export function getBaselinePricesForDate(pricing, dateKey = '') {
  const basePrices = getBasePrices(pricing);
  if (!dateKey) return basePrices;
  const { recurringRule } = getPricingRulesForDate(pricing, dateKey);
  return pricesFromRule(recurringRule, basePrices);
}

export function getEffectivePricesForDate(pricing, dateKey = '') {
  const baseline = getBaselinePricesForDate(pricing, dateKey);
  if (!dateKey) return baseline;
  const { datedRule } = getPricingRulesForDate(pricing, dateKey);
  return pricesFromRule(datedRule, baseline);
}

export function getLimitedTimePriceComparison(pricing, dateKey = '') {
  const baseline = getBaselinePricesForDate(pricing, dateKey);
  const { datedRule } = getPricingRulesForDate(pricing, dateKey);
  const effective = pricesFromRule(datedRule, baseline);

  return {
    dateKey,
    datedRule,
    baseline,
    effective,
    adultDiscounted: Boolean(datedRule && effective.adultNight < baseline.adultNight),
    childDiscounted: Boolean(datedRule && effective.childNight < baseline.childNight)
  };
}

function promotionIdentity(rule) {
  return rule?.id || `${rule?.startDate || ''}:${rule?.endDate || ''}`;
}

function comparisonDiscountPercent(comparison) {
  const percentages = [];
  if (comparison.adultDiscounted && comparison.baseline.adultNight > 0) {
    percentages.push((comparison.baseline.adultNight - comparison.effective.adultNight) / comparison.baseline.adultNight);
  }
  if (comparison.childDiscounted && comparison.baseline.childNight > 0) {
    percentages.push((comparison.baseline.childNight - comparison.effective.childNight) / comparison.baseline.childNight);
  }
  return Math.round(Math.max(0, ...percentages) * 100);
}

export function findRelevantLimitedTimePromotion(
  pricing,
  { fromDateKey = formatDateKey(new Date()), lookAheadDays = 84 } = {}
) {
  const fromDate = parseDateKey(fromDateKey);
  if (!fromDate || Number.isNaN(fromDate.getTime())) return null;

  let promotion = null;

  for (let offset = 0; offset <= lookAheadDays + 366; offset += 1) {
    if (!promotion && offset > lookAheadDays) break;
    const dateKey = formatDateKey(addDays(fromDate, offset));
    const comparison = getLimitedTimePriceComparison(pricing, dateKey);
    const isDiscounted = comparison.adultDiscounted || comparison.childDiscounted;

    if (!promotion && !isDiscounted) continue;
    if (promotion && (!isDiscounted || promotionIdentity(comparison.datedRule) !== promotion.ruleId)) break;

    if (!promotion) {
      promotion = {
        ruleId: promotionIdentity(comparison.datedRule),
        rule: comparison.datedRule,
        startDate: dateKey,
        endDate: dateKey,
        daysUntil: offset,
        discountPercent: comparisonDiscountPercent(comparison)
      };
      continue;
    }

    promotion.endDate = dateKey;
    promotion.discountPercent = Math.max(promotion.discountPercent, comparisonDiscountPercent(comparison));
  }

  if (!promotion) return null;
  promotion.active = promotion.daysUntil === 0;
  promotion.daysUntil = diffCalendarDays(fromDateKey, promotion.startDate);
  return promotion;
}

export async function getPrototypePricing() {
  try {
    const state = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || 'null');
    if (state?.pricing) return state.pricing;
  } catch (error) {
    console.warn('Could not read prototype pricing from local storage.', error);
  }

  try {
    const { createInitialAdminState } = await import('../admin/admin-seed.js');
    return createInitialAdminState().pricing;
  } catch (error) {
    console.warn('Could not load prototype pricing defaults.', error);
    return null;
  }
}
