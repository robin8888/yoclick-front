import { i18n } from '@/shared/i18n';

import { describeSessionLocation, type SessionLocationFacts } from './session-location';

export interface BookingRoomFacts {
  room: { name: string } | null;
  location: SessionLocationFacts | null;
  session: { mode: 'private' | 'group'; capacity: number; bookedCount: number };
}

interface RoomDescriptionOptions {
  /** El equipo ve también cuántas plazas lleva la clase grupal; la clientela no lo necesita. */
  shouldShowSeats: boolean;
}

/**
 * «Sala Ana» o, para el equipo en una clase grupal, «Sala Ana · 3 de 10 plazas». Si la clase es
 * fuera del centro dice dónde: «Lugar: Parque del Retiro». `null` si no tiene sala ni lugar.
 */
export function describeBookingRoom(
  booking: BookingRoomFacts,
  { shouldShowSeats }: RoomDescriptionOptions,
): string | null {
  if (booking.location !== null) return describeSessionLocation(booking.location);
  if (booking.room === null) return null;
  const roomLabel = i18n.t('booking.room.label', { name: booking.room.name });
  if (!shouldShowSeats || booking.session.mode !== 'group') return roomLabel;
  const seatsLabel = i18n.t('booking.room.seats', {
    booked: booking.session.bookedCount,
    capacity: booking.session.capacity,
  });
  return `${roomLabel} · ${seatsLabel}`;
}
