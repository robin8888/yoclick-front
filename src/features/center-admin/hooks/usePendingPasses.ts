import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPassesListQueryOptions } from '@/shared/api/generated/endpoints/passes/passes';
import type { PassListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los bonos que las personas han pedido y el centro aún no ha activado (al cobrarlos). */
export function usePendingPasses(): UseQueryResult<PassListResponseDto, ErrorType> {
  return useQuery(getPassesListQueryOptions(useActiveCenterId(), { status: 'pending' }));
}
