import {
  describeSeriesDays,
  describeSeriesName,
  describeSeriesPeriod,
  describeSeriesPlace,
  listSeriesOfWeekday,
  summarizeEnrollResult,
  summarizeSkippedOccurrences,
  type ScheduleSeries,
} from './schedule-summary';

function buildSeries(overrides: Partial<ScheduleSeries>): ScheduleSeries {
  return {
    seriesId: 'series-1',
    label: null,
    mode: 'group',
    capacity: 12,
    status: 'active',
    startsOn: '2026-10-12',
    endsOn: null,
    service: { id: 'service-english', name: 'Inglés B1', color: null },
    staff: { membershipId: 'staff-ana', fullName: 'Ana Ruiz' },
    room: { id: 'room-2', name: 'Aula 2' },
    days: [
      { scheduleId: 'd-thu', weekday: 4, startsAtTime: '18:00', endsAtTime: '19:30' },
      { scheduleId: 'd-mon', weekday: 1, startsAtTime: '18:00', endsAtTime: '19:30' },
    ],
    enrolledCount: 8,
    ...overrides,
  };
}

describe('describeSeriesDays', () => {
  it.each([
    [
      'one day',
      [{ scheduleId: 'a', weekday: 3, startsAtTime: '10:00', endsAtTime: '11:00' }],
      'mié · 10:00–11:00',
    ],
    ['two days', buildSeries({}).days, 'lun y jue · 18:00–19:30'],
    [
      'three days',
      [
        { scheduleId: 'a', weekday: 5, startsAtTime: '09:00', endsAtTime: '10:00' },
        { scheduleId: 'b', weekday: 1, startsAtTime: '09:00', endsAtTime: '10:00' },
        { scheduleId: 'c', weekday: 3, startsAtTime: '09:00', endsAtTime: '10:00' },
      ],
      'lun, mié y vie · 09:00–10:00',
    ],
  ])('describes %s', (_caseName, days, expected) => {
    expect(describeSeriesDays(buildSeries({ days }))).toBe(expected);
  });
});

describe('series descriptions', () => {
  it('names the series by its label or, without one, by its service', () => {
    expect(describeSeriesName(buildSeries({}))).toBe('Inglés B1');
    expect(describeSeriesName(buildSeries({ label: 'Grupo de tarde' }))).toBe('Grupo de tarde');
  });

  it('describes the place, the teacher, the mode and the seats', () => {
    expect(describeSeriesPlace(buildSeries({}))).toBe(
      'Aula 2 · Ana Ruiz · En grupo · 8 de 12 matriculados',
    );
    expect(
      describeSeriesPlace(
        buildSeries({ room: null, mode: 'private', capacity: 1, enrolledCount: 1 }),
      ),
    ).toBe('Sin espacio · Ana Ruiz · Privado · 1 de 1 matriculados');
  });

  it('describes an open period and a closed one', () => {
    expect(describeSeriesPeriod({ startsOn: '2026-10-12', endsOn: null })).toBe('desde 12/10/2026');
    expect(describeSeriesPeriod({ startsOn: '2026-10-12', endsOn: '2026-12-20' })).toBe(
      'del 12/10/2026 al 20/12/2026',
    );
  });
});

describe('listSeriesOfWeekday', () => {
  it('keeps only the days of that weekday, earliest first', () => {
    const late = buildSeries({ seriesId: 'late', label: 'Tarde' });
    const early = buildSeries({
      seriesId: 'early',
      label: 'Mañana',
      days: [{ scheduleId: 'm', weekday: 1, startsAtTime: '09:00', endsAtTime: '10:00' }],
    });
    const weekend = buildSeries({
      seriesId: 'weekend',
      days: [{ scheduleId: 's', weekday: 6, startsAtTime: '09:00', endsAtTime: '10:00' }],
    });

    const monday = listSeriesOfWeekday([late, early, weekend], 1);

    expect(monday.map(({ series, day }) => [series.seriesId, day.startsAtTime])).toEqual([
      ['early', '09:00'],
      ['late', '18:00'],
    ]);
  });
});

describe('summaries of what the server skipped', () => {
  it('lists each skipped session with its reason', () => {
    expect(
      summarizeSkippedOccurrences([
        { date: '2026-10-25', startsAtTime: '18:00', reason: 'holiday' },
        { date: '2026-11-02', startsAtTime: '18:00', reason: 'conflict' },
      ]),
    ).toEqual([
      '25/10/2026 18:00 · cierre del centro',
      '02/11/2026 18:00 · espacio o profesor ocupados',
    ]);
  });

  it('counts who entered, says who did not and why, and counts the days with another appointment', () => {
    const lines = summarizeEnrollResult({
      result: {
        enrollments: [
          {
            id: 'e1',
            client: { membershipId: 'c1', fullName: 'Marta Ruiz' },
            startsOn: '2026-10-12',
            endsOn: null,
            status: 'active',
            createdAt: '2026-10-12T10:00:00.000Z',
          },
        ],
        skipped: [{ clientMembershipId: 'c2', reason: 'already_enrolled' }],
        skippedDates: [
          { clientMembershipId: 'c1', date: '2026-10-19' },
          { clientMembershipId: 'c1', date: '2026-10-26' },
        ],
      },
      namesByMembershipId: { c1: 'Marta Ruiz', c2: 'Luis Pardo' },
    });

    expect(lines).toEqual([
      '1 persona matriculada',
      'Luis Pardo: ya estaba en el grupo',
      '2 días con otra cita: esos días no entra',
    ]);
  });
});
