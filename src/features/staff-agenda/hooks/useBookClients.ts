import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  agendaCreateBooking,
  agendaJoinGroupSession,
  getAgendaGetDayQueryKey,
  getAgendaGetRoomDayQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import { createIdempotencyIntention, type IdempotencyIntention } from '@/shared/api/idempotency';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';

import {
  executeBookingPlan,
  type BookingPlan,
  type BookingPlanOutcome,
} from '../model/booking-plan';
import type { ChosenClient } from './useNewAppointmentForm';

interface BookClients {
  /** Apunta a todas las personas del plan; avisa solo si no se quedó nadie fuera. */
  bookClients: (plan: BookingPlan, onBooked: () => void) => void;
  isBooking: boolean;
  /** Por qué no se pudo, con quiénes se quedaron fuera si hubo más de un intento; `null` si no hubo fallo. */
  errorMessage: string | null;
  /** Cierra el aviso del error para poder volver a intentarlo. */
  clearError: () => void;
}

function describeOutcome(
  outcome: BookingPlanOutcome,
  clients: readonly ChosenClient[],
): string | null {
  if (outcome.failedClientMembershipIds.length === 0) return null;
  const reason = getApiErrorMessage(outcome.firstError);
  if (clients.length <= 1) return reason;
  const names = clients
    .filter((client) => outcome.failedClientMembershipIds.includes(client.membershipId))
    .map((client) => client.fullName)
    .join(', ');
  return i18n.t('staffAgenda.newAppointment.someClientsFailed', { names, reason });
}

interface MutationState {
  data: BookingPlanOutcome | undefined;
  error: unknown;
  isError: boolean;
}

/** El mensaje que toca: el de una persona que se quedó fuera, o el del fallo de la petición. */
function describeMutation(
  mutation: MutationState,
  clients: readonly ChosenClient[],
): string | null {
  if (mutation.data !== undefined) return describeOutcome(mutation.data, clients);
  return mutation.isError ? getApiErrorMessage(mutation.error) : null;
}

/** Recarga la agenda por salas y la del día tras apuntar a alguien. */
function useRefreshAgenda(centerId: string): () => Promise<void> {
  const queryClient = useQueryClient();

  return async () => {
    void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
    await queryClient.invalidateQueries({ queryKey: getAgendaGetDayQueryKey(centerId) });
  };
}

/**
 * Pone la cita (o apunta a la clase) a una o a varias personas desde la agenda. No es optimista:
 * se espera al servidor y luego se recarga la agenda. Los reintentos de la misma pulsación
 * reutilizan la Idempotency-Key de la creación.
 */
export function useBookClients(clients: readonly ChosenClient[]): BookClients {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const refreshAgenda = useRefreshAgenda(centerId);
  const intention = useRef<IdempotencyIntention | null>(null);
  const mutation = useMutation({
    mutationFn: async (plan: BookingPlan): Promise<BookingPlanOutcome> => {
      intention.current ??= createIdempotencyIntention();
      const { headers } = intention.current;
      const outcome = await executeBookingPlan(plan, {
        createBooking: (request) => agendaCreateBooking(centerId, request, { headers }),
        joinGroup: (request) => agendaJoinGroupSession(centerId, request),
      });
      if (outcome.failedClientMembershipIds.length > 0) intention.current = null;
      return outcome;
    },
  });

  return {
    bookClients: (plan, onBooked) => {
      mutation.mutate(plan, {
        onSuccess: (outcome) => {
          void refreshAgenda().then(() => {
            if (outcome.failedClientMembershipIds.length === 0) onBooked();
          });
        },
        onError: () => {
          intention.current = null;
        },
      });
    },
    isBooking: mutation.isPending,
    errorMessage: describeMutation(mutation, clients),
    clearError: mutation.reset,
  };
}
