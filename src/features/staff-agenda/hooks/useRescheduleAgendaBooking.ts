import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  agendaRescheduleBooking,
  getAgendaGetDayQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import type { RescheduleAgendaBookingRequestDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

interface RescheduleAgendaBooking {
  rescheduleBooking: (request: RescheduleAgendaBookingRequestDto, onMoved: () => void) => void;
  isRescheduling: boolean;
  rescheduleErrorMessage: string | null;
}

/**
 * Mueve la cita de un cliente a otra hora desde la agenda. No es optimista: se espera al servidor
 * (que avisa al cliente) y luego se recarga la agenda de todos los días.
 */
export function useRescheduleAgendaBooking(bookingId: string): RescheduleAgendaBooking {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const rescheduleMutation = useMutation({
    mutationFn: (request: RescheduleAgendaBookingRequestDto) =>
      agendaRescheduleBooking(centerId, bookingId, request),
  });

  return {
    rescheduleBooking: (request, onMoved) => {
      rescheduleMutation.mutate(request, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: getAgendaGetDayQueryKey(centerId) })
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
