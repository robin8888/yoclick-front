import {
  addMinutesToTime,
  buildCreateClassRequest,
  findHoursProblem,
  toOpenRangesByWeekday,
  type BusySlot,
} from './create-class';
import { buildLocationDraft, EMPTY_LOCATION_DRAFT } from './location-draft';

const NO_END = null;
const OPEN_ALL_DAY = { 1: [{ opensAt: '09:00', closesAt: '21:00' }], 7: [] };
const MONDAY_CLASS: BusySlot = {
  weekday: 1,
  startsAtTime: '18:00',
  endsAtTime: '19:00',
  startsOn: '2026-10-01',
  endsOn: NO_END,
  className: 'Yoga',
  source: 'room',
};

const baseRequest = {
  startsAtTime: '10:00',
  endsAtTime: '11:00',
  weekdays: [1],
  busy: [] as BusySlot[],
  period: { startsOn: '2026-10-20', endsOn: NO_END },
  openRanges: null,
};

describe('findHoursProblem', () => {
  it('accepts free hours', () => {
    expect(findHoursProblem(baseRequest)).toBeNull();
  });

  it('rejects an end that is not after the start', () => {
    expect(findHoursProblem({ ...baseRequest, endsAtTime: '10:00' })).toEqual({ kind: 'order' });
  });

  it('rejects a closed day', () => {
    const problem = findHoursProblem({ ...baseRequest, weekdays: [7], openRanges: OPEN_ALL_DAY });

    expect(problem).toEqual({ kind: 'closed' });
  });

  it('rejects hours outside the opening hours', () => {
    const problem = findHoursProblem({
      ...baseRequest,
      startsAtTime: '20:30',
      endsAtTime: '21:30',
      openRanges: OPEN_ALL_DAY,
    });

    expect(problem).toEqual({ kind: 'outside_hours', opensAt: '09:00', closesAt: '21:00' });
  });

  it('rejects an overlap with a class of the same weekday and period', () => {
    const problem = findHoursProblem({
      ...baseRequest,
      startsAtTime: '18:30',
      endsAtTime: '19:30',
      busy: [MONDAY_CLASS],
    });

    expect(problem).toMatchObject({ kind: 'busy', className: 'Yoga' });
  });

  it('allows a class that starts when another ends', () => {
    const problem = findHoursProblem({
      ...baseRequest,
      startsAtTime: '19:00',
      endsAtTime: '20:00',
      busy: [MONDAY_CLASS],
    });

    expect(problem).toBeNull();
  });

  it('ignores a busy class that ended before the period', () => {
    const problem = findHoursProblem({
      ...baseRequest,
      startsAtTime: '18:00',
      endsAtTime: '19:00',
      busy: [{ ...MONDAY_CLASS, endsOn: '2026-10-10' }],
    });

    expect(problem).toBeNull();
  });
});

describe('toOpenRangesByWeekday', () => {
  it('is null while the centre has no opening hours', () => {
    expect(toOpenRangesByWeekday(undefined)).toBeNull();
  });
});

describe('buildCreateClassRequest', () => {
  const service = { mode: 'both' as const, isRental: false };
  const base = {
    label: ' Kickboxing adultos ',
    roomId: 'room-1',
    serviceId: 'service-1',
    staffMembershipId: 'staff-1',
    repeat: 'weekly' as const,
    weekdays: [3, 1],
    startsOn: '2026-10-20',
    endsOn: '',
    startsAtTime: '18:00',
    endsAtTime: '19:30',
    location: EMPTY_LOCATION_DRAFT,
  };

  it('sends the place of a class held outside the center', () => {
    const park = {
      name: 'Parque del Retiro',
      address: 'Plaza de la Independencia 7, Madrid',
      latitude: 40.4153,
      longitude: -3.6844,
    };

    const request = buildCreateClassRequest(
      { ...base, location: buildLocationDraft(park) },
      service,
      2,
    );

    expect(request?.location).toEqual(park);
  });

  it('does not build a class held outside the center that has no place name yet', () => {
    const draft = { ...base, location: { ...EMPTY_LOCATION_DRAFT, isOutside: true } };

    expect(buildCreateClassRequest(draft, service, 2)).toBeNull();
  });

  it('builds a weekly class without end date', () => {
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

  it('uses the chosen end date', () => {
    const request = buildCreateClassRequest({ ...base, endsOn: '2026-11-20' }, service, 2);

    expect(request).toMatchObject({ endsOn: '2026-11-20' });
  });

  it('makes a one-off class end the same day and use that date weekday', () => {
    const request = buildCreateClassRequest({ ...base, repeat: 'once', weekdays: [] }, service, 2);

    expect(request).toMatchObject({ weekdays: [2], startsOn: '2026-10-20', endsOn: '2026-10-20' });
  });

  it('lets a rental be created without a teacher', () => {
    const request = buildCreateClassRequest(
      { ...base, staffMembershipId: null },
      { mode: 'group', isRental: true },
      2,
    );

    expect(request).not.toBeNull();
    expect(request).not.toHaveProperty('staffMembershipId');
  });

  it('is null while something is missing or reversed', () => {
    expect(buildCreateClassRequest({ ...base, roomId: null }, service, 2)).toBeNull();
    expect(buildCreateClassRequest({ ...base, staffMembershipId: null }, service, 2)).toBeNull();
    expect(buildCreateClassRequest({ ...base, weekdays: [] }, service, 2)).toBeNull();
    expect(buildCreateClassRequest({ ...base, endsOn: '2026-10-01' }, service, 2)).toBeNull();
  });
});

describe('addMinutesToTime', () => {
  it('adds minutes across the hour', () => {
    expect(addMinutesToTime('18:30', 45)).toBe('19:15');
  });
});
