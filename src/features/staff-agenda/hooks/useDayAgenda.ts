import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import {
  getAgendaGetDayQueryKey,
  getAgendaGetDayQueryOptions,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import type { AgendaResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { keepPreviousDataOfSameCenter } from '@/shared/lib/keep-previous-for-same-center';

/** Las clases que inicia el servidor solas aparecen sin tocar nada: se vuelve a preguntar cada medio minuto. */
const AGENDA_REFRESH_MS = 30_000;

/** Las citas del centro activo en un día (`YYYY-MM-DD`). Staff ve las suyas; admin, las de todos. */
export function useDayAgenda(isoDate: string): UseQueryResult<AgendaResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const [pathKey] = getAgendaGetDayQueryKey(centerId ?? '');
  return useQuery(
    getAgendaGetDayQueryOptions(
      centerId ?? '',
      { date: isoDate },
      {
        query: {
          enabled: centerId !== null,
          refetchInterval: AGENDA_REFRESH_MS,
          placeholderData: keepPreviousDataOfSameCenter<AgendaResponseDto, ErrorType>(pathKey),
        },
      },
    ),
  );
}
