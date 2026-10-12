import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getSchedulesListQueryOptions } from '@/shared/api/generated/endpoints/schedules/schedules';
import type { ScheduleSeriesListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los horarios fijos del centro (activos y terminados), con sus días y matriculados. */
export function useScheduleSeriesList(): UseQueryResult<ScheduleSeriesListResponseDto, ErrorType> {
  return useQuery(getSchedulesListQueryOptions(useActiveCenterId()));
}
