import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';

import { useMyReceipts } from '../hooks/useMyReceipts';

const RECEIPT_TIME_ZONE = 'Europe/Madrid';

/** «Recibos»: los pagos hechos desde la app, cada uno con su recibo (con el IVA desglosado). */
export function MyReceiptsSection(): React.JSX.Element | null {
  const router = useRouter();
  const payments = (useMyReceipts().data?.payments ?? []).filter(
    ({ receiptNumber }) => receiptNumber !== null,
  );
  if (payments.length === 0) return null;

  return (
    <>
      <Text variant="titleMd" role="heading">
        {i18n.t('receipts.sectionTitle')}
      </Text>
      {payments.map((payment) => (
        <ListItem
          key={payment.id}
          leadingIconName="file"
          title={`${payment.label} · ${formatEuros(payment.amountCents)}`}
          subtitle={i18n.t('receipts.rowSubtitle', {
            receiptNumber: payment.receiptNumber ?? '',
            date: formatShortDate(payment.paidAt ?? payment.createdAt, RECEIPT_TIME_ZONE),
          })}
          onPress={() => {
            router.push({ pathname: '/(client)/receipt', params: { paymentId: payment.id } });
          }}
        />
      ))}
    </>
  );
}
