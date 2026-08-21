import { getCurrentDictionary, getNestedValue } from '../services/i18n.js';
import { findRelevantLimitedTimePromotion, getPrototypePricing } from '../services/pricing-promotions.js';
import { parseDateKey } from '../utils/date.js';

function interpolate(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template || ''
  );
}

function formatPromotionDate(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(document.documentElement.lang || 'pt-PT', {
    day: 'numeric',
    month: 'long'
  }).format(date);
}

function getAnnouncementTemplate(dictionary, promotion) {
  if (promotion.active) return getNestedValue(dictionary, 'home.promotion.active');
  if (promotion.daysUntil === 1) return getNestedValue(dictionary, 'home.promotion.startsTomorrow');
  if (promotion.daysUntil < 14) return getNestedValue(dictionary, 'home.promotion.startsInDays');
  return getNestedValue(dictionary, 'home.promotion.startsInWeeks');
}

function renderPromotion(promotion, dictionary) {
  document.querySelectorAll('[data-promotion-sale-badge]').forEach((badge) => {
    badge.hidden = !promotion;
  });

  document.querySelectorAll('[data-promotion-announcement]').forEach((announcement) => {
    announcement.hidden = !promotion;
    if (!promotion) return;

    const message = announcement.querySelector('[data-promotion-message]');
    if (!message) return;

    message.textContent = interpolate(getAnnouncementTemplate(dictionary, promotion), {
      count: promotion.daysUntil,
      weeks: Math.ceil(promotion.daysUntil / 7),
      startDate: formatPromotionDate(promotion.startDate),
      endDate: formatPromotionDate(promotion.endDate),
      discount: promotion.discountPercent
    });
  });
}

export async function initPricingPromotionUi() {
  const pricing = await getPrototypePricing();
  const promotion = pricing ? findRelevantLimitedTimePromotion(pricing) : null;
  renderPromotion(promotion, getCurrentDictionary());

  document.addEventListener('language:changed', (event) => {
    renderPromotion(promotion, event.detail?.dictionary || getCurrentDictionary());
  });
}
