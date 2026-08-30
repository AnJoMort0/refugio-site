function toWholeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

export function normalizeGiftReward(value = {}) {
  return {
    guests: toWholeNumber(value.guests ?? (toWholeNumber(value.adultGuests) + toWholeNumber(value.childGuests))),
    nights: toWholeNumber(value.nights ?? Math.max(toWholeNumber(value.adultNights), toWholeNumber(value.childNights))),
    bikes: toWholeNumber(value.bikes),
    bikeDays: toWholeNumber(value.bikeDays)
  };
}

export function hasGiftReward(value = {}) {
  const reward = normalizeGiftReward(value);
  return Boolean(
    (reward.guests && reward.nights) ||
    (reward.bikes && reward.bikeDays)
  );
}

export function getIncompleteGiftRewardParts(value = {}) {
  const reward = normalizeGiftReward(value);
  return [
    ['accommodation', reward.guests, reward.nights],
    ['bikes', reward.bikes, reward.bikeDays]
  ]
    .filter(([, quantity, duration]) => Boolean(quantity) !== Boolean(duration))
    .map(([part]) => part);
}

function sumLowestRates(rates, count) {
  return [...rates]
    .map(Number)
    .filter((rate) => Number.isFinite(rate) && rate >= 0)
    .sort((a, b) => a - b)
    .slice(0, Math.max(0, count))
    .reduce((total, rate) => total + rate, 0);
}

function getNightGiftValue(guestRates, guestCount) {
  return [...guestRates]
    .map(Number)
    .filter((rate) => Number.isFinite(rate) && rate >= 0)
    .sort((a, b) => b - a)
    .slice(0, Math.max(0, guestCount))
    .reduce((total, rate) => total + rate, 0);
}

export function calculateGiftRewardDiscount(value, context = {}) {
  const reward = normalizeGiftReward(value);
  const bikeCount = toWholeNumber(context.bikeCount);
  const bikeRentalDays = toWholeNumber(context.bikeRentalDays);
  const nightGuestRates = Array.isArray(context.nightGuestRates) ? context.nightGuestRates : [];
  const availableGuests = nightGuestRates.reduce(
    (maximum, guestRates) => Math.max(maximum, Array.isArray(guestRates) ? guestRates.length : 0),
    0
  );

  const applied = {
    guests: Math.min(reward.guests, availableGuests),
    nights: Math.min(reward.nights, nightGuestRates.length),
    bikes: Math.min(reward.bikes, bikeCount),
    bikeDays: Math.min(reward.bikeDays, bikeRentalDays)
  };

  const accommodationAmount = sumLowestRates(
    nightGuestRates.map((guestRates) => getNightGiftValue(guestRates, applied.guests)),
    applied.nights
  );
  const bikeAmount = applied.bikes * applied.bikeDays * Math.max(0, Number(context.bikeDayPrice || 0));

  return {
    reward,
    applied,
    accommodationAmount,
    bikeAmount,
    amount: accommodationAmount + bikeAmount
  };
}
