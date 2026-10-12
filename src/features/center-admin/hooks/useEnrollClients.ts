import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getAgendaGetRoomDayQueryKey } from '@/shared/api/generated/endpoints/bookings/bookings';
import {
  getSchedulesListEnrollmentsQueryKey,
  getSchedulesListQueryKey,
  schedulesEnroll,
} from '@/shared/api/generated/endpoints/schedules/schedules';
import type { EnrollResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface EnrollClients {
  enrollClients: (
    clientMembershipIds: readonly string[],
    onDone: (result: EnrollResponseDto) => void,
  ) => void;
  isEnrolling: boolean;
  errorMessage: string | null;
}

/** Matricula a varias personas en un horario; el servidor les crea las citas futuras. */
export function useEnrollClients(seriesId: string): EnrollClients {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (clientMembershipIds: readonly string[]) =>
      schedulesEnroll(centerId, seriesId, { clientMembershipIds: [...clientMembershipIds] }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getSchedulesListEnrollmentsQueryKey(centerId, seriesId),
      });
      void queryClient.invalidateQueries({ queryKey: getSchedulesListQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
    },
  });

  return {
    enrollClients: (clientMembershipIds, onDone) => {
      mutation.mutate(clientMembershipIds, { onSuccess: onDone });
    },
    isEnrolling: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
