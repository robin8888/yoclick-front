import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getAgendaGetRoomDayQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** La agenda del centro de un día vista por sala: ocupación, aforo, profesor y alumnos. */
export function useRoomAgenda(isoDate: string): UseQueryResult<RoomAgendaResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getAgendaGetRoomDayQueryOptions(
      centerId ?? '',
      { date: isoDate },
      { query: { enabled: centerId !== null } },
    ),
  );
}
