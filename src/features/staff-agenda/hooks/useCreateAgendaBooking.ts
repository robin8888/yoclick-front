import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  agendaCreateBooking,
  agendaJoinGroupSession,
  getAgendaGetDayQueryKey,
  getAgendaGetRoomDayQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import type {
  CreateAgendaBookingRequestDto,
  JoinGroupSessionRequestDto,
} from '@/shared/api/generated/model';
import { createIdempotencyIntention, type IdempotencyIntention } from '@/shared/api/idempotency';
import { useSessionStore } from '@/shared/auth/session-store';

interface CreateAgendaBooking {
  createBooking: (request: CreateAgendaBookingRequestDto, onCreated: () => void) => void;
  /** Apunta al cliente a una clase grupal que ya existe. */
  joinGroup: (request: JoinGroupSessionRequestDto, onJoined: () => void) => void;
  isCreating: boolean;
  createErrorMessage: string | null;
}

function describeFailure(
  ...mutations: readonly { isError: boolean; error: unknown }[]
): string | null {
  const failed = mutations.find((mutation) => mutation.isError);
  return failed === undefined ? null : getApiErrorMessage(failed.error);
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

  const joinMutation = useMutation({
    mutationFn: (request: JoinGroupSessionRequestDto) => agendaJoinGroupSession(centerId, request),
  });

  return {
    joinGroup: (request, onJoined) => {
      joinMutation.mutate(request, {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
          void queryClient
            .invalidateQueries({ queryKey: getAgendaGetDayQueryKey(centerId) })
            .then(onJoined);
        },
      });
    },
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
    isCreating: createMutation.isPending || joinMutation.isPending,
    createErrorMessage: describeFailure(createMutation, joinMutation),
  };
}
