import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPassesMineQueryOptions } from '@/shared/api/generated/endpoints/passes/passes';
import type { PassListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los bonos de la persona: pendientes, activos, agotados y caducados. */
export function useMyPasses(): UseQueryResult<PassListResponseDto, ErrorType> {
  return useQuery(getPassesMineQueryOptions(useActiveCenterId()));
}
