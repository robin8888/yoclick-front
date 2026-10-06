import {
  addRangeToDay,
  buildOpeningHoursDraft,
  findDaysWithProblems,
  isOpeningHoursChanged,
  removeRangeFromDay,
  setDayOpen,
  stepRangeTime,
  type OpeningHoursDraft,
} from './opening-hours-draft';

const PUBLISHED = buildOpeningHoursDraft({
  mon: [{ opensAt: '09:00', closesAt: '14:00' }],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
});

describe('opening hours draft', () => {
  it('builds a closed day for a day without ranges and for missing hours', () => {
    expect(PUBLISHED.tue).toEqual([]);
    expect(buildOpeningHoursDraft(null).mon).toEqual([]);
  });

  it('opens a closed day with a default morning and closes it again', () => {
    const opened = setDayOpen(PUBLISHED, 'tue', true);

    expect(opened.tue).toEqual([{ opensAt: '09:00', closesAt: '14:00' }]);
    expect(setDayOpen(opened, 'tue', false).tue).toEqual([]);
  });

  it('adds an afternoon after the last closing time, up to four ranges', () => {
    const withAfternoon = addRangeToDay(PUBLISHED, 'mon');

    expect(withAfternoon.mon[1]).toEqual({ opensAt: '14:30', closesAt: '18:30' });
    const full = [0, 1, 2].reduce((draft) => addRangeToDay(draft, 'mon'), PUBLISHED);
    expect(full.mon).toHaveLength(4);
    expect(addRangeToDay(full, 'mon')).toBe(full);
  });

  it('does not add a range to a closed day', () => {
    expect(addRangeToDay(PUBLISHED, 'tue')).toBe(PUBLISHED);
  });

  it('removes a range by position', () => {
    expect(removeRangeFromDay(addRangeToDay(PUBLISHED, 'mon'), 'mon', 0).mon).toEqual([
      { opensAt: '14:30', closesAt: '18:30' },
    ]);
  });

  it.each([
    ['opensAt', 1, '09:30'],
    ['opensAt', -1, '08:30'],
    ['closesAt', 1, '14:30'],
  ] as const)('steps %s by %i half hour', (field, direction, expectedTime) => {
    const stepped = stepRangeTime({
      draft: PUBLISHED,
      day: 'mon',
      rangeIndex: 0,
      field,
      direction,
    });

    expect(stepped.mon[0]?.[field]).toBe(expectedTime);
  });

  it('never steps before 00:00 or after 23:30', () => {
    const atMidnight = { ...PUBLISHED, mon: [{ opensAt: '00:00', closesAt: '23:30' }] };

    expect(
      stepRangeTime({
        draft: atMidnight,
        day: 'mon',
        rangeIndex: 0,
        field: 'opensAt',
        direction: -1,
      }).mon[0]?.opensAt,
    ).toBe('00:00');
    expect(
      stepRangeTime({
        draft: atMidnight,
        day: 'mon',
        rangeIndex: 0,
        field: 'closesAt',
        direction: 1,
      }).mon[0]?.closesAt,
    ).toBe('23:30');
  });

  it.each([
    ['a valid day', [{ opensAt: '09:00', closesAt: '14:00' }], []],
    ['opening after closing', [{ opensAt: '14:00', closesAt: '09:00' }], ['mon']],
    ['equal times', [{ opensAt: '09:00', closesAt: '09:00' }], ['mon']],
    [
      'overlapping ranges',
      [
        { opensAt: '09:00', closesAt: '14:00' },
        { opensAt: '13:00', closesAt: '18:00' },
      ],
      ['mon'],
    ],
    [
      'back-to-back ranges',
      [
        { opensAt: '09:00', closesAt: '14:00' },
        { opensAt: '14:00', closesAt: '18:00' },
      ],
      [],
    ],
  ])('finds problems for %s', (_caseName, ranges, expectedDays) => {
    const draft: OpeningHoursDraft = { ...PUBLISHED, mon: ranges };

    expect(findDaysWithProblems(draft)).toEqual(expectedDays);
  });

  it('knows whether the draft differs from what is published', () => {
    expect(isOpeningHoursChanged(PUBLISHED, PUBLISHED)).toBe(false);
    expect(isOpeningHoursChanged(setDayOpen(PUBLISHED, 'tue', true), PUBLISHED)).toBe(true);
  });
});
