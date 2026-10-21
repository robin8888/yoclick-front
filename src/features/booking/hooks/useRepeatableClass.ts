import type {
  MyBookingsResponseDtoBookingsItem,
  ServiceSessionsResponseDtoSessionsItem,
} from '@/shared/api/generated/model';

import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import { findRepeatableClass, pickLastRepeatableBooking } from '../model/repeat-booking';
import { useMyBookings } from './useMyBookings';
import { useServiceSessions } from './useServiceSessions';

export interface RepeatableClass {
  lastBooking: MyBookingsResponseDtoBookingsItem;
  openClass: ServiceSessionsResponseDtoSessionsItem;
}

/**
 * La clase que repite la última cita de la persona (mismo servicio, día de la semana y hora), o null
 * mientras carga o si no hay una igual con plazas. Nunca falla en voz alta: es un atajo, no un paso.
 */
export function useRepeatableClass(): RepeatableClass | null {
  const pastBookings = useMyBookings('past').data?.bookings;
  const upcomingBookings = useMyBookings('upcoming').data?.bookings;
  const lastBooking = pickLastRepeatableBooking(pastBookings ?? []);
  const sessions = useServiceSessions(lastBooking?.service.id ?? null).data;

  if (lastBooking === null || sessions === undefined || upcomingBookings === undefined) return null;
  const openClass = findRepeatableClass({
    lastBooking,
    openClasses: sessions.sessions,
    bookedClassIds: new Set(upcomingBookings.map((booking) => booking.session.id)),
    timeZone: DEFAULT_CENTER_TIME_ZONE,
    now: new Date(),
  });
  return openClass === null ? null : { lastBooking, openClass };
}
