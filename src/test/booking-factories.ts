import type {
  AvailabilityResponseDto,
  BookingResponseDto,
  ServiceListResponseDtoServicesItem,
} from '@/shared/api/generated/model';

export const SERVICE_ID = '0191d6a0-0000-7000-8000-0000000000a1';
export const STAFF_MEMBERSHIP_ID = '0191d6a0-0000-7000-8000-0000000000b1';
export const BOOKING_ID = '0191d6a0-0000-7000-8000-0000000000c1';

export function buildService(
  overrides: Partial<ServiceListResponseDtoServicesItem> = {},
): ServiceListResponseDtoServicesItem {
  return {
    id: SERVICE_ID,
    name: 'Entrenamiento personal',
    description: null,
    kind: 'individual',
    durationMinutes: 60,
    priceCents: 3500,
    currency: 'EUR',
    color: null,
    bookingWindowDays: 30,
    minNoticeMinutes: 120,
    isVisible: true,
    room: null,
    staff: [{ membershipId: STAFF_MEMBERSHIP_ID, fullName: 'Álex Moreno' }],
    ...overrides,
  };
}

export function buildBooking(overrides: Partial<BookingResponseDto> = {}): BookingResponseDto {
  return {
    id: BOOKING_ID,
    status: 'confirmed',
    startsAt: '2026-10-08T16:00:00.000Z',
    endsAt: '2026-10-08T17:00:00.000Z',
    service: { id: SERVICE_ID, name: 'Entrenamiento personal', durationMinutes: 60, color: null },
    staff: { membershipId: STAFF_MEMBERSHIP_ID, fullName: 'Álex Moreno' },
    cancelledAt: null,
    cancelWithinPolicy: null,
    startedAt: null,
    endedAt: null,
    actualDurationSeconds: null,
    createdAt: '2026-10-05T10:00:00.000Z',
    ...overrides,
  };
}

export function buildAvailability(): AvailabilityResponseDto {
  return {
    timezone: 'Europe/Madrid',
    days: [
      { date: '2026-10-07', slots: [] },
      {
        date: '2026-10-08',
        slots: [
          {
            startsAt: '2026-10-08T07:00:00.000Z',
            endsAt: '2026-10-08T08:00:00.000Z',
            staffMembershipId: STAFF_MEMBERSHIP_ID,
            staffName: 'Álex Moreno',
          },
          {
            startsAt: '2026-10-08T16:00:00.000Z',
            endsAt: '2026-10-08T17:00:00.000Z',
            staffMembershipId: STAFF_MEMBERSHIP_ID,
            staffName: 'Álex Moreno',
          },
        ],
      },
    ],
  };
}
