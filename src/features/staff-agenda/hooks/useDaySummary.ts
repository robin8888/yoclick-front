import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getAgendaGetDaySummaryQueryOptions } from '@/shared/api/generated/endpoints/reports/reports';
import type { DaySummaryResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** Ocupación del día y clientes del centro activo; solo para quien administra el centro. */
export function useDaySummary(isoDate: string): UseQueryResult<DaySummaryResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getAgendaGetDaySummaryQueryOptions(
      centerId ?? '',
      { date: isoDate },
      { query: { enabled: centerId !== null } },
    ),
  );
}
