import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';

import { buildDayTimeline, describeOpeningRanges, formatOccupiedTime } from './day-timeline';

function buildEntry(
  startsAt: string,
  durationMinutes: number,
  status: 'confirmed' | 'cancelled' = 'confirmed',
): AgendaResponseDtoEntriesItem {
  const endsAt = new Date(Date.parse(startsAt) + durationMinutes * 60_000).toISOString();
  return {
    booking: { id: startsAt, status, startsAt, endsAt },
    client: { membershipId: 'client', fullName: 'Marta Ruiz' },
  } as unknown as AgendaResponseDtoEntriesItem;
}

// Madrid en octubre es UTC+2: las 07:00Z son las 09:00 locales.
const MADRID = 'Europe/Madrid';
const OPEN_ALL_DAY = [{ opensAt: '08:00', closesAt: '12:00' }];

describe('buildDayTimeline', () => {
  it('puts each appointment on its hour and leaves the rest of the open hours free', () => {
    const { rows, totals } = buildDayTimeline({
      openingRanges: OPEN_ALL_DAY,
      entries: [
        buildEntry('2026-09-29T07:00:00.000Z', 60),
        buildEntry('2026-09-29T09:00:00.000Z', 60),
      ],
      timeZone: MADRID,
    });

    expect(rows.map(({ label, kind }) => [label, kind])).toEqual([
      ['08:00', 'free'],
      ['09:00', 'booked'],
      ['10:00', 'free'],
      ['11:00', 'booked'],
    ]);
    expect(totals).toEqual({ appointmentCount: 2, occupiedMinutes: 120, freeSlotCount: 2 });
  });

  it('marks the hours a long appointment covers and does not offer them as free', () => {
    const { rows, totals } = buildDayTimeline({
      openingRanges: OPEN_ALL_DAY,
      entries: [buildEntry('2026-09-29T06:00:00.000Z', 120)],
      timeZone: MADRID,
    });

    expect(rows.map(({ kind }) => kind)).toEqual(['booked', 'covered', 'free', 'free']);
    expect(totals.freeSlotCount).toBe(2);
  });

  it('shows the lunch break as closed between two opening ranges', () => {
    const { rows } = buildDayTimeline({
      openingRanges: [
        { opensAt: '08:00', closesAt: '10:00' },
        { opensAt: '12:00', closesAt: '14:00' },
      ],
      entries: [],
      timeZone: MADRID,
    });

    expect(rows.map(({ label, kind }) => [label, kind])).toEqual([
      ['08:00', 'free'],
      ['09:00', 'free'],
      ['10:00', 'closed'],
      ['11:00', 'closed'],
      ['12:00', 'free'],
      ['13:00', 'free'],
    ]);
  });

  it('ignores cancelled appointments', () => {
    const { totals } = buildDayTimeline({
      openingRanges: OPEN_ALL_DAY,
      entries: [buildEntry('2026-09-29T07:00:00.000Z', 60, 'cancelled')],
      timeZone: MADRID,
    });

    expect(totals).toEqual({ appointmentCount: 0, occupiedMinutes: 0, freeSlotCount: 4 });
  });

  it('still shows an appointment outside the opening hours and an empty day', () => {
    const outside = buildDayTimeline({
      openingRanges: [],
      entries: [buildEntry('2026-09-29T07:00:00.000Z', 60)],
      timeZone: MADRID,
    });
    const empty = buildDayTimeline({ openingRanges: [], entries: [], timeZone: MADRID });

    expect(outside.rows.map(({ kind }) => kind)).toEqual(['booked']);
    expect(empty.rows).toEqual([]);
  });
});

describe('formatOccupiedTime', () => {
  it.each([
    [330, '5,5 h'],
    [120, '2 h'],
    [45, '45 min'],
    [0, '0 min'],
  ])('%i minutes is %s', (minutes, expected) => {
    expect(formatOccupiedTime(minutes)).toBe(expected);
  });
});

describe('describeOpeningRanges', () => {
  it('joins the ranges and is null when the center is closed', () => {
    expect(describeOpeningRanges([{ opensAt: '08:00', closesAt: '20:00' }])).toBe('08:00–20:00');
    expect(
      describeOpeningRanges([
        { opensAt: '08:00', closesAt: '14:00' },
        { opensAt: '16:00', closesAt: '20:00' },
      ]),
    ).toBe('08:00–14:00 y 16:00–20:00');
    expect(describeOpeningRanges([])).toBeNull();
  });
});
