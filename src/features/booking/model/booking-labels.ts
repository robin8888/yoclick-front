import { i18n } from '@/shared/i18n';
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

export interface BookingDateTileLabels {
  weekdayLabel: string;
  dayLabel: string;
  monthLabel: string;
  /** «jue 1 oct»: lo que lee el lector de pantalla del bloque de fecha. */
  accessibleLabel: string;
}

/** «jue 1 oct» → «JUE» / «1» / «OCT», el bloque de fecha de la tarjeta de cita. */
export function buildBookingDateTileLabels(
  startsAtIso: string,
  timeZone: string,
): BookingDateTileLabels {
  const shortDate = formatShortDate(startsAtIso, timeZone);
  const [weekday = '', day = '', month = ''] = shortDate.split(' ');
  return {
    weekdayLabel: weekday.toUpperCase(),
    dayLabel: day,
    monthLabel: month.toUpperCase(),
    accessibleLabel: shortDate,
  };
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

interface ServiceMetaInput {
  durationMinutes: number;
  kind: 'individual';
  priceCents: number | null;
}

/** «60 min · Individual · 35 €» (o «Gratis» / «Precio a consultar»), la línea de datos del servicio. */
export function buildServiceMetaLabel(service: ServiceMetaInput): string {
  const priceLabel =
    service.priceCents === 0
      ? i18n.t('booking.book.free')
      : (formatServicePrice(service.priceCents) ?? i18n.t('booking.book.priceOnRequest'));
  return [
    `${String(service.durationMinutes)} min`,
    i18n.t(`booking.book.kind.${service.kind}`),
    priceLabel,
  ].join(' · ');
}
