import type { ScheduleSeries } from './schedule-summary';
import {
  getEndOfWeeks,
  getWeekEnd,
  getWeekStart,
  listSeriesBoundToWeek,
  listSeriesOfWeek,
  shiftWeek,
} from './schedule-week';

function buildSeries(overrides: Partial<ScheduleSeries>): ScheduleSeries {
  return {
    seriesId: 'series',
    status: 'active',
    startsOn: '2026-10-12',
    endsOn: null,
    ...overrides,
  } as ScheduleSeries;
}

describe('weeks', () => {
  it.each([
    ['a Wednesday', '2026-10-14', '2026-10-12'],
    ['the Monday itself', '2026-10-12', '2026-10-12'],
    ['a Sunday', '2026-10-18', '2026-10-12'],
  ])('finds the Monday of %s', (_caseName, isoDate, expected) => {
    expect(getWeekStart(isoDate)).toBe(expected);
  });

  it('knows the Sunday of a week and moves a week back and forward', () => {
    expect(getWeekEnd('2026-10-12')).toBe('2026-10-18');
    expect(shiftWeek('2026-10-12', 1)).toBe('2026-10-19');
    expect(shiftWeek('2026-10-12', -1)).toBe('2026-10-05');
  });
});

describe('series of a week', () => {
  const OPEN_ENDED = buildSeries({ seriesId: 'open', startsOn: '2026-09-01', endsOn: null });
  const THIS_WEEK_ONLY = buildSeries({
    seriesId: 'only-this-week',
    startsOn: '2026-10-12',
    endsOn: '2026-10-18',
  });
  const NEXT_WEEK_ONLY = buildSeries({
    seriesId: 'only-next-week',
    startsOn: '2026-10-19',
    endsOn: '2026-10-25',
  });
  const ENDED = buildSeries({ seriesId: 'ended', status: 'ended', startsOn: '2026-10-12' });
  const ALL = [OPEN_ENDED, THIS_WEEK_ONLY, NEXT_WEEK_ONLY, ENDED];

  it('lists what happens in that week, repeating and week-only alike, and not what ended', () => {
    expect(listSeriesOfWeek(ALL, '2026-10-12').map(({ seriesId }) => seriesId)).toEqual([
      'open',
      'only-this-week',
    ]);
  });

  it('lists only the ones set up for that week as the ones that can be copied', () => {
    expect(listSeriesBoundToWeek(ALL, '2026-10-12').map(({ seriesId }) => seriesId)).toEqual([
      'only-this-week',
    ]);
  });
});

describe('getEndOfWeeks', () => {
  it.each([
    { caseName: 'this week only', startsOn: '2026-10-14', weekCount: 1, expected: '2026-10-18' },
    { caseName: 'two weeks', startsOn: '2026-10-14', weekCount: 2, expected: '2026-10-25' },
    {
      caseName: 'four weeks from a Sunday',
      startsOn: '2026-10-18',
      weekCount: 4,
      expected: '2026-11-08',
    },
  ])('ends $caseName on the Sunday of the last week', ({ startsOn, weekCount, expected }) => {
    expect(getEndOfWeeks(startsOn, weekCount)).toBe(expected);
  });
});
