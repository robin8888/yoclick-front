import { getZonedDateParts } from './zoned-date-parts';

const MILLISECONDS_PER_MINUTE = 60_000;

/** Lo que marca el reloj de la zona en ese instante, como si fuera UTC (sirve para medir el desfase). */
function readLocalAsUtcMilliseconds(instant: Date, timeZone: string): number {
  const parts = getZonedDateParts(instant, timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

function parseLocalDateTime(isoDate: string, time: string): number {
  const [year = 0, month = 1, day = 1] = isoDate.split('-').map(Number);
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return Date.UTC(year, month - 1, day, hours, minutes);
}

/**
 * El instante UTC de una fecha y hora locales («2026-10-25», «09:00») en la zona del centro, con el
 * mismo criterio que el servidor: una hora que no existe (el salto de marzo) se desplaza hacia
 * delante y una que ocurre dos veces (octubre) resuelve a la segunda.
 */
export function zonedDateTimeToUtc(isoDate: string, time: string, timeZone: string): Date {
  const localAsUtc = parseLocalDateTime(isoDate, time);
  const guessedOffset = readLocalAsUtcMilliseconds(new Date(localAsUtc), timeZone) - localAsUtc;
  const candidate = localAsUtc - guessedOffset;
  const candidateOffset = readLocalAsUtcMilliseconds(new Date(candidate), timeZone) - candidate;
  const resolved = candidateOffset === guessedOffset ? candidate : localAsUtc - candidateOffset;
  // Sin segundos ni milisegundos: el servidor compara tramos exactos.
  return new Date(Math.round(resolved / MILLISECONDS_PER_MINUTE) * MILLISECONDS_PER_MINUTE);
}
