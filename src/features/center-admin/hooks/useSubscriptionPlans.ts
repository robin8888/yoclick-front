import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getCentersListSubscriptionPlansQueryOptions } from '@/shared/api/generated/endpoints/centers/centers';
import type { PlanOffersResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los planes que se pueden contratar, con su precio mensual y anual (sin IVA). */
export function useSubscriptionPlans(): UseQueryResult<PlanOffersResponseDto, ErrorType> {
  return useQuery(getCentersListSubscriptionPlansQueryOptions(useActiveCenterId()));
}
