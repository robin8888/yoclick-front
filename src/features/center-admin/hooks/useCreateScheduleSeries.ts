import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getAgendaGetRoomDayQueryKey } from '@/shared/api/generated/endpoints/bookings/bookings';
import {
  getSchedulesListQueryKey,
  schedulesCreate,
} from '@/shared/api/generated/endpoints/schedules/schedules';
import type {
  CreateScheduleSeriesRequestDto,
  ScheduleSeriesWriteResponseDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface CreateScheduleSeries {
  createSeries: (
    request: CreateScheduleSeriesRequestDto,
    onDone: (result: ScheduleSeriesWriteResponseDto) => void,
  ) => void;
  isCreating: boolean;
  errorMessage: string | null;
}

/** Crea un horario (una serie de uno o varios días). No es optimista: el servidor materializa sesiones. */
export function useCreateScheduleSeries(): CreateScheduleSeries {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: CreateScheduleSeriesRequestDto) => schedulesCreate(centerId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getSchedulesListQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
    },
  });

  return {
    createSeries: (request, onDone) => {
      mutation.mutate(request, { onSuccess: onDone });
    },
    isCreating: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
