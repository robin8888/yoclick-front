import { useQuery } from '@tanstack/react-query';

import { getAgendaGetRoomDayQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import { useSessionStore } from '@/shared/auth/session-store';

import {
  checkRoomBlockAvailability,
  listBusyRangesOfRoom,
  type DayTimeRange,
  type RoomBlockAvailability,
} from '../model/room-block-availability';

interface RoomBlockAvailabilityQuery {
  roomId: string;
  date: string;
  startsAtTime: string;
  endsAtTime: string;
}

interface RoomBlockAvailabilityState {
  /** `null` mientras se carga la agenda del día: no se avisa ni se impide nada todavía. */
  availability: RoomBlockAvailability | null;
  /** Lo que ya ocupa el espacio ese día, para que quien elige vea dónde hay hueco. */
  busyRanges: DayTimeRange[];
}

/** Si el tramo elegido está libre, leyendo la agenda del día del centro (clases, bloqueos y horario). */
export function useRoomBlockAvailability(
  query: RoomBlockAvailabilityQuery,
): RoomBlockAvailabilityState {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const agendaQuery = useQuery(
    getAgendaGetRoomDayQueryOptions(
      centerId ?? '',
      { date: query.date },
      { query: { enabled: centerId !== null && query.date !== '' } },
    ),
  );
  const agenda = agendaQuery.data;
  if (agenda === undefined) return { availability: null, busyRanges: [] };

  return {
    availability: checkRoomBlockAvailability({ ...query, agenda, now: new Date() }),
    busyRanges: listBusyRangesOfRoom(agenda, query.roomId),
  };
}
