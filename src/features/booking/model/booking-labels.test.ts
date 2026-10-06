import {
  buildBookingDateTileLabels,
  buildServiceMetaLabel,
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

describe('buildBookingDateTileLabels', () => {
  it.each([
    {
      startsAtIso: '2026-10-01T16:00:00.000Z',
      weekdayLabel: 'JUE',
      dayLabel: '1',
      monthLabel: 'OCT',
    },
    {
      startsAtIso: '2026-10-05T07:00:00.000Z',
      weekdayLabel: 'LUN',
      dayLabel: '5',
      monthLabel: 'OCT',
    },
    {
      startsAtIso: '2026-10-08T22:30:00.000Z',
      weekdayLabel: 'VIE',
      dayLabel: '9',
      monthLabel: 'OCT',
    },
  ])('splits $startsAtIso into the date block', ({ startsAtIso, ...expectedLabels }) => {
    const labels = buildBookingDateTileLabels(startsAtIso, 'Europe/Madrid');

    expect(labels).toMatchObject(expectedLabels);
    expect(labels.accessibleLabel).toBe(
      `${expectedLabels.weekdayLabel} ${expectedLabels.dayLabel} ${expectedLabels.monthLabel}`.toLowerCase(),
    );
  });
});

describe('buildServiceMetaLabel', () => {
  it.each([
    { durationMinutes: 60, priceCents: 3500, expectedLabel: '60 min · Individual · 35 €' },
    { durationMinutes: 30, priceCents: 0, expectedLabel: '30 min · Individual · Gratis' },
    {
      durationMinutes: 45,
      priceCents: null,
      expectedLabel: '45 min · Individual · Precio a consultar',
    },
  ])('describes $durationMinutes min at $priceCents cents', ({ expectedLabel, ...service }) => {
    expect(buildServiceMetaLabel({ ...service, kind: 'individual' })).toBe(expectedLabel);
  });
});
