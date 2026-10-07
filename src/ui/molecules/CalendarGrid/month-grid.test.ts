import { addMonths, buildMonthWeeks, readMonthOfIsoDate } from './month-grid';

describe('buildMonthWeeks', () => {
  it('starts the weeks on Monday and fills the gaps with nulls', () => {
    // Noviembre de 2026 empieza en domingo: seis huecos antes del día 1.
    const [firstWeek, secondWeek] = buildMonthWeeks({ year: 2026, month: 11 });

    expect(firstWeek).toEqual([null, null, null, null, null, null, '2026-11-01']);
    expect(secondWeek?.[0]).toBe('2026-11-02');
  });

  it.each([
    [{ year: 2026, month: 2 }, 28],
    [{ year: 2028, month: 2 }, 29],
    [{ year: 2026, month: 12 }, 31],
  ])('has every day of %j once', (monthRef, dayCount) => {
    const days = buildMonthWeeks(monthRef)
      .flat()
      .filter((cell) => cell !== null);

    expect(days).toHaveLength(dayCount);
  });

  it('always returns weeks of seven cells', () => {
    for (const week of buildMonthWeeks({ year: 2026, month: 3 })) expect(week).toHaveLength(7);
  });
});

describe('addMonths', () => {
  it.each([
    [{ year: 2026, month: 12 }, 1, { year: 2027, month: 1 }],
    [{ year: 2026, month: 1 }, -1, { year: 2025, month: 12 }],
    [{ year: 2026, month: 5 }, 0, { year: 2026, month: 5 }],
    [{ year: 2026, month: 5 }, 14, { year: 2027, month: 7 }],
  ])('moves %j by %i months', (start, delta, expected) => {
    expect(addMonths(start, delta)).toEqual(expected);
  });
});

describe('readMonthOfIsoDate', () => {
  it('reads the month of an ISO date', () => {
    expect(readMonthOfIsoDate('2026-11-23')).toEqual({ year: 2026, month: 11 });
  });

  it('is null for anything else', () => {
    expect(readMonthOfIsoDate('23/11/2026')).toBeNull();
  });
});
