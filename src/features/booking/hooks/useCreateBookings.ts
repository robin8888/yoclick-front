import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import {
  bookingsJoinSession,
  getBookingsListMineQueryKey,
  getServicesListOpenSessionsQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import type { BookingResponseDto } from '@/shared/api/generated/model';
import { createIdempotencyIntention, type IdempotencyIntention } from '@/shared/api/idempotency';

import { describeBookingFailure } from '../model/pass-needed';
import { useActiveCenterId } from './useActiveCenterId';

interface JoinClassesInput {
  centerId: string;
  classSessionIds: readonly string[];
  intentions: Map<string, IdempotencyIntention>;
  createdBookings: Map<string, BookingResponseDto>;
}

/** Apunta a las clases una tras otra; las ya reservadas en un intento anterior se saltan. */
async function joinClassesInOrder(input: JoinClassesInput): Promise<BookingResponseDto[]> {
  for (const classSessionId of input.classSessionIds) {
    if (input.createdBookings.has(classSessionId)) continue;
    const intention = input.intentions.get(classSessionId) ?? createIdempotencyIntention();
    input.intentions.set(classSessionId, intention);
    const booking = await bookingsJoinSession(
      input.centerId,
      { classSessionId },
      { headers: intention.headers },
    );
    input.createdBookings.set(classSessionId, booking);
  }
  return input.classSessionIds.flatMap((id) => input.createdBookings.get(id) ?? []);
}

/** Las clases que no llegaron a reservarse empiezan de cero en el siguiente intento. */
function forgetPendingIntentions(
  classSessionIds: readonly string[],
  intentions: Map<string, IdempotencyIntention>,
  createdBookings: ReadonlyMap<string, BookingResponseDto>,
): void {
  for (const classSessionId of classSessionIds) {
    if (!createdBookings.has(classSessionId)) intentions.delete(classSessionId);
  }
}

/** Tras reservar: las plazas libres de ese servicio y Mis citas se vuelven a pedir. */
function refreshBookingLists(
  queryClient: QueryClient,
  input: { centerId: string; serviceId: string },
): Promise<void> {
  void queryClient.invalidateQueries({
    queryKey: getServicesListOpenSessionsQueryKey(input.centerId, input.serviceId),
  });
  return queryClient.invalidateQueries({ queryKey: getBookingsListMineQueryKey(input.centerId) });
}

interface CreateBookings {
  createBookings: (onCreated: (bookings: BookingResponseDto[]) => void) => void;
  isCreating: boolean;
  createErrorMessage: string | null;
  /** El centro vende bonos y falta uno: se pide adquirirlo en vez de enseñar un error. */
  isPassNeeded: boolean;
  /** Cierra el aviso del error para poder volver a intentarlo. */
  clearError: () => void;
}

/**
 * Apunta a la persona a las clases elegidas, una tras otra. Cada clase es una intención con su
 * Idempotency-Key: si una falla (clase completa…) se avisa y al reintentar solo se piden las que
 * faltan, sin duplicar las ya reservadas. No es optimista: se espera al servidor.
 */
export function useCreateBookings(input: {
  serviceId: string;
  classSessionIds: readonly string[];
}): CreateBookings {
  const centerId = useActiveCenterId() ?? '';
  const queryClient = useQueryClient();
  // Lo ya intentado en esta pantalla: la clave de cada clase y las reservas que ya se crearon.
  const attempts = useRef({
    intentions: new Map<string, IdempotencyIntention>(),
    createdBookings: new Map<string, BookingResponseDto>(),
  });
  const createMutation = useMutation({
    mutationFn: () =>
      joinClassesInOrder({ centerId, classSessionIds: input.classSessionIds, ...attempts.current }),
  });

  return {
    createBookings: (onCreated) => {
      createMutation.mutate(undefined, {
        onSuccess: (bookings) => {
          void refreshBookingLists(queryClient, { centerId, serviceId: input.serviceId }).then(
            () => {
              onCreated(bookings);
            },
          );
        },
        // El servidor ya decidió sobre la que falló: la siguiente pulsación es otra intención suya.
        onError: () => {
          void queryClient.invalidateQueries({ queryKey: getBookingsListMineQueryKey(centerId) });
          forgetPendingIntentions(
            input.classSessionIds,
            attempts.current.intentions,
            attempts.current.createdBookings,
          );
        },
      });
    },
    isCreating: createMutation.isPending,
    ...describeBookingFailure(createMutation.isError ? createMutation.error : null),
    clearError: createMutation.reset,
  };
}
