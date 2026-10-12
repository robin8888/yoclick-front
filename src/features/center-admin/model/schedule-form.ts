import { z } from 'zod';

import type {
  CreateScheduleSeriesRequestDto,
  RoomListResponseDtoRoomsItem,
  ServiceListResponseDtoServicesItem,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { minutesToTime, timeToMinutes, TIME_STEP_MINUTES } from './opening-hours-draft';
import type { WeekDay } from './opening-hours-summary';

export type ScheduleMode = 'private' | 'group';

const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;
const SUNDAY = 7;

/** 1 = lunes … 7 = domingo, como en el servidor. */
export const SCHEDULE_WEEKDAYS = [
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
] as const;
export type ScheduleWeekday = (typeof SCHEDULE_WEEKDAYS)[number];
const WEEKDAY_KEYS: Record<ScheduleWeekday, WeekDay> = {
  [MONDAY]: 'mon',
  [TUESDAY]: 'tue',
  [WEDNESDAY]: 'wed',
  [THURSDAY]: 'thu',
  [FRIDAY]: 'fri',
  [SATURDAY]: 'sat',
  [SUNDAY]: 'sun',
};

// Mismos límites que `CreateScheduleSeriesRequestDto` (docs/api/openapi.yaml).
const MAX_LABEL_LENGTH = 80;
const MIN_CAPACITY = 1;
const MAX_CAPACITY = 500;
const MIN_WEEKDAY = MONDAY;
const MAX_WEEKDAY = SUNDAY;
const LAST_HOUR_OF_DAY = 23;
const LAST_STEP_MINUTES = 30;
const MINUTES_PER_HOUR = 60;
/** El servidor solo admite horas de 00:00 a 23:59: el último paso es 23:30. */
const LAST_TIME_MINUTES = LAST_HOUR_OF_DAY * MINUTES_PER_HOUR + LAST_STEP_MINUTES;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const DEFAULT_STARTS_AT_TIME = '18:00';
const DEFAULT_ENDS_AT_TIME = '19:00';

/** Valores «vacíos»: sin espacio, el profesor fijo del espacio, el aforo del espacio o sin fin. */
export const NO_ROOM_VALUE = '';
export const ROOM_TEACHER_VALUE = '';
export const ROOM_CAPACITY_VALUE = '';
export const NO_END_VALUE = '';

export function toScheduleWeekday(weekday: number): ScheduleWeekday | null {
  return SCHEDULE_WEEKDAYS.find((candidate) => candidate === weekday) ?? null;
}

/** «Lunes». */
export function describeWeekday(weekday: ScheduleWeekday): string {
  return i18n.t(`centerAdmin.weekDays.${WEEKDAY_KEYS[weekday]}`);
}

/** «lun». */
export function describeWeekdayShort(weekday: ScheduleWeekday): string {
  return i18n.t(`centerAdmin.schedules.weekdayShort.${WEEKDAY_KEYS[weekday]}`);
}

/** «L». */
export function describeWeekdayInitial(weekday: ScheduleWeekday): string {
  return i18n.t(`centerAdmin.schedules.weekdayInitial.${WEEKDAY_KEYS[weekday]}`);
}

export function isValidCapacityText(text: string): boolean {
  const capacity = Number(text);
  return Number.isInteger(capacity) && capacity >= MIN_CAPACITY && capacity <= MAX_CAPACITY;
}

export function isTimeRangeOrdered(startsAtTime: string, endsAtTime: string): boolean {
  return timeToMinutes(startsAtTime) < timeToMinutes(endsAtTime);
}

export const scheduleFormSchema = z
  .object({
    serviceId: z.string().min(1, { error: () => i18n.t('centerAdmin.schedules.serviceRequired') }),
    weekdays: z
      .array(z.number().int().min(MIN_WEEKDAY).max(MAX_WEEKDAY))
      .min(1, { error: () => i18n.t('centerAdmin.schedules.weekdaysRequired') }),
    startsAtTime: z.string().regex(TIME_PATTERN),
    endsAtTime: z.string().regex(TIME_PATTERN),
    /** `NO_ROOM_VALUE` = sin espacio (centros sin salas). */
    roomId: z.string(),
    /** `ROOM_TEACHER_VALUE` = el profesor fijo del espacio. */
    staffMembershipId: z.string(),
    mode: z.enum(['private', 'group']),
    /** `ROOM_CAPACITY_VALUE` = el aforo del espacio. */
    capacity: z
      .string()
      .trim()
      .refine((text) => text === ROOM_CAPACITY_VALUE || isValidCapacityText(text), {
        error: () => i18n.t('centerAdmin.schedules.capacityInvalid'),
      }),
    startsOn: z
      .string()
      .regex(ISO_DATE_PATTERN, { error: () => i18n.t('centerAdmin.schedules.startsOnRequired') }),
    /** `NO_END_VALUE` = sin fecha de fin. */
    endsOn: z.string().refine((text) => text === NO_END_VALUE || ISO_DATE_PATTERN.test(text), {
      error: () => i18n.t('centerAdmin.schedules.endsOnInvalid'),
    }),
    label: z
      .string()
      .trim()
      .max(MAX_LABEL_LENGTH, { error: () => i18n.t('centerAdmin.schedules.labelTooLong') }),
  })
  .refine((form) => isTimeRangeOrdered(form.startsAtTime, form.endsAtTime), {
    error: () => i18n.t('centerAdmin.schedules.timeOrder'),
    path: ['endsAtTime'],
  })
  .refine((form) => form.endsOn === NO_END_VALUE || form.endsOn >= form.startsOn, {
    error: () => i18n.t('centerAdmin.schedules.periodOrder'),
    path: ['endsOn'],
  });
export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export function buildEmptyScheduleForm(todayIsoDate: string): ScheduleFormValues {
  return {
    serviceId: '',
    weekdays: [],
    startsAtTime: DEFAULT_STARTS_AT_TIME,
    endsAtTime: DEFAULT_ENDS_AT_TIME,
    roomId: NO_ROOM_VALUE,
    staffMembershipId: ROOM_TEACHER_VALUE,
    mode: 'group',
    capacity: ROOM_CAPACITY_VALUE,
    startsOn: todayIsoDate,
    endsOn: NO_END_VALUE,
    label: '',
  };
}

export function mapScheduleFormToCreateRequest(
  formValues: ScheduleFormValues,
): CreateScheduleSeriesRequestDto {
  return {
    serviceId: formValues.serviceId,
    weekdays: [...formValues.weekdays].sort((first, second) => first - second),
    startsAtTime: formValues.startsAtTime,
    endsAtTime: formValues.endsAtTime,
    mode: formValues.mode,
    startsOn: formValues.startsOn,
    endsOn: formValues.endsOn === NO_END_VALUE ? null : formValues.endsOn,
    ...(formValues.roomId === NO_ROOM_VALUE ? {} : { roomId: formValues.roomId }),
    ...(formValues.staffMembershipId === ROOM_TEACHER_VALUE
      ? {}
      : { staffMembershipId: formValues.staffMembershipId }),
    ...(formValues.capacity === ROOM_CAPACITY_VALUE
      ? {}
      : { capacity: Number(formValues.capacity) }),
    ...(formValues.label === '' ? {} : { label: formValues.label }),
  };
}

export function toggleWeekday(weekdays: readonly number[], weekday: ScheduleWeekday): number[] {
  return weekdays.includes(weekday)
    ? weekdays.filter((candidate) => candidate !== weekday)
    : [...weekdays, weekday];
}

/** La hora movida 30 minutos adelante (`1`) o atrás (`-1`), sin salir del día. */
export function stepTime(time: string, direction: 1 | -1): string {
  const steppedMinutes = timeToMinutes(time) + direction * TIME_STEP_MINUTES;
  return minutesToTime(Math.min(Math.max(steppedMinutes, 0), LAST_TIME_MINUTES));
}

/** Los modos que admite el servicio: solo privado, solo grupo, o los dos (por defecto, los dos). */
export function listAllowedModes(
  serviceMode: ServiceListResponseDtoServicesItem['mode'] | undefined,
): ScheduleMode[] {
  if (serviceMode === 'private') return ['private'];
  if (serviceMode === 'group') return ['group'];
  return ['private', 'group'];
}

/** Los espacios donde se puede programar un servicio: sin servicio fijo, o con ese mismo. */
export function listCompatibleRooms(
  rooms: readonly RoomListResponseDtoRoomsItem[],
  serviceId: string,
): RoomListResponseDtoRoomsItem[] {
  return rooms.filter((room) => room.fixedService === null || room.fixedService.id === serviceId);
}

interface ServiceChoiceRequest {
  formValues: Pick<ScheduleFormValues, 'mode' | 'roomId'>;
  service: ServiceListResponseDtoServicesItem;
  rooms: readonly RoomListResponseDtoRoomsItem[];
}

/**
 * Lo que cambia al elegir un servicio: el modo si el servicio no lo admite, y el espacio si ya no
 * es compatible (así el formulario nunca envía una combinación que el servidor rechazaría).
 */
export function applyServiceChoice({
  formValues,
  service,
  rooms,
}: ServiceChoiceRequest): Pick<ScheduleFormValues, 'serviceId' | 'mode' | 'roomId'> {
  const allowedModes = listAllowedModes(service.mode);
  const isRoomCompatible = listCompatibleRooms(rooms, service.id).some(
    (room) => room.id === formValues.roomId,
  );
  return {
    serviceId: service.id,
    mode: allowedModes.includes(formValues.mode) ? formValues.mode : (allowedModes[0] ?? 'group'),
    roomId: isRoomCompatible ? formValues.roomId : NO_ROOM_VALUE,
  };
}
