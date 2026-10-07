import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getCentersGetSubscriptionQueryOptions } from '@/shared/api/generated/endpoints/centers/centers';
import type { CenterSubscriptionResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** El plan del centro: estado, fin de la prueba y uso del tope de clientes. */
export function useCenterSubscription(): UseQueryResult<CenterSubscriptionResponseDto, ErrorType> {
  return useQuery(getCentersGetSubscriptionQueryOptions(useActiveCenterId()));
}
