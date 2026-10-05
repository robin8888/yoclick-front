import {
  formatBookingDayAndTime,
  formatServiceDuration,
  formatServicePrice,
} from './booking-labels';

describe('formatBookingDayAndTime', () => {
  it.each([
    ['2026-10-08T16:00:00.000Z', 'Europe/Madrid', 'jue 8 oct · 18:00'],
    ['2026-12-01T08:30:00.000Z', 'Europe/Madrid', 'mar 1 dic · 09:30'],
    ['2026-10-08T22:30:00.000Z', 'Europe/Madrid', 'vie 9 oct · 00:30'],
  ])('shows %s in %s as %s', (startsAtIso, timeZone, expectedText) => {
    expect(formatBookingDayAndTime(startsAtIso, timeZone)).toBe(expectedText);
  });
});

describe('formatServiceDuration', () => {
  it.each([
    [30, '30 min'],
    [45, '45 min'],
    [60, '1 h'],
    [90, '1 h 30 min'],
    [120, '2 h'],
  ])('formats %d minutes as %s', (durationMinutes, expectedText) => {
    expect(formatServiceDuration(durationMinutes)).toBe(expectedText);
  });
});

describe('formatServicePrice', () => {
  it.each([
    [3500, '35 €'],
    [3550, '35,50 €'],
    [0, '0 €'],
    [null, null],
  ])('formats %s cents as %s', (priceCents, expectedText) => {
    expect(formatServicePrice(priceCents)).toBe(expectedText);
  });
});
