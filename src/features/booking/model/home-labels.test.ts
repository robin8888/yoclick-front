import { calculateDurationInMinutes, extractFirstName, formatLongDate } from './home-labels';

describe('formatLongDate', () => {
  it.each([
    ['2026-09-29T10:00:00Z', 'Europe/Madrid', 'martes, 29 de septiembre'],
    ['2026-12-31T23:30:00Z', 'Europe/Madrid', 'viernes, 1 de enero'],
    ['2026-03-01T10:00:00Z', 'Europe/Madrid', 'domingo, 1 de marzo'],
  ])('writes %s in %s as «%s»', (isoDate, timeZone, expectedText) => {
    expect(formatLongDate(isoDate, timeZone)).toBe(expectedText);
  });
});

describe('extractFirstName', () => {
  it.each([
    ['Marta Ruiz Gómez', 'Marta'],
    ['  Álex  ', 'Álex'],
    [undefined, ''],
  ])('takes the first name of %s', (fullName, expectedName) => {
    expect(extractFirstName(fullName)).toBe(expectedName);
  });
});

describe('calculateDurationInMinutes', () => {
  it('measures the appointment length', () => {
    expect(calculateDurationInMinutes('2026-10-01T16:00:00Z', '2026-10-01T17:00:00Z')).toBe(60);
  });
});
