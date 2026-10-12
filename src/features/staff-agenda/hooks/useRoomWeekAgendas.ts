import { useQueries } from '@tanstack/react-query';

import { getAgendaGetRoomDayQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** La agenda por salas de varios días a la vez (la semana de la franja), por fecha. */
export function useRoomWeekAgendas(
  isoDates: readonly string[],
): Readonly<Record<string, RoomAgendaResponseDto | undefined>> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const results = useQueries({
    queries: isoDates.map((isoDate) =>
      getAgendaGetRoomDayQueryOptions(
        centerId ?? '',
        { date: isoDate },
        { query: { enabled: centerId !== null } },
      ),
    ),
  });

  return Object.fromEntries(isoDates.map((isoDate, index) => [isoDate, results[index]?.data]));
}
