import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getAgendaGetDayQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import type { AgendaResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** Las citas del centro activo en un día (`YYYY-MM-DD`). Staff ve las suyas; admin, las de todos. */
export function useDayAgenda(isoDate: string): UseQueryResult<AgendaResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getAgendaGetDayQueryOptions(
      centerId ?? '',
      { date: isoDate },
      { query: { enabled: centerId !== null } },
    ),
  );
}
