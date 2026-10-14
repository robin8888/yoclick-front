import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPaymentsListQueryOptions } from '@/shared/api/generated/endpoints/payments/payments';
import type { PaymentListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los últimos cobros online del centro, de más reciente a más antiguo. */
export function usePaymentsList(): UseQueryResult<PaymentListResponseDto, ErrorType> {
  return useQuery(getPaymentsListQueryOptions(useActiveCenterId()));
}
