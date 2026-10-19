import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';

import { canConfirmAttendance, listSessionAttendees } from './attendance';

function buildEntry(overrides: {
  bookingId: string;
  sessionId: string;
  name: string;
  status?: string;
  checkedInAt?: string | null;
  source?: string;
  needsNewPass?: boolean;
}): AgendaResponseDtoEntriesItem {
  return {
    booking: {
      id: overrides.bookingId,
      status: overrides.status ?? 'confirmed',
      checkedInAt: overrides.checkedInAt ?? null,
      source: overrides.source ?? 'single',
      needsNewPass: overrides.needsNewPass ?? false,
      session: { id: overrides.sessionId },
    },
    client: { membershipId: `m-${overrides.bookingId}`, fullName: overrides.name, photoUrl: null },
  } as unknown as AgendaResponseDtoEntriesItem;
}

describe('listSessionAttendees', () => {
  const entries = [
    buildEntry({ bookingId: 'b1', sessionId: 's1', name: 'Ana' }),
    buildEntry({
      bookingId: 'b2',
      sessionId: 's1',
      name: 'Luis',
      checkedInAt: '2026-10-14T10:00:00.000Z',
    }),
    buildEntry({ bookingId: 'b3', sessionId: 's1', name: 'Eva', status: 'cancelled' }),
    buildEntry({ bookingId: 'b4', sessionId: 's2', name: 'Otro' }),
    buildEntry({ bookingId: 'b5', sessionId: 's1', name: 'Leo', status: 'attended' }),
  ];

  it('lists the people of the class without the cancelled ones', () => {
    expect(listSessionAttendees(entries, 's1').map(({ fullName }) => fullName)).toEqual([
      'Ana',
      'Luis',
      'Leo',
    ]);
  });

  it('marks as confirmed those who arrived or whose class was closed', () => {
    const confirmed = listSessionAttendees(entries, 's1').map(({ isConfirmed }) => isConfirmed);
    expect(confirmed).toEqual([false, true, true]);
  });
});

describe('listSessionAttendees with a refunded pass', () => {
  it('flags the people whose booking is blocked until they have a new pass', () => {
    const entries = [
      buildEntry({ bookingId: 'b1', sessionId: 's1', name: 'Ana', needsNewPass: true }),
      buildEntry({ bookingId: 'b2', sessionId: 's1', name: 'Luis' }),
    ];

    const blocked = listSessionAttendees(entries, 's1').map((attendee) => attendee.needsNewPass);

    expect(blocked).toEqual([true, false]);
  });
});

describe('canConfirmAttendance', () => {
  const startsAt = '2026-10-14T10:00:00.000Z';

  it.each([
    ['two hours before', '2026-10-14T08:00:00.000Z', false],
    ['exactly one hour before', '2026-10-14T09:00:00.000Z', true],
    ['during the class', '2026-10-14T10:30:00.000Z', true],
    ['after the class', '2026-10-14T13:00:00.000Z', true],
  ])('%s', (_label, nowIso, isExpected) => {
    expect(canConfirmAttendance(startsAt, new Date(nowIso))).toBe(isExpected);
  });
});
