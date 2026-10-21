import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import {
  getPlatformListAuditLogQueryKey,
  platformListAuditLog,
} from '@/shared/api/generated/endpoints/platform/platform';
import type {
  PlatformAuditListResponseDto,
  PlatformListAuditLogParams,
} from '@/shared/api/generated/model';

type AuditFilter = Omit<PlatformListAuditLogParams, 'cursor'>;

/** El registro de cambios hechos desde la administración, lo último primero; de todos o de un centro. */
export function usePlatformAudit(
  filter: AuditFilter = {},
): UseInfiniteQueryResult<InfiniteData<PlatformAuditListResponseDto>, ErrorType> {
  return useInfiniteQuery({
    queryKey: getPlatformListAuditLogQueryKey(filter),
    queryFn: ({ pageParam }) =>
      platformListAuditLog(pageParam === undefined ? filter : { ...filter, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
