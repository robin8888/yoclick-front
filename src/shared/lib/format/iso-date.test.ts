import { addDaysToIsoDate, getTodayIsoDate, getWeekdayOfIsoDate } from './iso-date';

describe('getTodayIsoDate', () => {
  it('uses the calendar day of the given zone, not UTC', () => {
    const lateNightUtc = new Date('2026-10-12T23:30:00.000Z');

    expect(getTodayIsoDate(lateNightUtc, 'Europe/Madrid')).toBe('2026-10-13');
    expect(getTodayIsoDate(lateNightUtc, 'UTC')).toBe('2026-10-12');
  });
});

describe('addDaysToIsoDate', () => {
  it.each([
    ['2026-10-12', 56, '2026-12-07'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-03-01', -1, '2026-02-28'],
  ])('moves %s by %i days to %s', (isoDate, dayCount, expected) => {
    expect(addDaysToIsoDate(isoDate, dayCount)).toBe(expected);
  });

  it('leaves a malformed date untouched', () => {
    expect(addDaysToIsoDate('12/10/2026', 3)).toBe('12/10/2026');
  });
});

describe('getWeekdayOfIsoDate', () => {
  it.each([
    ['2026-10-12', 1],
    ['2026-10-17', 6],
    ['2026-10-18', 7],
  ])('counts %s as weekday %i (Monday = 1)', (isoDate, expected) => {
    expect(getWeekdayOfIsoDate(isoDate)).toBe(expected);
  });

  it('returns null for a malformed date', () => {
    expect(getWeekdayOfIsoDate('hoy')).toBeNull();
  });
});
