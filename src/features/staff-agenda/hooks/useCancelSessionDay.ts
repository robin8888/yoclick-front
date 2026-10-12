import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getAgendaGetDayQueryKey,
  getAgendaGetRoomDayQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import { sessionsCancel } from '@/shared/api/generated/endpoints/schedules/schedules';
import { useSessionStore } from '@/shared/auth/session-store';

interface CancelSessionDay {
  cancelSessionDay: (reason: string, onDone: () => void) => void;
  isCancelling: boolean;
  errorMessage: string | null;
}

/** Cancela una sesión de un día (festivo, profesor enfermo): avisa a todo el mundo y libera la sala. */
export function useCancelSessionDay(sessionId: string): CancelSessionDay {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (reason: string) => sessionsCancel(centerId, sessionId, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetDayQueryKey(centerId) });
    },
  });

  return {
    cancelSessionDay: (reason, onDone) => {
      mutation.mutate(reason, { onSuccess: onDone });
    },
    isCancelling: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
