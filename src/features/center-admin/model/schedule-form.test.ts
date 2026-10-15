import type {
  RoomListResponseDtoRoomsItem,
  ServiceListResponseDtoServicesItem,
} from '@/shared/api/generated/model';

import {
  applyServiceChoice,
  buildEmptyScheduleForm,
  listAllowedModes,
  listCompatibleRooms,
  mapScheduleFormToCreateRequest,
  scheduleFormSchema,
  toggleWeekday,
} from './schedule-form';

const TODAY = '2026-10-12';

function buildRoom(overrides: Partial<RoomListResponseDtoRoomsItem>): RoomListResponseDtoRoomsItem {
  return {
    id: 'room-1',
    name: 'Aula 1',
    capacity: 12,
    staff: null,
    fixedService: null,
    services: [],
    ...overrides,
  };
}

function buildService(
  overrides: Partial<ServiceListResponseDtoServicesItem>,
): ServiceListResponseDtoServicesItem {
  return {
    id: 'service-english',
    name: 'Inglés B1',
    description: null,
    hasSchedule: true,
    schedules: [],
    kind: 'individual',
    mode: 'both',
    durationMinutes: 90,
    priceCents: null,
    currency: 'EUR',
    color: null,
    bookingWindowDays: 30,
    minNoticeMinutes: 60,
    isVisible: true,
    isRental: false,
    room: null,
    staff: [],
    ...overrides,
  };
}

describe('scheduleFormSchema', () => {
  const validForm = {
    ...buildEmptyScheduleForm(TODAY),
    serviceId: 'service-english',
    weekdays: [1, 4],
  };

  it('accepts a service on two weekdays with the defaults', () => {
    expect(scheduleFormSchema.safeParse(validForm).success).toBe(true);
  });

  it.each([
    ['no service', { serviceId: '' }],
    ['no weekday', { weekdays: [] }],
    ['an end time before the start', { startsAtTime: '19:00', endsAtTime: '18:00' }],
    ['a capacity over 500', { capacity: '501' }],
    ['a decimal capacity', { capacity: '2,5' }],
    ['a missing start date', { startsOn: '' }],
    ['an end date before the start', { endsOn: '2026-10-01' }],
    ['a label over 80 characters', { label: 'a'.repeat(81) }],
  ])('rejects %s', (_caseName, overrides) => {
    expect(scheduleFormSchema.safeParse({ ...validForm, ...overrides }).success).toBe(false);
  });

  it('accepts an empty capacity and no end date (the server fills them)', () => {
    expect(scheduleFormSchema.safeParse({ ...validForm, capacity: '', endsOn: '' }).success).toBe(
      true,
    );
  });
});

describe('mapScheduleFormToCreateRequest', () => {
  it('omits what the server decides and sorts the weekdays', () => {
    expect(
      mapScheduleFormToCreateRequest({
        ...buildEmptyScheduleForm(TODAY),
        serviceId: 'service-english',
        weekdays: [4, 1],
      }),
    ).toEqual({
      serviceId: 'service-english',
      weekdays: [1, 4],
      startsAtTime: '18:00',
      endsAtTime: '19:00',
      mode: 'group',
      startsOn: TODAY,
      endsOn: null,
    });
  });

  it('sends the room, the teacher, the capacity, the period and the label when chosen', () => {
    expect(
      mapScheduleFormToCreateRequest({
        serviceId: 'service-english',
        weekdays: [2],
        startsAtTime: '10:00',
        endsAtTime: '11:30',
        roomId: 'room-1',
        staffMembershipId: 'staff-ana',
        mode: 'private',
        capacity: '1',
        startsOn: TODAY,
        endsOn: '2026-12-20',
        label: 'Clase particular de Marta',
      }),
    ).toEqual({
      serviceId: 'service-english',
      weekdays: [2],
      startsAtTime: '10:00',
      endsAtTime: '11:30',
      roomId: 'room-1',
      staffMembershipId: 'staff-ana',
      mode: 'private',
      capacity: 1,
      startsOn: TODAY,
      endsOn: '2026-12-20',
      label: 'Clase particular de Marta',
    });
  });
});

describe('toggleWeekday', () => {
  it('adds a weekday that was not chosen and removes one that was', () => {
    expect(toggleWeekday([1, 4], 2)).toEqual([1, 4, 2]);
    expect(toggleWeekday([1, 4], 4)).toEqual([1]);
  });
});

describe('listAllowedModes and listCompatibleRooms', () => {
  it.each([
    ['private', ['private']],
    ['group', ['group']],
    ['both', ['private', 'group']],
    [undefined, ['private', 'group']],
  ] as const)('a %s service allows %j', (serviceMode, expected) => {
    expect(listAllowedModes(serviceMode)).toEqual(expected);
  });

  it('keeps the rooms without a fixed service and those fixed to this one', () => {
    const rooms = [
      buildRoom({ id: 'free' }),
      buildRoom({ id: 'english', fixedService: { id: 'service-english', name: 'Inglés B1' } }),
      buildRoom({ id: 'salsa', fixedService: { id: 'service-salsa', name: 'Salsa' } }),
    ];

    expect(listCompatibleRooms(rooms, 'service-english').map(({ id }) => id)).toEqual([
      'free',
      'english',
    ]);
  });
});

describe('applyServiceChoice', () => {
  const rooms = [buildRoom({ id: 'salsa', fixedService: { id: 'service-salsa', name: 'Salsa' } })];

  it('keeps the mode and the room when the service allows them', () => {
    expect(
      applyServiceChoice({
        formValues: { mode: 'group', roomId: 'salsa' },
        service: buildService({ id: 'service-salsa', mode: 'both' }),
        rooms,
      }),
    ).toEqual({ serviceId: 'service-salsa', mode: 'group', roomId: 'salsa' });
  });

  it('switches to the only mode of the service and drops an incompatible room', () => {
    expect(
      applyServiceChoice({
        formValues: { mode: 'group', roomId: 'salsa' },
        service: buildService({ id: 'service-english', mode: 'private' }),
        rooms,
      }),
    ).toEqual({ serviceId: 'service-english', mode: 'private', roomId: '' });
  });
});
