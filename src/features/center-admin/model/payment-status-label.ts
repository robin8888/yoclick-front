import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';

interface PaymentStatusInput {
  status: 'pending' | 'succeeded' | 'failed';
  amountCents: number;
  refundedCents: number;
}

/**
 * «Pagado», «Reembolsado» o «Reembolsado 20 €». Los reembolsos los hace el centro en su panel de
 * Stripe y la app solo los refleja.
 */
export function buildPaymentStatusLabel(payment: PaymentStatusInput): string {
  if (payment.status === 'succeeded' && payment.refundedCents >= payment.amountCents) {
    return i18n.t('centerAdmin.payments.status.refunded');
  }
  if (payment.status === 'succeeded' && payment.refundedCents > 0) {
    return i18n.t('centerAdmin.payments.status.partiallyRefunded', {
      amount: formatEuros(payment.refundedCents),
    });
  }
  return i18n.t(`centerAdmin.payments.status.${payment.status}`);
}
