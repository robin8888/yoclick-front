import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getAgendaGetRoomDayQueryKey } from '@/shared/api/generated/endpoints/bookings/bookings';
import {
  getSchedulesListQueryKey,
  schedulesRepeatWeek,
} from '@/shared/api/generated/endpoints/schedules/schedules';
import type { RepeatWeekResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface RepeatWeek {
  repeatWeek: (weekStart: string) => void;
  isRepeating: boolean;
  /** Lo que pasó la última vez: cuántos horarios se copiaron, cuáles ya estaban y cuáles chocan. */
  result: RepeatWeekResponseDto | undefined;
  errorMessage: string | null;
  clearError: () => void;
}

/** Copia los horarios configurados de una semana a la siguiente con un solo gesto. */
export function useRepeatWeek(): RepeatWeek {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (weekStart: string) => schedulesRepeatWeek(centerId, { weekStart }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getSchedulesListQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
    },
  });

  return {
    repeatWeek: (weekStart) => {
      mutation.mutate(weekStart);
    },
    isRepeating: mutation.isPending,
    result: mutation.data,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
    clearError: mutation.reset,
  };
}
