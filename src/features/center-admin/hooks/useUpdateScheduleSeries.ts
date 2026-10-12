import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getAgendaGetRoomDayQueryKey } from '@/shared/api/generated/endpoints/bookings/bookings';
import {
  getSchedulesListQueryKey,
  schedulesUpdate,
} from '@/shared/api/generated/endpoints/schedules/schedules';
import type {
  ScheduleSeriesWriteResponseDto,
  UpdateScheduleSeriesRequestDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface UpdateScheduleSeries {
  updateSeries: (
    request: UpdateScheduleSeriesRequestDto,
    onDone: (result: ScheduleSeriesWriteResponseDto) => void,
  ) => void;
  isUpdating: boolean;
  errorMessage: string | null;
}

/** Cambia nombre, plazas, hora, fin, espacio o profesor de un horario; el servidor rehace las sesiones futuras. */
export function useUpdateScheduleSeries(seriesId: string): UpdateScheduleSeries {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: UpdateScheduleSeriesRequestDto) =>
      schedulesUpdate(centerId, seriesId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getSchedulesListQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
    },
  });

  return {
    updateSeries: (request, onDone) => {
      mutation.mutate(request, { onSuccess: onDone });
    },
    isUpdating: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
