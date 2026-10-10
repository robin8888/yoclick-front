import type { RoomDay } from './room-agenda';
import { countFreeSeats, hasFreeSeats, listTeachersOfRoomDay } from './room-agenda';

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
