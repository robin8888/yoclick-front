import { paymentsPayRoomRental } from '@/shared/api/generated/endpoints/payments/payments';
import { getRoomRentalsMineQueryKey } from '@/shared/api/generated/endpoints/rooms/rooms';

import { useOnlinePayment, type OnlinePayment } from './useOnlinePayment';

/** Pagar el alquiler de una sala; al terminar se recarga la lista de alquileres. */
export function usePayRental(): OnlinePayment {
  return useOnlinePayment({
    startPayment: paymentsPayRoomRental,
    getRefreshKey: getRoomRentalsMineQueryKey,
  });
}
