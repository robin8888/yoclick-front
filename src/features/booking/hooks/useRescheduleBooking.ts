import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  bookingsMoveToSession,
  getBookingsListMineQueryKey,
  getServicesListOpenSessionsQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';

import { useActiveCenterId } from './useActiveCenterId';

interface MoveInput {
  bookingId: string;
  serviceId: string;
  /** La clase con plazas a la que pasa la reserva. */
  classSessionId: string;
}

interface RescheduleBooking {
  rescheduleBooking: (input: MoveInput, onMoved: () => void) => void;
  isRescheduling: boolean;
  rescheduleErrorMessage: string | null;
  /** Cierra el aviso del error para poder volver a intentarlo. */
  clearError: () => void;
}

/**
 * Pasa una reserva a otra clase del mismo servicio. No es optimista (CLAUDE.md): se espera al
 * servidor, que libera la plaza anterior y avisa al profesor y al centro, y se recargan las listas.
 */
export function useRescheduleBooking(): RescheduleBooking {
  const centerId = useActiveCenterId() ?? '';
  const queryClient = useQueryClient();
  const rescheduleMutation = useMutation({
    mutationFn: (input: MoveInput) =>
      bookingsMoveToSession(centerId, input.bookingId, { classSessionId: input.classSessionId }),
  });

  return {
    rescheduleBooking: (input, onMoved) => {
      rescheduleMutation.mutate(input, {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getServicesListOpenSessionsQueryKey(centerId, input.serviceId),
          });
          void queryClient
            .invalidateQueries({ queryKey: getBookingsListMineQueryKey(centerId) })
            .then(onMoved);
        },
      });
    },
    isRescheduling: rescheduleMutation.isPending,
    rescheduleErrorMessage: rescheduleMutation.isError
      ? getApiErrorMessage(rescheduleMutation.error)
      : null,
    clearError: rescheduleMutation.reset,
  };
}
