import { countSessionsInCurrentWeek } from './weekly-progress';

const TIME_ZONE = 'Europe/Madrid';
// Martes 29 de septiembre de 2026.
const NOW = new Date('2026-09-29T10:00:00Z');

describe('countSessionsInCurrentWeek', () => {
  it.each([
    ['monday of this week', '2026-09-28T07:00:00Z', 1],
    ['sunday night of this week', '2026-10-04T21:30:00Z', 1],
    ['the previous sunday', '2026-09-27T10:00:00Z', 0],
    ['the next monday', '2026-10-05T07:00:00Z', 0],
    ['sunday 00:30 local, which is still saturday in UTC', '2026-10-03T22:30:00Z', 1],
  ])('counts %s as %i', (_caseName, startsAtIso, expectedCount) => {
    expect(countSessionsInCurrentWeek([startsAtIso], NOW, TIME_ZONE)).toBe(expectedCount);
  });

  it('adds up several sessions', () => {
    expect(
      countSessionsInCurrentWeek(
        ['2026-09-28T07:00:00Z', '2026-09-30T07:00:00Z', '2026-09-20T07:00:00Z'],
        NOW,
        TIME_ZONE,
      ),
    ).toBe(2);
  });
});
