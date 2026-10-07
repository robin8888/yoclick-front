import { formatNumericDate, parseNumericDate } from './numeric-date';

describe('formatNumericDate', () => {
  it.each([
    ['2026-11-23', '23/11/2026'],
    ['2026-01-05', '05/01/2026'],
    ['', ''],
    ['no es una fecha', 'no es una fecha'],
  ])('writes «%s» as «%s»', (isoDate, expectedText) => {
    expect(formatNumericDate(isoDate)).toBe(expectedText);
  });
});

describe('parseNumericDate', () => {
  it.each([
    ['23/11/2026', '2026-11-23'],
    ['3/1/2026', '2026-01-03'],
    ['23-11-2026', '2026-11-23'],
    ['23.11.2026', '2026-11-23'],
    ['23 11 2026', '2026-11-23'],
    ['23/11/26', '2026-11-23'],
    [' 23/11/2026 ', '2026-11-23'],
    ['29/02/2028', '2028-02-29'],
  ])('reads «%s» as %s', (text, expectedIsoDate) => {
    expect(parseNumericDate(text)).toBe(expectedIsoDate);
  });

  it.each([
    '',
    '23/11',
    '31/04/2026',
    '29/02/2027',
    '00/11/2026',
    '23/13/2026',
    '2026-11-23',
    'veintitrés',
  ])('does not read «%s»', (text) => {
    expect(parseNumericDate(text)).toBeNull();
  });
});
