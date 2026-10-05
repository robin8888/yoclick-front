import { describeIsoDate, listBookableDates } from './booking-dates';

const OCTOBER_FIFTH_LABELS = {
  isoDate: '2026-10-05',
  weekdayLabel: 'lun',
  dayLabel: '5',
  spokenLabel: 'lunes 5 de octubre',
};

describe('listBookableDates', () => {
  it('starts today in the center time zone and labels each day in Spanish', () => {
    const dates = listBookableDates({
      now: new Date('2026-10-05T10:00:00.000Z'),
      dayCount: 3,
      timeZone: 'Europe/Madrid',
    });

    expect(dates).toEqual([
      OCTOBER_FIFTH_LABELS,
      {
        isoDate: '2026-10-06',
        weekdayLabel: 'mar',
        dayLabel: '6',
        spokenLabel: 'martes 6 de octubre',
      },
      {
        isoDate: '2026-10-07',
        weekdayLabel: 'mié',
        dayLabel: '7',
        spokenLabel: 'miércoles 7 de octubre',
      },
    ]);
  });

  it('uses the center date, not the UTC one, late at night', () => {
    const [firstDate] = listBookableDates({
      now: new Date('2026-10-05T22:30:00.000Z'),
      dayCount: 1,
      timeZone: 'Europe/Madrid',
    });

    expect(firstDate?.isoDate).toBe('2026-10-06');
  });

  it.each([
    [
      'the last Sunday of October (clocks go back, 25 h day)',
      '2026-10-24T08:00:00.000Z',
      ['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27'],
    ],
    [
      'the last Sunday of March (clocks go forward, 23 h day)',
      '2027-03-27T08:00:00.000Z',
      ['2027-03-27', '2027-03-28', '2027-03-29', '2027-03-30'],
    ],
  ])('never skips or repeats a day across %s', (_caseName, nowIso, expectedDates) => {
    const dates = listBookableDates({
      now: new Date(nowIso),
      dayCount: 4,
      timeZone: 'Europe/Madrid',
    });

    expect(dates.map((bookableDate) => bookableDate.isoDate)).toEqual(expectedDates);
  });

  it('crosses month and year boundaries', () => {
    const dates = listBookableDates({
      now: new Date('2026-12-30T10:00:00.000Z'),
      dayCount: 3,
      timeZone: 'Europe/Madrid',
    });

    expect(dates.map((bookableDate) => bookableDate.isoDate)).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
    ]);
  });
});

describe('describeIsoDate', () => {
  it('labels a calendar day without depending on any time zone', () => {
    expect(describeIsoDate('2026-10-05')).toEqual(OCTOBER_FIFTH_LABELS);
  });

  it.each(['', '2026-1-5', 'lunes', '2026/10/05'])('returns null for %j', (invalidDate) => {
    expect(describeIsoDate(invalidDate)).toBeNull();
  });
});
