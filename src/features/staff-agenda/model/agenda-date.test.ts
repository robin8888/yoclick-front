import { getTodayIsoDate, shiftIsoDate } from './agenda-date';

describe('getTodayIsoDate', () => {
  it.each([
    ['2026-10-05T10:00:00.000Z', 'Europe/Madrid', '2026-10-05'],
    ['2026-10-05T22:30:00.000Z', 'Europe/Madrid', '2026-10-06'],
    ['2026-10-05T22:30:00.000Z', 'UTC', '2026-10-05'],
  ])('is the center date for %s in %s', (nowIso, timeZone, expectedDate) => {
    expect(getTodayIsoDate(new Date(nowIso), timeZone)).toBe(expectedDate);
  });
});

describe('shiftIsoDate', () => {
  it.each([
    ['2026-10-05', 1, '2026-10-06'],
    ['2026-10-05', -1, '2026-10-04'],
    ['2026-10-31', 1, '2026-11-01'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2027-03-01', -1, '2027-02-28'],
    ['2026-10-24', 2, '2026-10-26'],
  ])('moves %s by %d days to %s', (isoDate, dayOffset, expectedDate) => {
    expect(shiftIsoDate(isoDate, dayOffset)).toBe(expectedDate);
  });

  it.each(['', '2026-1-5', 'hoy'])('returns null for %j', (invalidDate) => {
    expect(shiftIsoDate(invalidDate, 1)).toBeNull();
  });
});
