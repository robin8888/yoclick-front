import { formatMonthTitle, getMonthIdOfDate, shiftMonthId } from './month';

describe('month ids', () => {
  it.each([
    { monthId: '2026-10', monthCount: 1, expected: '2026-11' },
    { monthId: '2026-12', monthCount: 1, expected: '2027-01' },
    { monthId: '2026-01', monthCount: -1, expected: '2025-12' },
    { monthId: '2026-03', monthCount: -14, expected: '2025-01' },
    { monthId: '2026-03', monthCount: 0, expected: '2026-03' },
    { monthId: 'no-es-un-mes', monthCount: 1, expected: 'no-es-un-mes' },
  ])('shifts $monthId by $monthCount to $expected', ({ monthId, monthCount, expected }) => {
    expect(shiftMonthId(monthId, monthCount)).toBe(expected);
  });

  it('takes the month of a date', () => {
    expect(getMonthIdOfDate('2026-10-14')).toBe('2026-10');
  });

  it('writes the month title in Spanish with a capital letter', () => {
    expect(formatMonthTitle('2026-10')).toBe('Octubre de 2026');
  });
});
