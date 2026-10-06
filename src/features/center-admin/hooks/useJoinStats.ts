import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getCentersGetJoinStatsQueryOptions } from '@/shared/api/generated/endpoints/centers/centers';
import type { JoinStatsResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Cuántas personas se han unido este mes y por dónde (QR, enlace o código). */
export function useJoinStats(): UseQueryResult<JoinStatsResponseDto, ErrorType> {
  return useQuery(getCentersGetJoinStatsQueryOptions(useActiveCenterId()));
}
