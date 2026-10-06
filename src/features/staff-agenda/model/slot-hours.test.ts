import { findHourOfSlot, groupSlotsByHour } from './slot-hours';

const MADRID = 'Europe/Madrid';

describe('groupSlotsByHour', () => {
  it('groups the slots by local hour with their minutes, in order', () => {
    const groups = groupSlotsByHour(
      [
        { startsAt: '2026-10-05T08:30:00.000Z' },
        { startsAt: '2026-10-05T07:00:00.000Z' },
        { startsAt: '2026-10-05T07:15:00.000Z' },
        { startsAt: '2026-10-05T08:00:00.000Z' },
      ],
      MADRID,
    );

    expect(groups.map(({ hourLabel }) => hourLabel)).toEqual(['09', '10']);
    expect(groups[0]?.minutes.map(({ minuteLabel }) => minuteLabel)).toEqual(['00', '15']);
    expect(groups[1]?.minutes.map(({ minuteLabel }) => minuteLabel)).toEqual(['30', '00']);
  });

  it('returns nothing when there are no slots', () => {
    expect(groupSlotsByHour([], MADRID)).toEqual([]);
  });
});

describe('findHourOfSlot', () => {
  it.each([
    ['2026-10-05T08:30:00.000Z', 10],
    [null, null],
  ])('finds the local hour of %s', (startsAt, expectedHour) => {
    expect(findHourOfSlot(startsAt, MADRID)).toBe(expectedHour);
  });
});
