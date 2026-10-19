import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPaymentsListMineQueryOptions } from '@/shared/api/generated/endpoints/payments/payments';
import type { PaymentListResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** Los cobros ya pagados de la persona, cada uno con el número de su recibo. */
export function useMyReceipts(): UseQueryResult<PaymentListResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getPaymentsListMineQueryOptions(centerId ?? '', { query: { enabled: centerId !== null } }),
  );
}
