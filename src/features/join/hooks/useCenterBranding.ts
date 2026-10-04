import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getCentersGetBrandingQueryOptions } from '@/shared/api/generated/endpoints/centers/centers';
import type { CenterBrandingResponseDto } from '@/shared/api/generated/model';

export function useCenterBranding(
  centerId: string,
): UseQueryResult<CenterBrandingResponseDto, ErrorType> {
  return useQuery(getCentersGetBrandingQueryOptions(centerId));
}
