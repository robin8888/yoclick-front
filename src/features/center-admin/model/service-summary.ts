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

/** «En grupo» o «Privado o en grupo»; un servicio privado (lo habitual) no añade nada. */
function describeServiceMode(mode: ServiceListResponseDtoServicesItem['mode']): string | null {
  if (mode === 'group') return i18n.t('centerAdmin.services.modeGroup');
  if (mode === 'both') return i18n.t('centerAdmin.services.modeBoth');
  return null;
}

/** «60 min · 35 €», «45 min · Gratis» o «1 h · 20 € · En grupo»: la línea de un servicio en la lista. */
export function describeServiceMeta(service: ServiceListResponseDtoServicesItem): string {
  const priceLabel =
    service.priceCents === null
      ? i18n.t('centerAdmin.services.noPrice')
      : formatEuros(service.priceCents);
  const modeLabel = describeServiceMode(service.mode);
  const baseMeta = `${formatDurationInMinutes(service.durationMinutes)} · ${priceLabel}`;
  return modeLabel === null ? baseMeta : `${baseMeta} · ${modeLabel}`;
}
