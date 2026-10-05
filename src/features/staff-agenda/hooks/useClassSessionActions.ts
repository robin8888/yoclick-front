import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  bookingsEnd,
  bookingsStart,
  getAgendaGetDayQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import { useSessionStore } from '@/shared/auth/session-store';

interface ClassSessionActions {
  startClass: () => void;
  endClass: (onEnded: () => void) => void;
  isStarting: boolean;
  isEnding: boolean;
  actionErrorMessage: string | null;
}

/**
 * Iniciar y terminar una clase. Las horas las pone el servidor: la app no las envía, solo pide la
 * acción. Después se recarga la agenda del día, que es de donde sale el estado del temporizador.
 */
export function useClassSessionActions(bookingId: string, isoDate: string): ClassSessionActions {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const startMutation = useMutation({ mutationFn: () => bookingsStart(centerId, bookingId) });
  const endMutation = useMutation({ mutationFn: () => bookingsEnd(centerId, bookingId) });

  function refreshAgenda(): Promise<void> {
    return queryClient.invalidateQueries({
      queryKey: getAgendaGetDayQueryKey(centerId, { date: isoDate }),
    });
  }

  const failure = startMutation.error ?? endMutation.error;
  return {
    startClass: () => {
      startMutation.mutate(undefined, { onSuccess: () => void refreshAgenda() });
    },
    endClass: (onEnded) => {
      endMutation.mutate(undefined, {
        onSuccess: () => {
          void refreshAgenda().then(onEnded);
        },
      });
    },
    isStarting: startMutation.isPending,
    isEnding: endMutation.isPending,
    actionErrorMessage: failure === null ? null : getApiErrorMessage(failure),
  };
}
