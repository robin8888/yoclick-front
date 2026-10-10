import { useQuery } from '@tanstack/react-query';

import { getRoomsListQueryOptions } from '@/shared/api/generated/endpoints/rooms/rooms';
import { useSessionStore } from '@/shared/auth/session-store';

/** El centro tiene salas: la cita puede ser privada o grupal y lleva sala. */
export function useHasCenterRooms(): boolean {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const rooms = useQuery(
    getRoomsListQueryOptions(centerId ?? '', { query: { enabled: centerId !== null } }),
  );

  return (rooms.data?.rooms.length ?? 0) > 0;
}
