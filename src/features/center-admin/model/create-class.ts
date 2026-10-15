import type {
  CenterSettingsResponseDtoOpeningHours,
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
  className: string;
  source: 'room' | 'teacher';
}

export type ClassRepeat = 'weekly' | 'once';

/** `endsOn` vacío: la clase se repite sin fecha de fin. */
export const NO_END_DATE = '';

/** Las franjas en que el centro está abierto cada día de la semana (1 = lunes … 7 = domingo). */
export type OpenRangesByWeekday = Readonly<
  Record<number, readonly { opensAt: string; closesAt: string }[]>
>;

const OPENING_DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/**
 * El horario del centro por día de la semana; `null` si aún no lo ha configurado (entonces no hay
 * nada que respetar). Un día sin franjas es un día cerrado.
 */
export function toOpenRangesByWeekday(
  openingHours: CenterSettingsResponseDtoOpeningHours | undefined,
): OpenRangesByWeekday | null {
  if (openingHours === null || openingHours === undefined) return null;
  return Object.fromEntries(
    OPENING_DAY_KEYS.map((day, index) => [index + 1, openingHours[day] ?? []]),
  );
}

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

/** Por qué las horas elegidas no valen. `null` en `findHoursProblem` es que valen. */
export type HoursProblem =
  | { kind: 'order' }
  | { kind: 'closed' }
  | { kind: 'outside_hours'; opensAt: string; closesAt: string }
  | { kind: 'busy'; className: string; startsAtTime: string; endsAtTime: string };

interface HoursRequest {
  startsAtTime: string;
  endsAtTime: string;
  weekdays: readonly number[];
  busy: readonly BusySlot[];
  period: Period;
  /** El horario del centro: la clase tiene que caber dentro de una franja de cada día elegido. */
  openRanges?: OpenRangesByWeekday | null;
}

function findOpeningProblem(request: HoursRequest): HoursProblem | null {
  const { openRanges } = request;
  if (openRanges === null || openRanges === undefined) return null;
  const start = timeToMinutes(request.startsAtTime);
  const end = timeToMinutes(request.endsAtTime);
  for (const weekday of request.weekdays) {
    const ranges = openRanges[weekday] ?? [];
    if (ranges.length === 0) return { kind: 'closed' };
    const isInsideRange = ranges.some(
      (range) => start >= timeToMinutes(range.opensAt) && end <= timeToMinutes(range.closesAt),
    );
    const [first] = ranges;
    const last = ranges.at(-1);
    if (!isInsideRange && first !== undefined && last !== undefined) {
      return { kind: 'outside_hours', opensAt: first.opensAt, closesAt: last.closesAt };
    }
  }
  return null;
}

function findBusyProblem(request: HoursRequest): HoursProblem | null {
  const start = timeToMinutes(request.startsAtTime);
  const end = timeToMinutes(request.endsAtTime);
  const slot = request.busy.find(
    (candidate) =>
      request.weekdays.includes(candidate.weekday) &&
      start < timeToMinutes(candidate.endsAtTime) &&
      end > timeToMinutes(candidate.startsAtTime) &&
      doPeriodsCross(request.period, candidate),
  );
  if (slot === undefined) return null;
  return {
    kind: 'busy',
    className: slot.className,
    startsAtTime: slot.startsAtTime,
    endsAtTime: slot.endsAtTime,
  };
}

/**
 * Lo que impide poner la clase en esas horas: el fin no es posterior al inicio, el centro está
 * cerrado o no abre entonces, o la sala o el profesor ya tienen otra clase. `null`: está libre.
 */
export function findHoursProblem(request: HoursRequest): HoursProblem | null {
  if (timeToMinutes(request.endsAtTime) <= timeToMinutes(request.startsAtTime)) {
    return { kind: 'order' };
  }
  if (request.weekdays.length === 0) return null;
  return findOpeningProblem(request) ?? findBusyProblem(request);
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
  /** Cada semana: hasta cuándo (`NO_END_DATE` = sin fin). Una vez: no se usa. */
  endsOn: string;
  startsAtTime: string;
  endsAtTime: string;
}

function resolveWeekdays(draft: ClassDraft, weekdayOfStartsOn: number): number[] {
  const weekdays = draft.repeat === 'once' ? [weekdayOfStartsOn] : [...draft.weekdays];
  return weekdays.sort((first, second) => first - second);
}

/** El periodo en que se da la clase: un solo día, o desde-hasta (o sin fin). */
export function resolvePeriod(draft: ClassDraft): Period {
  if (draft.repeat === 'once') return { startsOn: draft.startsOn, endsOn: draft.startsOn };
  return { startsOn: draft.startsOn, endsOn: draft.endsOn === NO_END_DATE ? null : draft.endsOn };
}

/** Un alquiler se da sin profesor: es lo único que puede faltar. */
function isTeacherMissing(draft: ClassDraft, service: { isRental: boolean }): boolean {
  return draft.staffMembershipId === null && !service.isRental;
}

function isPeriodReversed(period: Period): boolean {
  return period.endsOn !== null && period.endsOn < period.startsOn;
}

/** Con todo elegido, lo que se envía al servidor; `null` mientras falte algo. */
export function buildCreateClassRequest(
  draft: ClassDraft,
  service: Pick<ServiceListResponseDtoServicesItem, 'mode' | 'isRental'>,
  weekdayOfStartsOn: number,
): CreateScheduleSeriesRequestDto | null {
  const { roomId, serviceId, staffMembershipId } = draft;
  const weekdays = resolveWeekdays(draft, weekdayOfStartsOn);
  const period = resolvePeriod(draft);
  const isIncomplete = roomId === null || serviceId === null || isTeacherMissing(draft, service);
  if (isIncomplete || draft.startsOn === '' || weekdays.length === 0 || isPeriodReversed(period)) {
    return null;
  }
  const label = draft.label.trim();
  return {
    serviceId,
    roomId,
    ...(staffMembershipId === null ? {} : { staffMembershipId }),
    weekdays,
    startsAtTime: draft.startsAtTime,
    endsAtTime: draft.endsAtTime,
    mode: service.mode === 'private' ? 'private' : 'group',
    startsOn: period.startsOn,
    endsOn: period.endsOn,
    ...(label === '' ? {} : { label }),
  };
}
