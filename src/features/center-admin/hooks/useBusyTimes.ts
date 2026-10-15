import { useQuery } from '@tanstack/react-query';

import { getSchedulesBusyTimesQueryOptions } from '@/shared/api/generated/endpoints/schedules/schedules';

import type { BusySlot } from '../model/create-class';
import { useActiveCenterId } from './useActiveCenterId';

/**
 * Las franjas de la semana que ya ocupan la sala y el profesor elegidos. Sin ninguno de los dos
 * no se pregunta: no hay nada que comprobar todavía.
 */
export function useBusyTimes(request: {
  roomId: string | null;
  staffMembershipId: string | null;
}): { busy: BusySlot[]; isLoading: boolean } {
  const centerId = useActiveCenterId();
  const isEnabled = request.roomId !== null || request.staffMembershipId !== null;
  const query = useQuery(
    getSchedulesBusyTimesQueryOptions(
      centerId,
      {
        ...(request.roomId === null ? {} : { roomId: request.roomId }),
        ...(request.staffMembershipId === null
          ? {}
          : { staffMembershipId: request.staffMembershipId }),
      },
      { query: { enabled: isEnabled } },
    ),
  );

  return { busy: query.data?.busy ?? [], isLoading: isEnabled && query.isPending };
}
