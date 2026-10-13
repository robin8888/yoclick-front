import type { RoomSession } from './room-agenda';
import { getSeatState } from './seat-state';

const NOW = new Date('2026-10-13T10:00:00.000Z');
const GROUP = {
  mode: 'group',
  capacity: 12,
  bookedCount: 3,
  cancelledReason: null,
  endsAt: '2026-10-13T11:00:00.000Z',
};

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
    {
      caseName: 'a class that already ended with seats left',
      overrides: { endsAt: '2026-10-13T09:00:00.000Z' },
      expected: 'finished',
    },
    {
      caseName: 'a cancelled day that is also in the past',
      overrides: { cancelledReason: 'Festivo', endsAt: '2026-10-13T09:00:00.000Z' },
      expected: 'cancelled',
    },
  ])('says $expected for $caseName', ({ overrides, expected }) => {
    expect(getSeatState({ ...GROUP, ...overrides } as RoomSession, NOW)).toBe(expected);
  });
});
