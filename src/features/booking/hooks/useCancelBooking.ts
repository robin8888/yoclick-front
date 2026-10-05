import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  bookingsCancel,
  getBookingsListMineQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import type { CancelBookingResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface CancelBooking {
  cancelBooking: (
    bookingId: string,
    onCancelled: (result: CancelBookingResponseDto) => void,
  ) => void;
  isCancelling: boolean;
  cancelErrorMessage: string | null;
}

/** Cancela una cita. No es optimista (CLAUDE.md): se espera al servidor y se recargan las listas. */
export function useCancelBooking(): CancelBooking {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => bookingsCancel(centerId ?? '', bookingId),
  });

  return {
    cancelBooking: (bookingId, onCancelled) => {
      cancelMutation.mutate(bookingId, {
        onSuccess: (result) => {
          void queryClient
            .invalidateQueries({ queryKey: getBookingsListMineQueryKey(centerId ?? '') })
            .then(() => {
              onCancelled(result);
            });
        },
      });
    },
    isCancelling: cancelMutation.isPending,
    cancelErrorMessage: cancelMutation.isError ? getApiErrorMessage(cancelMutation.error) : null,
  };
}
