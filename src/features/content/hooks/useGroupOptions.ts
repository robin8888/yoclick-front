import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getGroupsListQueryOptions } from '@/shared/api/generated/endpoints/clients/clients';
import type { GroupListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los grupos del centro, para elegir a quién se asigna un contenido. */
export function useGroupOptions(): UseQueryResult<GroupListResponseDto, ErrorType> {
  return useQuery(getGroupsListQueryOptions(useActiveCenterId()));
}
