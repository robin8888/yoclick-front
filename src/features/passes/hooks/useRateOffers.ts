import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getRatesListQueryOptions } from '@/shared/api/generated/endpoints/rates/rates';
import type { RateListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los bonos que el centro ofrece. */
export function useRateOffers(): UseQueryResult<RateListResponseDto, ErrorType> {
  return useQuery(getRatesListQueryOptions(useActiveCenterId()));
}
