import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPlatformGetOverviewQueryOptions } from '@/shared/api/generated/endpoints/platform/platform';
import type { PlatformOverviewResponseDto } from '@/shared/api/generated/model';

/** Cifras agregadas de toda la plataforma (centros, clientes y reservas): nunca datos de personas. */
export function usePlatformOverview(): UseQueryResult<PlatformOverviewResponseDto, ErrorType> {
  return useQuery(getPlatformGetOverviewQueryOptions());
}
