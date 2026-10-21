import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import {
  getPlatformListCentersQueryKey,
  platformListCenters,
} from '@/shared/api/generated/endpoints/platform/platform';
import type {
  PlatformCenterListResponseDto,
  PlatformListCentersParams,
} from '@/shared/api/generated/model';

type CentersFilter = Omit<PlatformListCentersParams, 'cursor'>;

/** Los centros por páginas, con los filtros de estado, tipo y nombre. */
export function usePlatformCenters(
  filter: CentersFilter,
): UseInfiniteQueryResult<InfiniteData<PlatformCenterListResponseDto>, ErrorType> {
  return useInfiniteQuery({
    queryKey: getPlatformListCentersQueryKey(filter),
    queryFn: ({ pageParam }) =>
      platformListCenters(pageParam === undefined ? filter : { ...filter, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
