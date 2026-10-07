import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  agendaCancelBooking,
  bookingsEnd,
  bookingsStart,
  getAgendaGetDayQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import { useSessionStore } from '@/shared/auth/session-store';

interface ClassSessionActions {
  startClass: () => void;
  endClass: (onEnded: () => void) => void;
  /** Cancela la cita; el cliente recibe un aviso en su móvil. */
  cancelBooking: (onCancelled: () => void) => void;
  isStarting: boolean;
  isEnding: boolean;
  isCancelling: boolean;
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
  const cancelMutation = useMutation({
    mutationFn: () => agendaCancelBooking(centerId, bookingId),
  });

  function refreshAgenda(): Promise<void> {
    return queryClient.invalidateQueries({
      queryKey: getAgendaGetDayQueryKey(centerId, { date: isoDate }),
    });
  }

  const failure = startMutation.error ?? endMutation.error ?? cancelMutation.error;
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
    cancelBooking: (onCancelled) => {
      cancelMutation.mutate(undefined, {
        onSuccess: () => {
          void refreshAgenda().then(onCancelled);
        },
      });
    },
    isStarting: startMutation.isPending,
    isEnding: endMutation.isPending,
    isCancelling: cancelMutation.isPending,
    actionErrorMessage: failure === null ? null : getApiErrorMessage(failure),
  };
}
