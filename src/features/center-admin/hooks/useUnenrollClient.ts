import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getAgendaGetRoomDayQueryKey } from '@/shared/api/generated/endpoints/bookings/bookings';
import {
  getSchedulesListEnrollmentsQueryKey,
  getSchedulesListQueryKey,
  schedulesUnenroll,
} from '@/shared/api/generated/endpoints/schedules/schedules';

import { useActiveCenterId } from './useActiveCenterId';

interface UnenrollClient {
  unenrollClient: (enrollmentId: string, onDone: () => void) => void;
  isUnenrolling: boolean;
  errorMessage: string | null;
}

/** Da de baja a una persona del grupo fijo; sus citas futuras se cancelan sin consumir bono. */
export function useUnenrollClient(seriesId: string): UnenrollClient {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (enrollmentId: string) => schedulesUnenroll(centerId, seriesId, enrollmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getSchedulesListEnrollmentsQueryKey(centerId, seriesId),
      });
      void queryClient.invalidateQueries({ queryKey: getSchedulesListQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
    },
  });

  return {
    unenrollClient: (enrollmentId, onDone) => {
      mutation.mutate(enrollmentId, { onSuccess: onDone });
    },
    isUnenrolling: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
