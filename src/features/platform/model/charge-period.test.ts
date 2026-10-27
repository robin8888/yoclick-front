import {
  canShiftToNextPeriod,
  formatMonthLabel,
  formatQuarterLabel,
  getCurrentMonthKey,
  getPeriodRange,
  getQuarterRange,
  shiftMonth,
  shiftPeriod,
} from './charge-period';

describe('shiftMonth', () => {
  it.each([
    { monthKey: '2026-10', monthCount: 1, expected: '2026-11' },
    { monthKey: '2026-12', monthCount: 1, expected: '2027-01' },
    { monthKey: '2026-01', monthCount: -1, expected: '2025-12' },
    { monthKey: '2026-10', monthCount: -3, expected: '2026-07' },
    { monthKey: '2026-10', monthCount: 0, expected: '2026-10' },
  ])('moves $monthKey by $monthCount to $expected', ({ monthKey, monthCount, expected }) => {
    expect(shiftMonth(monthKey, monthCount)).toBe(expected);
  });
});

describe('getQuarterRange', () => {
  it.each([
    { monthKey: '2026-01', fromMonth: '2026-01', toMonth: '2026-03' },
    { monthKey: '2026-03', fromMonth: '2026-01', toMonth: '2026-03' },
    { monthKey: '2026-04', fromMonth: '2026-04', toMonth: '2026-06' },
    { monthKey: '2026-10', fromMonth: '2026-10', toMonth: '2026-12' },
    { monthKey: '2026-12', fromMonth: '2026-10', toMonth: '2026-12' },
  ])('puts $monthKey in $fromMonth to $toMonth', ({ monthKey, fromMonth, toMonth }) => {
    expect(getQuarterRange(monthKey)).toEqual({ fromMonth, toMonth });
  });
});

describe('getPeriodRange', () => {
  it('is a single month for a month period', () => {
    expect(getPeriodRange('month', '2026-10')).toEqual({
      fromMonth: '2026-10',
      toMonth: '2026-10',
    });
  });

  it('is the whole quarter for a quarter period', () => {
    expect(getPeriodRange('quarter', '2026-11')).toEqual({
      fromMonth: '2026-10',
      toMonth: '2026-12',
    });
  });
});

describe('shiftPeriod', () => {
  it.each([
    { kind: 'month', direction: -1, expected: '2026-09' },
    { kind: 'month', direction: 1, expected: '2026-11' },
    { kind: 'quarter', direction: -1, expected: '2026-07' },
    { kind: 'quarter', direction: 1, expected: '2027-01' },
  ] as const)('moves a $kind by $direction', ({ kind, direction, expected }) => {
    expect(shiftPeriod(kind, '2026-10', direction)).toBe(expected);
  });
});

describe('labels', () => {
  it('writes the month in Spanish', () => {
    expect(formatMonthLabel('2026-10')).toBe('octubre de 2026');
  });

  it.each([
    { monthKey: '2026-02', expected: '1.º trimestre de 2026' },
    { monthKey: '2026-10', expected: '4.º trimestre de 2026' },
  ])('writes the quarter of $monthKey', ({ monthKey, expected }) => {
    expect(formatQuarterLabel(monthKey)).toBe(expected);
  });
});

describe('getCurrentMonthKey', () => {
  it('uses the Madrid calendar, not UTC', () => {
    expect(getCurrentMonthKey(new Date('2026-10-31T23:30:00Z'))).toBe('2026-11');
  });
});

describe('canShiftToNextPeriod', () => {
  it.each([
    { kind: 'month', monthKey: '2026-09', canShift: true },
    { kind: 'month', monthKey: '2026-10', canShift: false },
    { kind: 'quarter', monthKey: '2026-07', canShift: true },
    { kind: 'quarter', monthKey: '2026-10', canShift: false },
  ] as const)(
    'is $canShift for a $kind at $monthKey in October',
    ({ kind, monthKey, canShift }) => {
      expect(canShiftToNextPeriod(kind, monthKey, '2026-10')).toBe(canShift);
    },
  );
});
