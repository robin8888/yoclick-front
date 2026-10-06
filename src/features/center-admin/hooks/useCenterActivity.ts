import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getActivityListQueryOptions } from '@/shared/api/generated/endpoints/activity/activity';
import type { ActivityResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

const ACTIVITY_PAGE_SIZE = 20;

/** Lo último que ha pasado en el centro: quién cambió qué. Exige sesión con segundo factor. */
export function useCenterActivity(): UseQueryResult<ActivityResponseDto, ErrorType> {
  return useQuery(getActivityListQueryOptions(useActiveCenterId(), { limit: ACTIVITY_PAGE_SIZE }));
}
