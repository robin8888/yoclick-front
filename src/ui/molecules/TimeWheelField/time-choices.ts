const MINUTES_PER_HOUR = 60;
const LAST_HOUR_OF_DAY = 23;
const LAST_MINUTE_OF_HOUR = 59;
const LAST_MINUTE_OF_DAY = LAST_HOUR_OF_DAY * MINUTES_PER_HOUR + LAST_MINUTE_OF_HOUR;
const TWO_DIGITS = 2;
const DEFAULT_STEP_MINUTES = 5;

function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * MINUTES_PER_HOUR + Number(minutes);
}

function pad(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

function toTime(totalMinutes: number): string {
  return `${pad(Math.floor(totalMinutes / MINUTES_PER_HOUR))}:${pad(totalMinutes % MINUTES_PER_HOUR)}`;
}

export interface TimeRangeLimits {
  /** La hora más temprana que se puede elegir; sin ella, las 00:00. */
  minTime?: string | undefined;
  /** La hora más tardía que se puede elegir; sin ella, las 23:59. */
  maxTime?: string | undefined;
  /** De cuántos en cuántos minutos van las opciones. */
  stepMinutes?: number | undefined;
}

/** Todas las horas «HH:MM» que se pueden elegir entre los límites, de `stepMinutes` en `stepMinutes`. */
export function listTimeChoices(limits: TimeRangeLimits = {}): string[] {
  const step = limits.stepMinutes ?? DEFAULT_STEP_MINUTES;
  const first = Math.ceil(toMinutes(limits.minTime ?? '00:00') / step) * step;
  const last = Math.min(toMinutes(limits.maxTime ?? '23:59'), LAST_MINUTE_OF_DAY);
  const choices: string[] = [];
  for (let minutes = first; minutes <= last; minutes += step) choices.push(toTime(minutes));
  return choices;
}

/** La hora elegible más cercana por encima de `time`; si no queda ninguna, la última. */
export function snapToChoice(time: string, choices: readonly string[]): string | null {
  const minutes = toMinutes(time);
  const upcoming = choices.find((choice) => toMinutes(choice) >= minutes);
  return upcoming ?? choices.at(-1) ?? null;
}

/** Las horas («09», «10»…) que tienen alguna opción. */
export function listHourChoices(choices: readonly string[]): string[] {
  return [...new Set(choices.map((choice) => choice.slice(0, TWO_DIGITS)))];
}

/** Los minutos («00», «15»…) elegibles dentro de una hora. */
export function listMinuteChoices(choices: readonly string[], hour: string): string[] {
  return choices
    .filter((choice) => choice.startsWith(`${hour}:`))
    .map((choice) => choice.slice(TWO_DIGITS + 1));
}

/** La hora desplazada `minutes` minutos (negativos hacia atrás), sin salir del día. */
export function shiftTime(time: string, minutes: number): string {
  const shifted = Math.min(Math.max(toMinutes(time) + minutes, 0), LAST_MINUTE_OF_DAY);
  return toTime(shifted);
}
