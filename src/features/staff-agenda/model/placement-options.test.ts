import type { PlacementOptionsResponseDto } from '@/shared/api/generated/model';

import {
  countFreeSeats,
  findFreeRooms,
  listSlotsWithFreeRoom,
  resolveRoomId,
} from './placement-options';

const SALA_1 = { id: 'room-1', name: 'Sala 1', capacity: 10 };
const SALA_2 = { id: 'room-2', name: 'Sala 2', capacity: 4 };

const OPTIONS: PlacementOptionsResponseDto = {
  timezone: 'Europe/Madrid',
  hasUsableRooms: true,
  openSlots: [
    {
      startsAt: '2026-10-12T08:00:00.000Z',
      endsAt: '2026-10-12T09:00:00.000Z',
      freeRooms: [SALA_1],
    },
    { startsAt: '2026-10-12T09:00:00.000Z', endsAt: '2026-10-12T10:00:00.000Z', freeRooms: [] },
    {
      startsAt: '2026-10-12T10:00:00.000Z',
      endsAt: '2026-10-12T11:00:00.000Z',
      freeRooms: [SALA_1, SALA_2],
    },
  ],
  groupSessions: [],
};

describe('listSlotsWithFreeRoom', () => {
  it('offers only the hours that have a free room', () => {
    const slots = listSlotsWithFreeRoom(OPTIONS, { membershipId: 'staff-ana', fullName: 'Ana' });

    expect(slots.map(({ startsAt }) => startsAt)).toEqual([
      '2026-10-12T08:00:00.000Z',
      '2026-10-12T10:00:00.000Z',
    ]);
    expect(slots[0]).toMatchObject({ staffMembershipId: 'staff-ana', staffName: 'Ana' });
  });
});

describe('findFreeRooms', () => {
  it.each([
    ['an hour with two rooms', '2026-10-12T10:00:00.000Z', [SALA_1, SALA_2]],
    ['an hour without rooms', '2026-10-12T09:00:00.000Z', []],
    ['an hour that is not offered', '2026-10-12T20:00:00.000Z', []],
    ['no hour chosen yet', null, []],
  ])('%s', (_caseName, startsAt, expectedRooms) => {
    expect(findFreeRooms(OPTIONS, startsAt)).toEqual(expectedRooms);
  });
});

describe('resolveRoomId', () => {
  it.each([
    [
      'keeps the chosen room while it is free',
      { rooms: [SALA_1, SALA_2], chosen: 'room-2' },
      'room-2',
    ],
    ['falls back to the first free room', { rooms: [SALA_1, SALA_2], chosen: 'room-9' }, 'room-1'],
    ['uses the first free room when none is chosen', { rooms: [SALA_2], chosen: null }, 'room-2'],
    ['is null when no room is free', { rooms: [], chosen: 'room-1' }, null],
  ])('%s', (_caseName, { rooms, chosen }, expectedRoomId) => {
    expect(resolveRoomId(rooms, chosen)).toBe(expectedRoomId);
  });
});

describe('countFreeSeats', () => {
  it('is the capacity of the room minus the people already in', () => {
    const group = {
      sessionId: 'session-1',
      startsAt: '2026-10-12T10:00:00.000Z',
      endsAt: '2026-10-12T11:00:00.000Z',
      serviceName: 'Salsa',
      room: { id: 'room-1', name: 'Sala 1' },
      capacity: 10,
      bookedCount: 7,
    };

    expect(countFreeSeats(group)).toBe(3);
  });
});
