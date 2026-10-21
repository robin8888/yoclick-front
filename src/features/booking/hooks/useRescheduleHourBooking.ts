import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  bookingsReschedule,
  getBookingsListMineQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import { getAvailabilityGetQueryKey } from '@/shared/api/generated/endpoints/scheduling/scheduling';

import { useActiveCenterId } from './useActiveCenterId';

interface MoveToHourInput {
  bookingId: string;
  /** La hora libre a la que pasa la cita. */
  startsAt: string;
}

interface RescheduleHourBooking {
  rescheduleToHour: (input: MoveToHourInput, onMoved: () => void) => void;
  isRescheduling: boolean;
  rescheduleErrorMessage: string | null;
  /** Cierra el aviso del error para poder volver a intentarlo. */
  clearError: () => void;
}

/**
 * Pasa una cita individual a otra hora libre. No es optimista (CLAUDE.md): se espera al servidor, que
 * libera la hora anterior y avisa al equipo, y se recargan Mis citas y las horas libres.
 */
export function useRescheduleHourBooking(): RescheduleHourBooking {
  const centerId = useActiveCenterId() ?? '';
  const queryClient = useQueryClient();
  const rescheduleMutation = useMutation({
    mutationFn: (input: MoveToHourInput) =>
      bookingsReschedule(centerId, input.bookingId, { startsAt: input.startsAt }),
  });

  return {
    rescheduleToHour: (input, onMoved) => {
      rescheduleMutation.mutate(input, {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getAvailabilityGetQueryKey(centerId) });
          void queryClient
            .invalidateQueries({ queryKey: getBookingsListMineQueryKey(centerId) })
            .then(onMoved);
        },
        // La hora pudo ocuparse mientras tanto: se vuelven a pedir las libres.
        onError: () => {
          void queryClient.invalidateQueries({ queryKey: getAvailabilityGetQueryKey(centerId) });
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
