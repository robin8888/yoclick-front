import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getMeListMembershipsQueryOptions } from '@/shared/api/generated/endpoints/me/me';
import type { MyMembershipsResponseDto } from '@/shared/api/generated/model';

interface UseMyCentersOptions {
  /** Sin sesión no hay centros que pedir. */
  isEnabled?: boolean;
}

export function useMyCenters({ isEnabled = true }: UseMyCentersOptions = {}): UseQueryResult<
  MyMembershipsResponseDto,
  ErrorType
> {
  return useQuery(getMeListMembershipsQueryOptions({ query: { enabled: isEnabled } }));
}
