import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getAgendaGetDayQueryKey,
  getAgendaGetRoomDayQueryKey,
} from '@/shared/api/generated/endpoints/bookings/bookings';
import { sessionsMove } from '@/shared/api/generated/endpoints/schedules/schedules';
import type { MoveSessionRequestDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

interface MoveSessionDay {
  moveSessionDay: (newTiming: MoveSessionRequestDto, onDone: () => void) => void;
  isMoving: boolean;
  errorMessage: string | null;
}

/** Mueve una sola sesión de una serie a otra fecha u hora: se avisa a las personas con plaza. */
export function useMoveSessionDay(sessionId: string): MoveSessionDay {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newTiming: MoveSessionRequestDto) => sessionsMove(centerId, sessionId, newTiming),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetDayQueryKey(centerId) });
    },
  });

  return {
    moveSessionDay: (newTiming, onDone) => {
      mutation.mutate(newTiming, { onSuccess: onDone });
    },
    isMoving: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
