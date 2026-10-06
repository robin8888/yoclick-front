import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  agendaCreateBooking,
  getAgendaGetDayQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import type { CreateAgendaBookingRequestDto } from '@/shared/api/generated/model';
import { createIdempotencyIntention, type IdempotencyIntention } from '@/shared/api/idempotency';
import { useSessionStore } from '@/shared/auth/session-store';

interface CreateAgendaBooking {
  createBooking: (request: CreateAgendaBookingRequestDto, onCreated: () => void) => void;
  isCreating: boolean;
  createErrorMessage: string | null;
}

/**
 * Pone una cita a un cliente desde la agenda. No es optimista: se espera al servidor y luego se
 * recarga la agenda. Los reintentos de la misma pulsación reutilizan la Idempotency-Key.
 */
export function useCreateAgendaBooking(): CreateAgendaBooking {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const intention = useRef<IdempotencyIntention | null>(null);
  const createMutation = useMutation({
    mutationFn: (request: CreateAgendaBookingRequestDto) => {
      intention.current ??= createIdempotencyIntention();
      return agendaCreateBooking(centerId, request, { headers: intention.current.headers });
    },
  });

  return {
    createBooking: (request, onCreated) => {
      createMutation.mutate(request, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: getAgendaGetDayQueryKey(centerId) })
            .then(onCreated);
        },
        onError: () => {
          intention.current = null;
        },
      });
    },
    isCreating: createMutation.isPending,
    createErrorMessage: createMutation.isError ? getApiErrorMessage(createMutation.error) : null,
  };
}
