import type { RoomSession } from './room-agenda';
import { getSeatState } from './seat-state';

const GROUP = { mode: 'group', capacity: 12, bookedCount: 3, cancelledReason: null };

describe('getSeatState', () => {
  it.each([
    { caseName: 'a group with seats left', overrides: {}, expected: 'open' },
    { caseName: 'a group with nobody in it', overrides: { bookedCount: 0 }, expected: 'open' },
    { caseName: 'a full group', overrides: { bookedCount: 12 }, expected: 'full' },
    {
      caseName: 'a private appointment',
      overrides: { mode: 'private', capacity: 1 },
      expected: 'private',
    },
    {
      caseName: 'a cancelled day',
      overrides: { cancelledReason: 'Festivo' },
      expected: 'cancelled',
    },
  ])('says $expected for $caseName', ({ overrides, expected }) => {
    expect(getSeatState({ ...GROUP, ...overrides } as RoomSession)).toBe(expected);
  });
});
