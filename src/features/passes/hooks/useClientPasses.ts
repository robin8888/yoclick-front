import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPassesListQueryOptions } from '@/shared/api/generated/endpoints/passes/passes';
import type { PassListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los bonos de una persona del centro (los ve el equipo de administración). */
export function useClientPasses(
  clientMembershipId: string,
): UseQueryResult<PassListResponseDto, ErrorType> {
  return useQuery(getPassesListQueryOptions(useActiveCenterId(), { clientMembershipId }));
}
