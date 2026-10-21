import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPlatformGetCenterQueryOptions } from '@/shared/api/generated/endpoints/platform/platform';
import type { PlatformCenterDetailResponseDto } from '@/shared/api/generated/model';

export function usePlatformCenter(
  centerId: string,
): UseQueryResult<PlatformCenterDetailResponseDto, ErrorType> {
  return useQuery(getPlatformGetCenterQueryOptions(centerId));
}
