import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getJoinSearchCentersQueryOptions } from '@/shared/api/generated/endpoints/join/join';
import type { CenterSearchResponseDto } from '@/shared/api/generated/model';

import { isSearchQueryReady } from '../model/search-query';

/** Sin texto suficiente no se consulta: el contrato exige al menos 2 caracteres. */
export function useCenterDirectorySearch(
  searchQuery: string,
): UseQueryResult<CenterSearchResponseDto, ErrorType> {
  return useQuery(
    getJoinSearchCentersQueryOptions(
      { q: searchQuery.trim() },
      { query: { enabled: isSearchQueryReady(searchQuery) } },
    ),
  );
}
