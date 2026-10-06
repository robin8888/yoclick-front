import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getGroupsListQueryOptions } from '@/shared/api/generated/endpoints/clients/clients';
import type { GroupListResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** Los grupos de clientes del centro con su nivel, quien los da y cuántas personas tienen. */
export function useGroupList(): UseQueryResult<GroupListResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getGroupsListQueryOptions(centerId ?? '', { query: { enabled: centerId !== null } }),
  );
}
