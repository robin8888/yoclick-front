import { buildDayOptions, resolveSelectedDate } from './day-options';

const SERVER_DAYS = [
  { date: '2026-10-05', slots: [] },
  { date: '2026-10-06', slots: [{}, {}] },
  { date: 'no-es-fecha', slots: [{}] },
  { date: '2026-10-07', slots: [{}] },
];

describe('buildDayOptions', () => {
  it('labels the server days, marks the ones with slots and drops unreadable dates', () => {
    const days = buildDayOptions(SERVER_DAYS);

    expect(days.map((day) => [day.isoDate, day.hasSlots])).toEqual([
      ['2026-10-05', false],
      ['2026-10-06', true],
      ['2026-10-07', true],
    ]);
  });
});

describe('resolveSelectedDate', () => {
  it('keeps the day the person chose', () => {
    expect(resolveSelectedDate('2026-10-07', buildDayOptions(SERVER_DAYS))).toBe('2026-10-07');
  });

  it('falls back to the first day with slots', () => {
    expect(resolveSelectedDate(null, buildDayOptions(SERVER_DAYS))).toBe('2026-10-06');
  });

  it('is null when no day has slots', () => {
    expect(
      resolveSelectedDate(null, buildDayOptions([{ date: '2026-10-05', slots: [] }])),
    ).toBeNull();
  });
});
