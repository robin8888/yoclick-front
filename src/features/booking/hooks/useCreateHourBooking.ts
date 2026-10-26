import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import {
  bookingsCreate,
  getBookingsListMineQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import { getAvailabilityGetQueryKey } from '@/shared/api/generated/endpoints/scheduling/scheduling';
import type { BookingResponseDto } from '@/shared/api/generated/model';
import { createIdempotencyIntention, type IdempotencyIntention } from '@/shared/api/idempotency';

import { describeBookingFailure } from '../model/pass-needed';
import { useActiveCenterId } from './useActiveCenterId';

export interface HourBookingRequest {
  serviceId: string;
  startsAt: string;
  staffMembershipId: string;
}

interface CreateHourBooking {
  createHourBooking: (onCreated: (booking: BookingResponseDto) => void) => void;
  isCreating: boolean;
  createErrorMessage: string | null;
  /** El centro vende bonos y falta uno: se pide adquirirlo en vez de enseñar un error. */
  isPassNeeded: boolean;
  clearError: () => void;
}

/**
 * Reserva una hora libre. Cada pantalla de confirmación es una intención: los reintentos reutilizan la
 * misma Idempotency-Key y no duplican la cita. No es optimista: se espera al servidor.
 */
export function useCreateHourBooking(request: HourBookingRequest): CreateHourBooking {
  const centerId = useActiveCenterId() ?? '';
  const queryClient = useQueryClient();
  const intention = useRef<IdempotencyIntention | null>(null);
  const createMutation = useMutation({
    mutationFn: () => {
      intention.current ??= createIdempotencyIntention();
      return bookingsCreate(centerId, request, { headers: intention.current.headers });
    },
  });

  return {
    createHourBooking: (onCreated) => {
      createMutation.mutate(undefined, {
        onSuccess: (booking) => {
          // Esa hora ya no está libre, y Mis citas tiene una más.
          void queryClient.invalidateQueries({ queryKey: getAvailabilityGetQueryKey(centerId) });
          void queryClient
            .invalidateQueries({ queryKey: getBookingsListMineQueryKey(centerId) })
            .then(() => {
              onCreated(booking);
            });
        },
        // El servidor ya decidió (hora ocupada, ya reservado…): la siguiente pulsación es otra intención.
        onError: () => {
          intention.current = null;
          void queryClient.invalidateQueries({ queryKey: getAvailabilityGetQueryKey(centerId) });
        },
      });
    },
    isCreating: createMutation.isPending,
    ...describeBookingFailure(createMutation.isError ? createMutation.error : null),
    clearError: createMutation.reset,
  };
}
