import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import {
  getPlatformListChargesQueryKey,
  platformListCharges,
} from '@/shared/api/generated/endpoints/platform/platform';
import type {
  PlatformChargeListResponseDto,
  PlatformListChargesParams,
} from '@/shared/api/generated/model';

type ChargeFilter = Omit<PlatformListChargesParams, 'cursor'>;

/** Los cobros de los planes, el más reciente primero; de un mes natural (`YYYY-MM`) o de un centro. */
export function usePlatformCharges(
  filter: ChargeFilter = {},
): UseInfiniteQueryResult<InfiniteData<PlatformChargeListResponseDto>, ErrorType> {
  return useInfiniteQuery({
    queryKey: getPlatformListChargesQueryKey(filter),
    queryFn: ({ pageParam }) =>
      platformListCharges(pageParam === undefined ? filter : { ...filter, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
