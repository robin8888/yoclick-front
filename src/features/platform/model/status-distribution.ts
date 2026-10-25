import type { PlatformOverviewResponseDto } from '@/shared/api/generated/model';

export type CenterStatusId = keyof PlatformOverviewResponseDto['centers']['byStatus'];

export interface StatusShare {
  statusId: CenterStatusId;
  count: number;
  /** Fracción del total, de 0 a 1; la suma de todos los estados es 1 (o 0 sin centros). */
  share: number;
}

/** Orden en el que se pintan los tramos: lo sano primero, lo que pide atención al final. */
export const STATUS_DISPLAY_ORDER: readonly CenterStatusId[] = [
  'active',
  'trial',
  'past_due',
  'suspended',
];

export function buildStatusShares(
  byStatus: PlatformOverviewResponseDto['centers']['byStatus'],
): StatusShare[] {
  const total = STATUS_DISPLAY_ORDER.reduce((sum, statusId) => sum + byStatus[statusId], 0);
  return STATUS_DISPLAY_ORDER.map((statusId) => ({
    statusId,
    count: byStatus[statusId],
    share: total === 0 ? 0 : byStatus[statusId] / total,
  }));
}
