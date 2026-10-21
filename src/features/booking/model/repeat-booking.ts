import type {
  MyBookingsResponseDtoBookingsItem,
  ServiceSessionsResponseDtoSessionsItem,
} from '@/shared/api/generated/model';
import { getZonedDateParts } from '@/shared/lib/format/zoned-date-parts';

import type { SlotOption } from './slot-option';

/** Una cita ya vivida (o plantada) vale de modelo; una cancelada, no: no se eligió quedarse. */
const REPEATABLE_STATUSES: readonly MyBookingsResponseDtoBookingsItem['status'][] = [
  'attended',
  'no_show',
  'confirmed',
];

export interface FindRepeatableClassRequest {
  lastBooking: MyBookingsResponseDtoBookingsItem;
  openClasses: readonly ServiceSessionsResponseDtoSessionsItem[];
  /** Clases en las que la persona ya está apuntada: no se le ofrecen otra vez. */
  bookedClassIds: ReadonlySet<string>;
  timeZone: string;
  now: Date;
}

/** La última cita que cuenta como modelo: la más reciente que no se canceló. */
export function pickLastRepeatableBooking(
  pastBookings: readonly MyBookingsResponseDtoBookingsItem[],
): MyBookingsResponseDtoBookingsItem | null {
  const candidates = pastBookings.filter((booking) => REPEATABLE_STATUSES.includes(booking.status));
  const [latest] = [...candidates].sort((left, right) =>
    right.startsAt.localeCompare(left.startsAt),
  );
  return latest ?? null;
}

function hasSameWeekdayAndTime(startsAtIso: string, modelIso: string, timeZone: string): boolean {
  const candidate = getZonedDateParts(startsAtIso, timeZone);
  const model = getZonedDateParts(modelIso, timeZone);
  return (
    candidate.weekdayIndex === model.weekdayIndex &&
    candidate.hour === model.hour &&
    candidate.minute === model.minute
  );
}

/**
 * La próxima clase con plazas que repite la última cita: mismo día de la semana y misma hora, y si
 * hay varias, la del mismo profesor antes que otra. Sin coincidencia exacta no se ofrece nada: un
 * atajo que lleve a otra hora no ahorra toques, los gasta.
 */
export function findRepeatableClass({
  lastBooking,
  openClasses,
  bookedClassIds,
  timeZone,
  now,
}: FindRepeatableClassRequest): ServiceSessionsResponseDtoSessionsItem | null {
  const matches = openClasses
    .filter(
      (openClass) =>
        openClass.remainingSeats > 0 &&
        new Date(openClass.startsAt) > now &&
        !bookedClassIds.has(openClass.id) &&
        hasSameWeekdayAndTime(openClass.startsAt, lastBooking.startsAt, timeZone),
    )
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  const withSameTeacher = matches.find(
    (openClass) => openClass.teacher.membershipId === lastBooking.staff.membershipId,
  );
  return withSameTeacher ?? matches[0] ?? null;
}

export interface FindRepeatableSlotRequest {
  lastBooking: MyBookingsResponseDtoBookingsItem;
  /** Los días con horas libres de la misma persona, tal como los devuelve el servidor. */
  availableDays: readonly { slots: readonly SlotOption[] }[];
  /** Horas de las citas que la persona ya tiene: no se le ofrece otra igual. */
  bookedStartsAt: ReadonlySet<string>;
  timeZone: string;
  now: Date;
}

/**
 * La próxima hora libre de la misma persona, el mismo día de la semana y a la misma hora que la última
 * cita individual. Sin coincidencia exacta no se ofrece nada (igual que con las clases).
 */
export function findRepeatableSlot({
  lastBooking,
  availableDays,
  bookedStartsAt,
  timeZone,
  now,
}: FindRepeatableSlotRequest): SlotOption | null {
  const [earliestMatch] = availableDays
    .flatMap(({ slots }) => slots)
    .filter(
      (slot) =>
        slot.staffMembershipId === lastBooking.staff.membershipId &&
        new Date(slot.startsAt) > now &&
        !bookedStartsAt.has(slot.startsAt) &&
        hasSameWeekdayAndTime(slot.startsAt, lastBooking.startsAt, timeZone),
    )
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  return earliestMatch ?? null;
}
