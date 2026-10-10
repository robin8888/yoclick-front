import { useQuery } from '@tanstack/react-query';

import { getAgendaGetGroupOptionsQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import type { GroupOptionsResponseDtoRoomsItem } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

interface GroupOptionsRequest {
  serviceId: string | null;
  isoDate: string;
  /** Solo se piden en una cita grupal. */
  isGroupMode: boolean;
}

/**
 * Para una cita grupal: cada sala donde se da el servicio con cada profesor que lo da, con sus
 * horas libres ese día y los grupos que aún tienen plazas.
 */
export function useGroupOptions(request: GroupOptionsRequest): GroupOptionsResponseDtoRoomsItem[] {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const { serviceId, isoDate, isGroupMode } = request;
  const isReady = isGroupMode && centerId !== '' && serviceId !== null && isoDate !== '';
  const options = useQuery(
    getAgendaGetGroupOptionsQueryOptions(
      centerId,
      { date: isoDate, serviceId: serviceId ?? '' },
      { query: { enabled: isReady } },
    ),
  );

  return isReady ? (options.data?.rooms ?? []) : [];
}
