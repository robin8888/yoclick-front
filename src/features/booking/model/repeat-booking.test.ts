import type {
  MyBookingsResponseDtoBookingsItem,
  ServiceSessionsResponseDtoSessionsItem,
} from '@/shared/api/generated/model';

import { findRepeatableClass, pickLastRepeatableBooking } from './repeat-booking';

const TIME_ZONE = 'Europe/Madrid';
const ANA_ID = '11111111-1111-4111-8111-111111111111';
const LUIS_ID = '22222222-2222-4222-8222-222222222222';
const NOW = new Date('2026-10-21T08:00:00Z');

function buildBooking(
  overrides: Partial<MyBookingsResponseDtoBookingsItem>,
): MyBookingsResponseDtoBookingsItem {
  return {
    id: 'booking',
    status: 'attended',
    // Jueves 15 oct 2026, 18:00 en Madrid.
    startsAt: '2026-10-15T16:00:00Z',
    staff: { membershipId: ANA_ID, fullName: 'Ana' },
    ...overrides,
  } as MyBookingsResponseDtoBookingsItem;
}

function buildClass(
  overrides: Partial<ServiceSessionsResponseDtoSessionsItem>,
): ServiceSessionsResponseDtoSessionsItem {
  return {
    id: 'class',
    // Jueves 22 oct 2026, 18:00 en Madrid.
    startsAt: '2026-10-22T16:00:00Z',
    remainingSeats: 5,
    teacher: { membershipId: ANA_ID, fullName: 'Ana' },
    ...overrides,
  } as ServiceSessionsResponseDtoSessionsItem;
}

describe('pickLastRepeatableBooking', () => {
  it('takes the most recent booking that was not cancelled', () => {
    const older = buildBooking({ id: 'older', startsAt: '2026-10-01T16:00:00Z' });
    const newer = buildBooking({ id: 'newer', status: 'no_show' });
    const cancelled = buildBooking({
      id: 'cancelled',
      status: 'cancelled',
      startsAt: '2026-10-18T16:00:00Z',
    });

    expect(pickLastRepeatableBooking([older, cancelled, newer])?.id).toBe('newer');
  });

  it('gives nothing when there are no bookings or all were cancelled', () => {
    expect(pickLastRepeatableBooking([])).toBeNull();
    expect(pickLastRepeatableBooking([buildBooking({ status: 'cancelled' })])).toBeNull();
  });
});

describe('findRepeatableClass', () => {
  const lastBooking = buildBooking({});
  const request = { lastBooking, bookedClassIds: new Set<string>(), timeZone: TIME_ZONE, now: NOW };

  it('offers the next class on the same weekday and time', () => {
    const nextWeek = buildClass({ id: 'next-week' });
    const otherHour = buildClass({ id: 'other-hour', startsAt: '2026-10-22T17:00:00Z' });
    const otherDay = buildClass({ id: 'other-day', startsAt: '2026-10-23T16:00:00Z' });

    const found = findRepeatableClass({ ...request, openClasses: [otherDay, otherHour, nextWeek] });

    expect(found?.id).toBe('next-week');
  });

  it('prefers the same teacher over an earlier class with another one', () => {
    const withLuis = buildClass({
      id: 'luis',
      teacher: { membershipId: LUIS_ID, fullName: 'Luis' },
    });
    const withAnaLater = buildClass({ id: 'ana-later', startsAt: '2026-10-29T17:00:00Z' });

    const found = findRepeatableClass({ ...request, openClasses: [withLuis, withAnaLater] });

    expect(found?.id).toBe('ana-later');
  });

  it.each([
    { reason: 'it is full', openClass: buildClass({ remainingSeats: 0 }) },
    { reason: 'it already started', openClass: buildClass({ startsAt: '2026-10-21T06:00:00Z' }) },
  ])('skips a class when $reason', ({ openClass }) => {
    expect(findRepeatableClass({ ...request, openClasses: [openClass] })).toBeNull();
  });

  it('skips a class the person is already booked into', () => {
    const found = findRepeatableClass({
      ...request,
      bookedClassIds: new Set(['class']),
      openClasses: [buildClass({})],
    });

    expect(found).toBeNull();
  });

  it('compares the time in the center zone, so a summer-time change does not move it', () => {
    // 25 oct 2026 acaba el horario de verano: el jueves 29 a las 18:00 son las 17:00Z.
    const afterClockChange = buildClass({ id: 'winter', startsAt: '2026-10-29T17:00:00Z' });

    const found = findRepeatableClass({ ...request, openClasses: [afterClockChange] });

    expect(found?.id).toBe('winter');
  });
});
