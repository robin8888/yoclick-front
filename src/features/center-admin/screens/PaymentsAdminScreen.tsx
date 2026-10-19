import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { PaymentListResponseDtoPaymentsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatEuros, formatShortDate } from '@/shared/lib/format';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { usePaymentsList } from '../hooks/usePaymentsList';
import { buildPaymentStatusLabel } from '../model/payment-status-label';

const ROW_STYLE = { gap: 2 } as const;

function ReceiptNumber({ receiptNumber }: Readonly<{ receiptNumber: string | null }>) {
  if (receiptNumber === null) return null;
  return (
    <Text variant="caption" color="brandInk">
      {i18n.t('centerAdmin.payments.receiptNumber', { receiptNumber })}
    </Text>
  );
}

/** «Bono 10 · Ana Ruiz» y debajo «Bono · 12 oct · 50 € · Pagado». */
function PaymentRow({
  payment,
  onReceiptPress,
}: Readonly<{
  payment: PaymentListResponseDtoPaymentsItem;
  onReceiptPress: (paymentId: string) => void;
}>): React.JSX.Element {
  const kind = i18n.t(`centerAdmin.payments.kind.${payment.kind}`);
  const status = buildPaymentStatusLabel(payment);
  const amount = formatEuros(payment.amountCents);
  const when = formatShortDate(payment.paidAt ?? payment.createdAt);

  const hasReceipt = payment.receiptNumber !== null;

  return (
    <Pressable
      role={hasReceipt ? 'button' : undefined}
      style={ROW_STYLE}
      accessible
      accessibilityLabel={i18n.t('centerAdmin.payments.rowLabel', {
        label: payment.label,
        clientName: payment.clientName,
        amount,
        status,
      })}
      accessibilityHint={hasReceipt ? i18n.t('centerAdmin.payments.receiptHint') : undefined}
      disabled={!hasReceipt}
      onPress={() => {
        onReceiptPress(payment.id);
      }}
    >
      <Text variant="bodyStrong">{`${payment.label} · ${payment.clientName}`}</Text>
      <Text variant="caption" color="ink2">
        {`${kind} · ${when} · ${amount} · ${status}`}
      </Text>
      <ReceiptNumber receiptNumber={payment.receiptNumber} />
    </Pressable>
  );
}

/** Los cobros online del centro: qué se pagó, quién, cuánto y si Stripe lo confirmó. */
export function PaymentsAdminScreen(): React.JSX.Element {
  const router = useRouter();
  const payments = usePaymentsList();
  const items = payments.data?.payments ?? [];

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.payments.title')}
      subtitle={i18n.t('centerAdmin.payments.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {payments.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {payments.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.payments.loadError')}
          error={payments.error}
          onRetry={() => void payments.refetch()}
          isRetrying={payments.isFetching}
        />
      ) : null}
      {payments.isSuccess && items.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.payments.empty')}</Text>
      ) : null}
      {items.map((payment) => (
        <PaymentRow
          key={payment.id}
          payment={payment}
          onReceiptPress={(paymentId) => {
            router.push({ pathname: '/(admin)/receipt', params: { paymentId } });
          }}
        />
      ))}
    </ScreenTemplate>
  );
}
