import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  bookingsCreate,
  getBookingsListMineQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import type { BookingResponseDto } from '@/shared/api/generated/model';
import { createIdempotencyIntention, type IdempotencyIntention } from '@/shared/api/idempotency';

import { useActiveCenterId } from './useActiveCenterId';

export interface BookingRequest {
  serviceId: string;
  startsAt: string;
  staffMembershipId: string;
}

interface CreateBooking {
  createBooking: (onCreated: (booking: BookingResponseDto) => void) => void;
  isCreating: boolean;
  createErrorMessage: string | null;
}

/**
 * Reserva el hueco elegido. Cada pantalla de confirmación es una intención: los reintentos
 * (p. ej. tras perder la conexión) reutilizan la misma Idempotency-Key y no duplican la cita.
 * No es optimista (CLAUDE.md): se muestra la carga y se espera al servidor.
 */
export function useCreateBooking(request: BookingRequest): CreateBooking {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const intention = useRef<IdempotencyIntention | null>(null);
  const createMutation = useMutation({
    mutationFn: () => {
      intention.current ??= createIdempotencyIntention();
      return bookingsCreate(centerId ?? '', request, { headers: intention.current.headers });
    },
  });

  return {
    createBooking: (onCreated) => {
      createMutation.mutate(undefined, {
        onSuccess: (booking) => {
          void queryClient
            .invalidateQueries({ queryKey: getBookingsListMineQueryKey(centerId ?? '') })
            .then(() => {
              onCreated(booking);
            });
        },
        // El servidor ya decidió (hueco ocupado, ya reservado…): la siguiente pulsación es otra intención.
        onError: () => {
          intention.current = null;
        },
      });
    },
    isCreating: createMutation.isPending,
    createErrorMessage: createMutation.isError ? getApiErrorMessage(createMutation.error) : null,
  };
}
