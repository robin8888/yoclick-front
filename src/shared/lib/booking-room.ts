import { i18n } from '@/shared/i18n';

export interface BookingRoomFacts {
  room: { name: string } | null;
  session: { mode: 'private' | 'group'; capacity: number; bookedCount: number };
}

interface RoomDescriptionOptions {
  /** El equipo ve también cuántas plazas lleva la clase grupal; la clientela no lo necesita. */
  shouldShowSeats: boolean;
}

/**
 * «Sala Ana» o, para el equipo en una clase grupal, «Sala Ana · 3 de 10 plazas». `null` si la
 * cita no tiene sala.
 */
export function describeBookingRoom(
  booking: BookingRoomFacts,
  { shouldShowSeats }: RoomDescriptionOptions,
): string | null {
  if (booking.room === null) return null;
  const roomLabel = i18n.t('booking.room.label', { name: booking.room.name });
  if (!shouldShowSeats || booking.session.mode !== 'group') return roomLabel;
  const seatsLabel = i18n.t('booking.room.seats', {
    booked: booking.session.bookedCount,
    capacity: booking.session.capacity,
  });
  return `${roomLabel} · ${seatsLabel}`;
}
