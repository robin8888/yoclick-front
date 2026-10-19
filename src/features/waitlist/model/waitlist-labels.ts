import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';

interface WaitlistStatusInput {
  status: 'waiting' | 'offered';
  position: number | null;
  offerExpiresAt: string | null;
}

/**
 * «En lista de espera · puesto 2» o «Plaza ofrecida · confirma antes del jue 22 oct 18:30». El
 * estado siempre va con palabra, nunca solo por color.
 */
export function buildWaitlistStatusLabel(entry: WaitlistStatusInput, timeZone: string): string {
  if (entry.status === 'offered' && entry.offerExpiresAt !== null) {
    return i18n.t('waitlist.offeredStatus', {
      deadline: `${formatShortDate(entry.offerExpiresAt, timeZone)} ${formatTime24h(entry.offerExpiresAt, timeZone)}`,
    });
  }
  return i18n.t('waitlist.waitingStatus', { position: entry.position ?? 1 });
}
