import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPlatformListPlansQueryOptions } from '@/shared/api/generated/endpoints/platform/platform';
import type { PlatformPlanListResponseDto } from '@/shared/api/generated/model';

/** Los planes con su precio, cuántos centros tiene cada uno y los ingresos al mes: solo cifras. */
export function usePlatformPlans(): UseQueryResult<PlatformPlanListResponseDto, ErrorType> {
  return useQuery(getPlatformListPlansQueryOptions());
}
