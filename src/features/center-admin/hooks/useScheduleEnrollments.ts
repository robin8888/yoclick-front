import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getSchedulesListEnrollmentsQueryOptions } from '@/shared/api/generated/endpoints/schedules/schedules';
import type { EnrollmentListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** El grupo fijo de un horario: quién está matriculado y desde cuándo. */
export function useScheduleEnrollments(
  seriesId: string,
): UseQueryResult<EnrollmentListResponseDto, ErrorType> {
  return useQuery(getSchedulesListEnrollmentsQueryOptions(useActiveCenterId(), seriesId));
}
