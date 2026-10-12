import { zonedDateTimeToUtc } from './zoned-instant';

describe('zonedDateTimeToUtc', () => {
  it.each([
    {
      caseName: 'winter time in Madrid',
      isoDate: '2026-01-15',
      time: '09:00',
      timeZone: 'Europe/Madrid',
      expected: '2026-01-15T08:00:00.000Z',
    },
    {
      caseName: 'summer time in Madrid',
      isoDate: '2026-07-15',
      time: '18:30',
      timeZone: 'Europe/Madrid',
      expected: '2026-07-15T16:30:00.000Z',
    },
    {
      caseName: 'the Canary Islands',
      isoDate: '2026-07-15',
      time: '18:30',
      timeZone: 'Atlantic/Canary',
      expected: '2026-07-15T17:30:00.000Z',
    },
    {
      caseName: 'UTC itself',
      isoDate: '2026-10-12',
      time: '00:00',
      timeZone: 'UTC',
      expected: '2026-10-12T00:00:00.000Z',
    },
  ])('converts $caseName', ({ isoDate, time, timeZone, expected }) => {
    expect(zonedDateTimeToUtc(isoDate, time, timeZone).toISOString()).toBe(expected);
  });

  it('moves a time that does not exist (the March jump) forward', () => {
    expect(zonedDateTimeToUtc('2026-03-29', '02:30', 'Europe/Madrid').toISOString()).toBe(
      '2026-03-29T01:30:00.000Z',
    );
  });
});
