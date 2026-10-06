import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';

import {
  buildStaffAgendaColumns,
  countCancelledEntries,
  countScheduledEntries,
  formatSignedDifference,
} from './center-agenda-summary';

function buildEntry(
  staffMembershipId: string,
  startsAt: string,
  status: 'confirmed' | 'cancelled' = 'confirmed',
): AgendaResponseDtoEntriesItem {
  return {
    booking: {
      id: `${staffMembershipId}-${startsAt}`,
      status,
      startsAt,
      staff: { membershipId: staffMembershipId, fullName: `Staff ${staffMembershipId}` },
    },
    client: { fullName: 'Marta Ruiz' },
  } as unknown as AgendaResponseDtoEntriesItem;
}

const TEAM_STAFF = [
  { membershipId: 'a', fullName: 'Lucía Ferrer' },
  { membershipId: 'b', fullName: 'Álex Moreno' },
];

describe('center agenda summary', () => {
  const entries = [
    buildEntry('a', '2026-09-29T09:00:00.000Z'),
    buildEntry('a', '2026-09-29T08:00:00.000Z'),
    buildEntry('b', '2026-09-29T08:00:00.000Z', 'cancelled'),
  ];

  it('counts scheduled and cancelled entries separately', () => {
    expect(countScheduledEntries(entries)).toBe(2);
    expect(countCancelledEntries(entries)).toBe(1);
  });

  it('builds one column per team member, sorted by time and without cancelled entries', () => {
    const columns = buildStaffAgendaColumns(entries, TEAM_STAFF);

    expect(columns.map((column) => column.fullName)).toEqual(['Lucía Ferrer', 'Álex Moreno']);
    expect(columns[0]?.entries.map((entry) => entry.booking.startsAt)).toEqual([
      '2026-09-29T08:00:00.000Z',
      '2026-09-29T09:00:00.000Z',
    ]);
    expect(columns[1]?.entries).toEqual([]);
  });

  it('adds a column for a booked professional missing from the team list', () => {
    const columns = buildStaffAgendaColumns([buildEntry('z', '2026-09-29T10:00:00.000Z')], []);

    expect(columns).toHaveLength(1);
    expect(columns[0]?.membershipId).toBe('z');
  });
});

describe('formatSignedDifference', () => {
  it.each([
    [23, 19, '+4'],
    [5, 7, '-2'],
    [3, 3, '0'],
  ])('compares %i with %i as %s', (currentCount, previousCount, expected) => {
    expect(formatSignedDifference(currentCount, previousCount)).toBe(expected);
  });
});
