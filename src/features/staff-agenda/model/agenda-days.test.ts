import { buildAgendaDays } from './agenda-days';

describe('buildAgendaDays', () => {
  it('lists two weeks from today with short and full labels', () => {
    const days = buildAgendaDays('2026-09-29');

    expect(days).toHaveLength(14);
    expect(days[0]).toEqual({
      isoDate: '2026-09-29',
      weekdayLabel: 'Mar',
      dayLabel: '29',
      fullLabel: 'martes 29 de septiembre',
    });
    expect(days[1]).toMatchObject({ isoDate: '2026-09-30', weekdayLabel: 'Mié' });
    expect(days[2]).toMatchObject({ isoDate: '2026-10-01', weekdayLabel: 'Jue', dayLabel: '1' });
  });

  it('crosses the end of the year', () => {
    const days = buildAgendaDays('2026-12-30', 4);

    expect(days.map(({ isoDate }) => isoDate)).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
  });
});
