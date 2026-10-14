import { buildEntryInstants } from './entry-instants';

const TIME_ZONE = 'Europe/Madrid';

describe('buildEntryInstants', () => {
  it('builds the instants of a normal shift in the center time zone', () => {
    const instants = buildEntryInstants({
      workDate: '2026-10-05',
      inTime: '09:00',
      outTime: '17:30',
      timeZone: TIME_ZONE,
    });

    expect(instants).toEqual({
      clockInAt: '2026-10-05T07:00:00.000Z',
      clockOutAt: '2026-10-05T15:30:00.000Z',
      isOutOnNextDay: false,
    });
  });

  it('moves a leave time earlier than the arrival to the next day', () => {
    const instants = buildEntryInstants({
      workDate: '2026-10-05',
      inTime: '22:00',
      outTime: '06:00',
      timeZone: TIME_ZONE,
    });

    expect(instants.isOutOnNextDay).toBe(true);
    expect(instants.clockOutAt).toBe('2026-10-06T04:00:00.000Z');
  });

  it('uses the winter offset after the October clock change', () => {
    const instants = buildEntryInstants({
      workDate: '2026-11-02',
      inTime: '09:00',
      outTime: '10:00',
      timeZone: TIME_ZONE,
    });

    expect(instants.clockInAt).toBe('2026-11-02T08:00:00.000Z');
  });
});
