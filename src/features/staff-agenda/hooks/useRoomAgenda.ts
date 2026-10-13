import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import {
  getAgendaGetRoomDayQueryKey,
  getAgendaGetRoomDayQueryOptions,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { keepPreviousDataOfSameCenter } from '@/shared/lib/keep-previous-for-same-center';

/** La agenda del centro de un día vista por sala: ocupación, aforo, profesor y alumnos. */
export function useRoomAgenda(isoDate: string): UseQueryResult<RoomAgendaResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const [pathKey] = getAgendaGetRoomDayQueryKey(centerId ?? '');
  return useQuery(
    getAgendaGetRoomDayQueryOptions(
      centerId ?? '',
      { date: isoDate },
      {
        query: {
          enabled: centerId !== null,
          placeholderData: keepPreviousDataOfSameCenter<RoomAgendaResponseDto, ErrorType>(pathKey),
        },
      },
    ),
  );
}
