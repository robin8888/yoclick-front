import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getAgendaGetRoomDayQueryKey } from '@/shared/api/generated/endpoints/bookings/bookings';
import {
  getSchedulesListQueryKey,
  schedulesEnd,
} from '@/shared/api/generated/endpoints/schedules/schedules';

import { useActiveCenterId } from './useActiveCenterId';

interface EndScheduleSeries {
  endSeries: (onDone: () => void) => void;
  isEnding: boolean;
  errorMessage: string | null;
}

/** Termina un horario: cancela las sesiones futuras sin citas sueltas y avisa al grupo fijo. */
export function useEndScheduleSeries(seriesId: string): EndScheduleSeries {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => schedulesEnd(centerId, seriesId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getSchedulesListQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
    },
  });

  return {
    endSeries: (onDone) => {
      mutation.mutate(undefined, { onSuccess: onDone });
    },
    isEnding: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
