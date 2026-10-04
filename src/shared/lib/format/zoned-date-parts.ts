export interface ZonedDateParts {
  readonly year: number;
  /** 1-12 */
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  /** 0 = domingo … 6 = sábado */
  readonly weekdayIndex: number;
}

export type DateInput = Date | string;

type NumericPartType = 'year' | 'month' | 'day' | 'hour' | 'minute';

const ZONED_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  // h23 evita el «24:00» de medianoche que devuelve hour12: false en algunos motores.
  hourCycle: 'h23',
};

function toValidDate(dateInput: DateInput): Date {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid date');
  return date;
}

function calculateWeekdayIndex(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function readNumericPart(parts: Intl.DateTimeFormatPart[], partType: NumericPartType): number {
  return Number(parts.find((part) => part.type === partType)?.value);
}

/**
 * Descompone una fecha en la zona del centro (`center.timezone`), no en la del móvil: una cita
 * a las 18:00 en Madrid debe verse a las 18:00 aunque el cliente viaje. Solo se usa `Intl` para
 * convertir la zona; los nombres de día y mes los pone la app (resultado igual en todos los motores).
 */
export function getZonedDateParts(dateInput: DateInput, timeZone?: string): ZonedDateParts {
  const date = toValidDate(dateInput);
  if (timeZone === undefined) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      weekdayIndex: date.getDay(),
    };
  }
  const formattedParts = new Intl.DateTimeFormat('en-US', {
    ...ZONED_DATE_FORMAT_OPTIONS,
    timeZone,
  }).formatToParts(date);
  const year = readNumericPart(formattedParts, 'year');
  const month = readNumericPart(formattedParts, 'month');
  const day = readNumericPart(formattedParts, 'day');
  return {
    year,
    month,
    day,
    hour: readNumericPart(formattedParts, 'hour'),
    minute: readNumericPart(formattedParts, 'minute'),
    weekdayIndex: calculateWeekdayIndex(year, month, day),
  };
}
