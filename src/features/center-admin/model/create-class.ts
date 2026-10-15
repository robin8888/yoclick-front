import type {
  CreateScheduleSeriesRequestDto,
  ServiceListResponseDtoServicesItem,
} from '@/shared/api/generated/model';

import { minutesToTime, timeToMinutes } from './opening-hours-draft';

/** Una franja de la semana que ya ocupa una clase de la sala o del profesor. */
export interface BusySlot {
  weekday: number;
  startsAtTime: string;
  endsAtTime: string;
  startsOn: string;
  endsOn: string | null;
}

export type ClassRepeat = 'weekly' | 'once';

/** Las horas de inicio que se ofrecen, de media en media hora y dentro de un día razonable. */
const MINUTES_PER_HOUR = 60;
const GRID_STEP_MINUTES = 30;
const FIRST_START_HOUR = 6;
const LAST_END_HOUR = 22;
const FIRST_START_MINUTES = FIRST_START_HOUR * MINUTES_PER_HOUR;
const LAST_END_MINUTES = LAST_END_HOUR * MINUTES_PER_HOUR;

export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

interface Period {
  startsOn: string;
  /** `null`: sin fin. */
  endsOn: string | null;
}

function doPeriodsCross(first: Period, second: Period): boolean {
  const isBeforeOtherEnd = second.endsOn === null || first.startsOn <= second.endsOn;
  const isAfterOtherStart = first.endsOn === null || first.endsOn >= second.startsOn;
  return isBeforeOtherEnd && isAfterOtherStart;
}

interface FreeTimesRequest {
  durationMinutes: number;
  weekdays: readonly number[];
  busy: readonly BusySlot[];
  period: Period;
}

function isStartFree(startMinutes: number, request: FreeTimesRequest): boolean {
  const endMinutes = startMinutes + request.durationMinutes;
  return !request.busy.some(
    (slot) =>
      request.weekdays.includes(slot.weekday) &&
      startMinutes < timeToMinutes(slot.endsAtTime) &&
      endMinutes > timeToMinutes(slot.startsAtTime) &&
      doPeriodsCross(request.period, slot),
  );
}

/**
 * Las horas de inicio en las que la clase cabe sin pisar a otra de la misma sala o del mismo
 * profesor, en todos los días elegidos. Sin días elegidos no hay nada que ofrecer.
 */
export function listFreeStartTimes(request: FreeTimesRequest): string[] {
  if (request.weekdays.length === 0 || request.durationMinutes <= 0) return [];
  const times: string[] = [];
  for (
    let start = FIRST_START_MINUTES;
    start + request.durationMinutes <= LAST_END_MINUTES;
    start += GRID_STEP_MINUTES
  ) {
    if (isStartFree(start, request)) times.push(minutesToTime(start));
  }
  return times;
}

export interface ClassDraft {
  label: string;
  roomId: string | null;
  serviceId: string | null;
  staffMembershipId: string | null;
  repeat: ClassRepeat;
  weekdays: readonly number[];
  /** Cada semana: desde cuándo. Una vez: el día. */
  startsOn: string;
  startsAtTime: string | null;
}

function resolveWeekdays(draft: ClassDraft, weekdayOfStartsOn: number): number[] {
  const weekdays = draft.repeat === 'once' ? [weekdayOfStartsOn] : [...draft.weekdays];
  return weekdays.sort((first, second) => first - second);
}

/** Con todo elegido, lo que se envía al servidor; `null` mientras falte algo. */
export function buildCreateClassRequest(
  draft: ClassDraft,
  service: Pick<ServiceListResponseDtoServicesItem, 'durationMinutes' | 'mode'>,
  weekdayOfStartsOn: number,
): CreateScheduleSeriesRequestDto | null {
  const { roomId, serviceId, staffMembershipId, startsAtTime } = draft;
  const isIncomplete =
    roomId === null || serviceId === null || staffMembershipId === null || startsAtTime === null;
  const weekdays = resolveWeekdays(draft, weekdayOfStartsOn);
  if (isIncomplete || draft.startsOn === '' || weekdays.length === 0) return null;
  const label = draft.label.trim();
  return {
    serviceId,
    roomId,
    staffMembershipId,
    weekdays,
    startsAtTime,
    endsAtTime: addMinutesToTime(startsAtTime, service.durationMinutes),
    mode: service.mode === 'private' ? 'private' : 'group',
    startsOn: draft.startsOn,
    endsOn: draft.repeat === 'once' ? draft.startsOn : null,
    ...(label === '' ? {} : { label }),
  };
}
