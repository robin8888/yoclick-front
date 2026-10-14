import { useQuery } from '@tanstack/react-query';

import { getPaymentsGetStatusQueryOptions } from '@/shared/api/generated/endpoints/payments/payments';
import type { PaymentsStatusResponseDtoStatus } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Si el centro cobra online (`ready`); mientras carga o si falla, se asume que no. */
export function usePaymentsStatus(): PaymentsStatusResponseDtoStatus | null {
  const status = useQuery(getPaymentsGetStatusQueryOptions(useActiveCenterId()));
  return status.data?.status ?? null;
}
