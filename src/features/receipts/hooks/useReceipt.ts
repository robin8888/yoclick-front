import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPaymentsGetReceiptQueryOptions } from '@/shared/api/generated/endpoints/payments/payments';
import type { ReceiptResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** El recibo de un cobro pagado, con su base imponible y su IVA. */
export function useReceipt(paymentId: string): UseQueryResult<ReceiptResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getPaymentsGetReceiptQueryOptions(centerId ?? '', paymentId, {
      query: { enabled: centerId !== null },
    }),
  );
}
