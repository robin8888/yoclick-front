import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';

/** Los mismos 60 minutos que acepta la API para registrar la llegada. */
export const EARLY_ATTENDANCE_MINUTES = 60;
const MILLISECONDS_PER_MINUTE = 60_000;

export interface SessionAttendee {
  bookingId: string;
  fullName: string;
  photoUrl: string | null;
  isEnrollment: boolean;
  /** Ya se confirmó que vino (QR o check): no se puede deshacer, el bono ya se descontó. */
  isConfirmed: boolean;
  isCancelled: boolean;
}

/** Las personas de una clase, en el orden de la agenda y sin las que cancelaron. */
export function listSessionAttendees(
  entries: readonly AgendaResponseDtoEntriesItem[],
  sessionId: string,
): SessionAttendee[] {
  return entries
    .filter(({ booking }) => booking.session.id === sessionId && booking.status !== 'cancelled')
    .map(({ booking, client }) => ({
      bookingId: booking.id,
      fullName: client.fullName,
      photoUrl: client.photoUrl,
      isEnrollment: booking.source === 'enrollment',
      isConfirmed: booking.checkedInAt !== null || booking.status === 'attended',
      isCancelled: false,
    }));
}

/** Se puede confirmar desde una hora antes de que empiece; es solo para activar el check. */
export function canConfirmAttendance(startsAt: string, now: Date): boolean {
  const opensAt = new Date(startsAt).getTime() - EARLY_ATTENDANCE_MINUTES * MILLISECONDS_PER_MINUTE;
  return now.getTime() >= opensAt;
}
