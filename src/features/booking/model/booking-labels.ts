import { formatEuros } from '@/shared/lib/format';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';

/**
 * Zona horaria con la que se pintan las citas mientras la API no la incluya en las reservas
 * (docs/api-requests.md). Los huecos sí traen la zona del centro y se pintan con ella.
 */
export const DEFAULT_CENTER_TIME_ZONE = 'Europe/Madrid';

const MINUTES_PER_HOUR = 60;

/** «jue 1 oct · 18:00» en la zona del centro. */
export function formatBookingDayAndTime(startsAtIso: string, timeZone: string): string {
  return `${formatShortDate(startsAtIso, timeZone)} · ${formatTime24h(startsAtIso, timeZone)}`;
}

/** 45 → «45 min», 60 → «1 h», 90 → «1 h 30 min». */
export function formatServiceDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / MINUTES_PER_HOUR);
  const minutes = durationMinutes % MINUTES_PER_HOUR;
  if (hours === 0) return `${String(minutes)} min`;
  return minutes === 0 ? `${String(hours)} h` : `${String(hours)} h ${String(minutes)} min`;
}

/** «35 €» o `null` si el servicio no tiene precio («a consultar»). */
export function formatServicePrice(priceCents: number | null): string | null {
  return priceCents === null ? null : formatEuros(priceCents);
}
