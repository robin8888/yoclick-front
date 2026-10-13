import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { bookingsConfirmAttendance } from '@/shared/api/generated/endpoints/bookings/bookings';
import { useSessionStore } from '@/shared/auth/session-store';

interface ConfirmAttendance {
  confirmAttendance: (bookingId: string) => void;
  /** La reserva que se está confirmando ahora mismo, para mostrar la carga solo en su fila. */
  confirmingBookingId: string | null;
  errorMessage: string | null;
}

/**
 * Confirma con un check que la persona vino. El servidor guarda la asistencia y descuenta la clase
 * del bono; no es optimista (CLAUDE.md): se espera al servidor y se recarga la agenda del día.
 */
export function useConfirmAttendance(): ConfirmAttendance {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (bookingId: string) => bookingsConfirmAttendance(centerId, bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [`/v1/centers/${centerId}/agenda`] });
      void queryClient.invalidateQueries({ queryKey: [`/v1/centers/${centerId}/passes`] });
    },
  });

  return {
    confirmAttendance: (bookingId) => {
      mutation.mutate(bookingId);
    },
    confirmingBookingId: mutation.isPending ? mutation.variables : null,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
