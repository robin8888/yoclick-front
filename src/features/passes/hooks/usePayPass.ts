import { getPassesMineQueryKey } from '@/shared/api/generated/endpoints/passes/passes';
import { paymentsPayPass } from '@/shared/api/generated/endpoints/payments/payments';

import { useOnlinePayment, type OnlinePayment } from './useOnlinePayment';

/** Pagar un bono pendiente; al terminar se recarga la lista de bonos. */
export function usePayPass(): OnlinePayment {
  return useOnlinePayment({
    startPayment: paymentsPayPass,
    getRefreshKey: getPassesMineQueryKey,
  });
}
