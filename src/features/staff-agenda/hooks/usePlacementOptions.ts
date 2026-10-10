import { useQuery } from '@tanstack/react-query';

import { getAgendaGetPlacementOptionsQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import type { PlacementOptionsResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

interface PlacementOptionsRequest {
  serviceId: string | null;
  staffMembershipId: string | null;
  isoDate: string;
}

/**
 * Las horas libres de un profesional con las salas libres de cada una, y los grupos de ese día con
 * plazas. Solo se pide con servicio y profesional elegidos.
 */
export function usePlacementOptions(
  request: PlacementOptionsRequest,
): PlacementOptionsResponseDto | undefined {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const { serviceId, staffMembershipId, isoDate } = request;
  const isReady =
    centerId !== '' && serviceId !== null && staffMembershipId !== null && isoDate !== '';
  const options = useQuery(
    getAgendaGetPlacementOptionsQueryOptions(
      centerId,
      { date: isoDate, serviceId: serviceId ?? '', staffMembershipId: staffMembershipId ?? '' },
      { query: { enabled: isReady } },
    ),
  );

  return isReady ? options.data : undefined;
}
