import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  bookingsReschedule,
  getBookingsListMineQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';

import { useActiveCenterId } from './useActiveCenterId';

interface RescheduleBooking {
  rescheduleBooking: (input: { bookingId: string; startsAt: string }, onMoved: () => void) => void;
  isRescheduling: boolean;
  rescheduleErrorMessage: string | null;
}

/** Cambia la hora de una cita. No es optimista (CLAUDE.md): se espera al servidor y se recargan las listas. */
export function useRescheduleBooking(): RescheduleBooking {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const rescheduleMutation = useMutation({
    mutationFn: (input: { bookingId: string; startsAt: string }) =>
      bookingsReschedule(centerId ?? '', input.bookingId, { startsAt: input.startsAt }),
  });

  return {
    rescheduleBooking: (input, onMoved) => {
      rescheduleMutation.mutate(input, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: getBookingsListMineQueryKey(centerId ?? '') })
            .then(onMoved);
        },
      });
    },
    isRescheduling: rescheduleMutation.isPending,
    rescheduleErrorMessage: rescheduleMutation.isError
      ? getApiErrorMessage(rescheduleMutation.error)
      : null,
  };
}
