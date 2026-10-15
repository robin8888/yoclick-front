import { addMinutesToTime, buildCreateClassRequest, listFreeStartTimes } from './create-class';

const NO_END = null;

describe('listFreeStartTimes', () => {
  it('offers every half hour of the day when nothing is busy', () => {
    const times = listFreeStartTimes({
      durationMinutes: 60,
      weekdays: [1],
      busy: [],
      period: { startsOn: '2026-10-20', endsOn: NO_END },
    });

    expect(times[0]).toBe('06:00');
    expect(times).toContain('18:00');
    expect(times.at(-1)).toBe('21:00');
  });

  it('removes the starts that would overlap a class of the same weekday', () => {
    const times = listFreeStartTimes({
      durationMinutes: 60,
      weekdays: [1],
      busy: [
        {
          weekday: 1,
          startsAtTime: '18:00',
          endsAtTime: '19:00',
          startsOn: '2026-10-01',
          endsOn: NO_END,
        },
      ],
      period: { startsOn: '2026-10-20', endsOn: NO_END },
    });

    expect(times).not.toContain('17:30');
    expect(times).not.toContain('18:00');
    expect(times).not.toContain('18:30');
    expect(times).toContain('17:00');
    expect(times).toContain('19:00');
  });

  it('ignores the busy slots of other weekdays and of periods that do not cross', () => {
    const times = listFreeStartTimes({
      durationMinutes: 60,
      weekdays: [2],
      busy: [
        {
          weekday: 1,
          startsAtTime: '18:00',
          endsAtTime: '19:00',
          startsOn: '2026-10-01',
          endsOn: NO_END,
        },
        {
          weekday: 2,
          startsAtTime: '18:00',
          endsAtTime: '19:00',
          startsOn: '2026-01-01',
          endsOn: '2026-06-30',
        },
      ],
      period: { startsOn: '2026-10-20', endsOn: NO_END },
    });

    expect(times).toContain('18:00');
  });

  it('needs the time to be free in every chosen weekday', () => {
    const times = listFreeStartTimes({
      durationMinutes: 60,
      weekdays: [1, 3],
      busy: [
        {
          weekday: 3,
          startsAtTime: '18:00',
          endsAtTime: '19:00',
          startsOn: '2026-10-01',
          endsOn: NO_END,
        },
      ],
      period: { startsOn: '2026-10-20', endsOn: NO_END },
    });

    expect(times).not.toContain('18:00');
  });

  it('offers nothing without weekdays', () => {
    expect(
      listFreeStartTimes({
        durationMinutes: 60,
        weekdays: [],
        busy: [],
        period: { startsOn: '2026-10-20', endsOn: NO_END },
      }),
    ).toEqual([]);
  });
});

describe('listFreeStartTimes · opening hours', () => {
  const period = { startsOn: '2026-10-20', endsOn: null };

  it('only offers starts inside the hours of the center, so the class ends before it closes', () => {
    const times = listFreeStartTimes({
      durationMinutes: 60,
      weekdays: [1],
      busy: [],
      period,
      openRanges: { 1: [{ opensAt: '09:00', closesAt: '20:00' }] },
    });

    expect(times[0]).toBe('09:00');
    expect(times.at(-1)).toBe('19:00');
    expect(times).not.toContain('06:00');
    expect(times).not.toContain('19:30');
  });

  it('respects a split day and offers nothing on a closed one', () => {
    const split = listFreeStartTimes({
      durationMinutes: 60,
      weekdays: [2],
      busy: [],
      period,
      openRanges: {
        2: [
          { opensAt: '09:00', closesAt: '13:00' },
          { opensAt: '16:00', closesAt: '20:00' },
        ],
      },
    });
    const closed = listFreeStartTimes({
      durationMinutes: 60,
      weekdays: [7],
      busy: [],
      period,
      openRanges: { 1: [{ opensAt: '09:00', closesAt: '20:00' }] },
    });

    expect(split).toContain('12:00');
    expect(split).not.toContain('12:30');
    expect(split).not.toContain('14:00');
    expect(split).toContain('16:00');
    expect(closed).toEqual([]);
  });

  it('does not restrict anything while the opening hours are not configured', () => {
    const times = listFreeStartTimes({
      durationMinutes: 60,
      weekdays: [1],
      busy: [],
      period,
      openRanges: null,
    });

    expect(times[0]).toBe('06:00');
  });
});

describe('buildCreateClassRequest', () => {
  const service = { durationMinutes: 90, mode: 'both' as const };
  const base = {
    label: ' Kickboxing adultos ',
    roomId: 'room-1',
    serviceId: 'service-1',
    staffMembershipId: 'staff-1',
    repeat: 'weekly' as const,
    weekdays: [3, 1],
    startsOn: '2026-10-20',
    startsAtTime: '18:00',
  };

  it('builds a weekly class with the end derived from the service duration', () => {
    expect(buildCreateClassRequest(base, service, 2)).toEqual({
      serviceId: 'service-1',
      roomId: 'room-1',
      staffMembershipId: 'staff-1',
      weekdays: [1, 3],
      startsAtTime: '18:00',
      endsAtTime: '19:30',
      mode: 'group',
      startsOn: '2026-10-20',
      endsOn: null,
      label: 'Kickboxing adultos',
    });
  });

  it('makes a one-off class end the same day and use that date weekday', () => {
    const request = buildCreateClassRequest({ ...base, repeat: 'once', weekdays: [] }, service, 2);

    expect(request).toMatchObject({ weekdays: [2], startsOn: '2026-10-20', endsOn: '2026-10-20' });
  });

  it('is null while something is missing', () => {
    expect(buildCreateClassRequest({ ...base, roomId: null }, service, 2)).toBeNull();
    expect(buildCreateClassRequest({ ...base, startsAtTime: null }, service, 2)).toBeNull();
    expect(buildCreateClassRequest({ ...base, weekdays: [] }, service, 2)).toBeNull();
  });
});

describe('addMinutesToTime', () => {
  it('adds minutes across the hour', () => {
    expect(addMinutesToTime('18:30', 45)).toBe('19:15');
  });
});
