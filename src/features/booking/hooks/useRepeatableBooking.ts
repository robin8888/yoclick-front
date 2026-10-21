import type {
  MyBookingsResponseDtoBookingsItem,
  ServiceSessionsResponseDto,
  ServiceSessionsResponseDtoSessionsItem,
} from '@/shared/api/generated/model';

import { listBookableDates } from '../model/booking-dates';
import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import {
  findRepeatableClass,
  findRepeatableSlot,
  pickLastRepeatableBooking,
} from '../model/repeat-booking';
import type { SlotOption } from '../model/slot-option';
import { useAvailableSlots } from './useAvailableSlots';
import { useMyBookings } from './useMyBookings';
import { useServiceSessions } from './useServiceSessions';

const REPEAT_LOOKAHEAD_DAYS = 14;

/** Lo que se ofrece repetir: una clase del centro o una hora libre de la misma persona. */
export type RepeatableBooking =
  | {
      kind: 'class';
      lastBooking: MyBookingsResponseDtoBookingsItem;
      openClass: ServiceSessionsResponseDtoSessionsItem;
    }
  | { kind: 'hour'; lastBooking: MyBookingsResponseDtoBookingsItem; slot: SlotOption };

function getLookaheadRange(): { fromDate: string; toDate: string } {
  const dates = listBookableDates({
    now: new Date(),
    dayCount: REPEAT_LOOKAHEAD_DAYS,
    timeZone: DEFAULT_CENTER_TIME_ZONE,
  });
  return { fromDate: dates[0]?.isoDate ?? '', toDate: dates[dates.length - 1]?.isoDate ?? '' };
}

interface RepeatableInputs {
  lastBooking: MyBookingsResponseDtoBookingsItem;
  sessions: ServiceSessionsResponseDto;
  upcomingBookings: readonly MyBookingsResponseDtoBookingsItem[];
  availableDays: readonly { slots: readonly SlotOption[] }[];
}

function resolveRepeatable(inputs: RepeatableInputs): RepeatableBooking | null {
  const { lastBooking, sessions, upcomingBookings } = inputs;
  const common = { lastBooking, timeZone: DEFAULT_CENTER_TIME_ZONE, now: new Date() };
  if (!sessions.isScheduled) {
    const slot = findRepeatableSlot({
      ...common,
      availableDays: inputs.availableDays,
      bookedStartsAt: new Set(upcomingBookings.map((booking) => booking.startsAt)),
    });
    return slot === null ? null : { kind: 'hour', lastBooking, slot };
  }
  const openClass = findRepeatableClass({
    ...common,
    openClasses: sessions.sessions,
    bookedClassIds: new Set(upcomingBookings.map((booking) => booking.session.id)),
  });
  return openClass === null ? null : { kind: 'class', lastBooking, openClass };
}

/** Las horas libres de la misma persona; solo se piden si el servicio se reserva por hora. */
function useLastBookingAvailableDays(
  lastBooking: MyBookingsResponseDtoBookingsItem | null,
  isByHour: boolean,
): RepeatableInputs['availableDays'] {
  const availability = useAvailableSlots({
    serviceId: lastBooking?.service.id ?? '',
    staffMembershipId: lastBooking?.staff.membershipId,
    ...getLookaheadRange(),
    isEnabled: lastBooking !== null && isByHour,
  });
  return availability.data?.days ?? [];
}

/**
 * Lo que repite la última cita de la persona (mismo servicio, día de la semana y hora): la próxima
 * clase con plazas si el servicio tiene horario de sala, o la próxima hora libre de la misma persona si
 * no lo tiene. Es null mientras carga o si no hay una igual. Nunca falla en voz alta: es un atajo.
 */
export function useRepeatableBooking(): RepeatableBooking | null {
  const upcomingBookings = useMyBookings('upcoming').data?.bookings;
  const lastBooking = pickLastRepeatableBooking(useMyBookings('past').data?.bookings ?? []);
  const sessions = useServiceSessions(lastBooking?.service.id ?? null).data;
  const availableDays = useLastBookingAvailableDays(lastBooking, sessions?.isScheduled === false);

  if (lastBooking === null || sessions === undefined || upcomingBookings === undefined) return null;
  return resolveRepeatable({ lastBooking, sessions, upcomingBookings, availableDays });
}
