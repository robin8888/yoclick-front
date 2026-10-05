import type {
  AgendaResponseDto,
  AgendaResponseDtoEntriesItem,
  SessionRecordsResponseDto,
} from '@/shared/api/generated/model';

import { buildBooking, BOOKING_ID } from './booking-factories';

const MINUTE_MS = 60_000;
export const CLIENT_MEMBERSHIP_ID = '0191d6a0-0000-7000-8000-0000000000d1';

type BookingOverrides = Parameters<typeof buildBooking>[0];

export function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * MINUTE_MS).toISOString();
}

/** Una cita de 60 minutos que empieza dentro de `startsInMinutes` (negativo = ya empezó). */
export function buildAgendaEntry(
  startsInMinutes: number,
  overrides: BookingOverrides = {},
): AgendaResponseDtoEntriesItem {
  return {
    booking: buildBooking({
      id: BOOKING_ID,
      startsAt: minutesFromNow(startsInMinutes),
      endsAt: minutesFromNow(startsInMinutes + 60),
      ...overrides,
    }),
    client: { membershipId: CLIENT_MEMBERSHIP_ID, fullName: 'Lucía Torres' },
  };
}

export function buildAgenda(entries: AgendaResponseDtoEntriesItem[]): AgendaResponseDto {
  return { date: '2026-10-08', timezone: 'Europe/Madrid', entries };
}

export function buildSessionRecords(): SessionRecordsResponseDto {
  const closedBooking = buildBooking({
    status: 'attended',
    startedAt: '2026-10-08T16:01:00.000Z',
    endedAt: '2026-10-08T17:05:00.000Z',
    actualDurationSeconds: 3840,
  });
  return {
    timezone: 'Europe/Madrid',
    records: [
      {
        booking: closedBooking,
        client: { membershipId: CLIENT_MEMBERSHIP_ID, fullName: 'Lucía Torres' },
        staff: closedBooking.staff,
        plannedDurationSeconds: 3600,
        actualDurationSeconds: 3840,
        isOpen: false,
        notes: null,
      },
    ],
    totals: [
      {
        staffMembershipId: closedBooking.staff.membershipId,
        staffName: 'Álex Moreno',
        classCount: 1,
        plannedSeconds: 3600,
        actualSeconds: 3840,
        openCount: 2,
      },
    ],
  };
}
