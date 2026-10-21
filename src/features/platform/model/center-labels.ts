import type { PlatformCenterListResponseDtoDataItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format';
import type { BadgeTone } from '@/ui/atoms/Badge';

import type { CenterAttention } from './center-attention';

const PLATFORM_TIME_ZONE = 'Europe/Madrid';

type CenterStatus = PlatformCenterListResponseDtoDataItem['status'];
type CenterUsage = Pick<
  PlatformCenterListResponseDtoDataItem,
  'activeClientCount' | 'teamMemberCount' | 'bookingsLast30Days' | 'maxClients' | 'lastBookingAt'
>;

const STATUS_TONES: Readonly<Record<CenterStatus, BadgeTone>> = {
  trial: 'info',
  active: 'success',
  past_due: 'warning',
  suspended: 'danger',
};

const ATTENTION_KEYS = {
  suspended: 'platform.attention.suspended',
  'past-due': 'platform.attention.pastDue',
  'over-limit': 'platform.attention.overLimit',
  'trial-ending': 'platform.attention.trialEnding',
} as const satisfies Record<CenterAttention, string>;

export function getStatusTone(status: CenterStatus): BadgeTone {
  return STATUS_TONES[status];
}

export function getStatusLabel(status: CenterStatus): string {
  return i18n.t(`platform.status.${status}`);
}

export function getAttentionLabel(attention: CenterAttention): string {
  return i18n.t(ATTENTION_KEYS[attention]);
}

/** «34 clientes · 2 del equipo · 120 reservas en 30 d». */
export function buildUsageLine(center: CenterUsage): string {
  return i18n.t('platform.centers.usage', {
    clients: center.activeClientCount,
    team: center.teamMemberCount,
    bookings: center.bookingsLast30Days,
  });
}

/** «34 de 150 clientes» con tope, o «34 clientes, sin tope» sin él. */
export function buildClientsLine(center: CenterUsage): string {
  return center.maxClients === null
    ? i18n.t('platform.centers.clientsNoCap', { clients: center.activeClientCount })
    : i18n.t('platform.centers.clientsOfCap', {
        clients: center.activeClientCount,
        max: center.maxClients,
      });
}

export function buildLastBookingLine(lastBookingAt: string | null): string {
  return lastBookingAt === null
    ? i18n.t('platform.centers.noBookings')
    : i18n.t('platform.centers.lastBooking', {
        date: formatShortDate(lastBookingAt, PLATFORM_TIME_ZONE),
      });
}
