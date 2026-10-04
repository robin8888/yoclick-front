import { formatEuros, formatMoney, formatShortDate, formatTime24h } from '.';

describe('formatShortDate', () => {
  it.each([
    ['2026-10-01T16:00:00Z', 'Europe/Madrid', 'jue 1 oct'],
    ['2026-01-05T09:00:00Z', 'Europe/Madrid', 'lun 5 ene'],
    ['2026-12-31T23:30:00Z', 'Europe/Madrid', 'vie 1 ene'],
    ['2026-03-01T10:00:00Z', 'Europe/Madrid', 'dom 1 mar'],
    ['2026-09-02T10:00:00Z', 'Europe/Madrid', 'mié 2 sep'],
    ['2026-11-07T10:00:00Z', 'Europe/Madrid', 'sáb 7 nov'],
    ['2026-02-03T10:00:00Z', 'Europe/Madrid', 'mar 3 feb'],
  ])('shows %s in %s as «%s»', (isoDate, timeZone, expectedText) => {
    expect(formatShortDate(isoDate, timeZone)).toBe(expectedText);
  });

  it('uses the center time zone, not the device one', () => {
    const lateEveningUtc = '2026-10-01T22:30:00Z';

    expect(formatShortDate(lateEveningUtc, 'Atlantic/Canary')).toBe('jue 1 oct');
    expect(formatShortDate(lateEveningUtc, 'Europe/Madrid')).toBe('vie 2 oct');
  });

  it('accepts Date objects', () => {
    expect(formatShortDate(new Date('2026-10-01T16:00:00Z'), 'Europe/Madrid')).toBe('jue 1 oct');
  });

  it('throws on an invalid date instead of rendering nonsense', () => {
    expect(() => formatShortDate('not-a-date', 'Europe/Madrid')).toThrow(RangeError);
  });

  it('falls back to the device zone when none is given', () => {
    const localNoon = new Date(2026, 9, 1, 12, 0);

    expect(formatShortDate(localNoon)).toBe('jue 1 oct');
  });
});

describe('formatTime24h', () => {
  it.each([
    ['2026-10-01T16:00:00Z', 'Europe/Madrid', '18:00'],
    ['2026-01-05T09:05:00Z', 'Europe/Madrid', '10:05'],
    ['2026-10-01T22:00:00Z', 'Europe/Madrid', '00:00'],
    ['2026-10-01T22:00:00Z', 'Atlantic/Canary', '23:00'],
    ['2026-10-01T13:45:00Z', 'Europe/Madrid', '15:45'],
  ])('shows %s in %s as %s', (isoDate, timeZone, expectedText) => {
    expect(formatTime24h(isoDate, timeZone)).toBe(expectedText);
  });

  it('uses the device zone when none is given', () => {
    expect(formatTime24h(new Date(2026, 9, 1, 7, 5))).toBe('07:05');
  });
});

describe('formatMoney', () => {
  it.each([
    [0, '0\u00a0€'],
    [50, '0,50\u00a0€'],
    [3500, '35\u00a0€'],
    [3550, '35,50\u00a0€'],
    [99999, '999,99\u00a0€'],
    [123400, '1234\u00a0€'],
    [1248000, '12.480\u00a0€'],
    [123456789, '1.234.567,89\u00a0€'],
    [-350, '-3,50\u00a0€'],
    [100001, '1000,01\u00a0€'],
  ])('formats %i cents as «%s»', (amountCents, expectedText) => {
    expect(formatMoney({ amountCents, currency: 'EUR' })).toBe(expectedText);
    expect(formatEuros(amountCents)).toBe(expectedText);
  });

  it('rejects fractional cents', () => {
    expect(() => formatEuros(10.5)).toThrow(RangeError);
  });
});
