import { formatEuros } from '@/shared/lib/format';
import { i18n } from '@/shared/i18n';
import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';

const MINUTES_PER_HOUR = 60;

export function formatDurationInMinutes(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / MINUTES_PER_HOUR);
  const minutes = durationMinutes % MINUTES_PER_HOUR;
  if (hours === 0) return `${String(minutes)} min`;
  return minutes === 0 ? `${String(hours)} h` : `${String(hours)} h ${String(minutes)} min`;
}

/** «60 min · 35 €» o «45 min · Gratis»: la línea que describe un servicio en la lista. */
export function describeServiceMeta(service: ServiceListResponseDtoServicesItem): string {
  const priceLabel =
    service.priceCents === null
      ? i18n.t('centerAdmin.services.noPrice')
      : formatEuros(service.priceCents);
  return `${formatDurationInMinutes(service.durationMinutes)} · ${priceLabel}`;
}
