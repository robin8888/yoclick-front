import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { paymentsConfirm } from '@/shared/api/generated/endpoints/payments/payments';
import type { PaymentSheetResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { presentPaymentSheet, type PaymentSheetResult } from '@/shared/payments/payment-sheet';

import { useActiveCenterId } from './useActiveCenterId';

type OnlinePaymentOutcome = PaymentSheetResult | 'pending';

export interface OnlinePayment {
  pay: (targetId: string) => void;
  isPaying: boolean;
  errorMessage: string | null;
  /** El pago se hizo pero Stripe aún no lo da por cerrado: se refleja al volver a consultar. */
  isConfirmationPending: boolean;
}

interface OnlinePaymentConfig {
  /** Pide al servidor que prepare el cobro de lo que se paga (un bono, un alquiler). */
  startPayment: (centerId: string, targetId: string) => Promise<PaymentSheetResponseDto>;
  /** La consulta que cambia al pagar: se recarga al terminar, pague o no. */
  getRefreshKey: (centerId: string) => QueryKey;
}

function describeFailure(outcome: OnlinePaymentOutcome | undefined): string | null {
  if (outcome === 'failed') return i18n.t('passes.pay.failed');
  if (outcome === 'unavailable') return i18n.t('passes.pay.unavailable');
  return null;
}

/**
 * Pagar con la hoja de Stripe: el servidor prepara el cobro, la hoja lo cobra y el servidor lo
 * comprueba antes de dar nada por pagado. La app nunca marca nada como pagado por su cuenta.
 */
export function useOnlinePayment(config: OnlinePaymentConfig): OnlinePayment {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation<OnlinePaymentOutcome, unknown, string>({
    mutationFn: async (targetId) => {
      const sheet = await config.startPayment(centerId, targetId);
      const result = await presentPaymentSheet(sheet);
      if (result !== 'paid') return result;
      const confirmation = await paymentsConfirm(centerId, sheet.paymentId);
      return confirmation.status === 'succeeded' ? 'paid' : 'pending';
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: config.getRefreshKey(centerId) });
    },
  });

  return {
    pay: (targetId) => {
      mutation.mutate(targetId);
    },
    isPaying: mutation.isPending,
    errorMessage: mutation.isError
      ? getApiErrorMessage(mutation.error)
      : describeFailure(mutation.data),
    isConfirmationPending: mutation.data === 'pending',
  };
}
