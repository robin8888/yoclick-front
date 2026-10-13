import type { RoomDay, RoomSession } from './room-agenda';
import {
  canJoinSession,
  countFreeSeats,
  findSessionInRoomAgenda,
  hasFreeSeats,
  listTeachersOfRoomDay,
} from './room-agenda';

describe('seats of a class', () => {
  it.each([
    ['seats left', { capacity: 10, bookedCount: 7 }, 3],
    ['full', { capacity: 10, bookedCount: 10 }, 0],
    ['over the capacity (never negative)', { capacity: 2, bookedCount: 3 }, 0],
  ])('%s', (_caseName, session, freeSeats) => {
    expect(countFreeSeats(session)).toBe(freeSeats);
    expect(hasFreeSeats(session)).toBe(freeSeats > 0);
  });
});

describe('listTeachersOfRoomDay', () => {
  it('lists each teacher once, in hour order', () => {
    const room = {
      sessions: [
        { teacher: { fullName: 'Ana' } },
        { teacher: { fullName: 'Ben' } },
        { teacher: { fullName: 'Ana' } },
      ],
    } as unknown as RoomDay;

    expect(listTeachersOfRoomDay(room)).toEqual(['Ana', 'Ben']);
  });
});

const NOW = new Date('2026-10-13T10:00:00.000Z');

describe('findSessionInRoomAgenda and canJoinSession', () => {
  const session = {
    id: 'session-1',
    mode: 'group',
    capacity: 10,
    bookedCount: 3,
    cancelledReason: null,
    endsAt: '2026-10-13T11:00:00.000Z',
  };
  const agenda = {
    rooms: [{ name: 'Sala 1', sessions: [session] }],
    sessionsWithoutRoom: [{ ...session, id: 'session-2' }],
  } as unknown as Parameters<typeof findSessionInRoomAgenda>[0];

  it('finds a session in its room, or without room, and says when it is missing', () => {
    expect(findSessionInRoomAgenda(agenda, 'session-1')?.roomName).toBe('Sala 1');
    expect(findSessionInRoomAgenda(agenda, 'session-2')?.roomName).toBeNull();
    expect(findSessionInRoomAgenda(agenda, 'session-3')).toBeUndefined();
  });

  it.each([
    ['a group with seats', {}, true],
    ['a full group', { bookedCount: 10 }, false],
    ['a private appointment', { mode: 'private', capacity: 1, bookedCount: 1 }, false],
    ['a cancelled day', { cancelledReason: 'Festivo' }, false],
    ['a class that already ended', { endsAt: '2026-10-13T09:00:00.000Z' }, false],
  ])('can join %s: %s', (_caseName, overrides, canJoin) => {
    expect(canJoinSession({ ...session, ...overrides } as RoomSession, NOW)).toBe(canJoin);
  });
});
