import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { ReceiptResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatEuros } from '@/shared/lib/format';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useReceipt } from '../hooks/useReceipt';
import { useShareReceipt } from '../hooks/useShareReceipt';
import { receiptRouteParamsSchema } from '../model/receipt-route-params';

/** Hasta que la API traiga la zona del centro en los cobros, como en las citas. */
const RECEIPT_TIME_ZONE = 'Europe/Madrid';
const LINES_STYLE = { gap: 8 } as const;
const LINE_STYLE = { gap: 2 } as const;

function ReceiptLine({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={LINE_STYLE}>
      <Text variant="caption" color="ink2">
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

function ReceiptDetails({ receipt }: Readonly<{ receipt: ReceiptResponseDto }>): React.JSX.Element {
  const { seller } = receipt;
  const sellerLines = [seller.legalName, seller.taxId, seller.taxAddress].filter(
    (line): line is string => line !== null && line !== '',
  );
  return (
    <View style={LINES_STYLE}>
      <ReceiptLine label={i18n.t('receipts.number')} value={receipt.receiptNumber} />
      <ReceiptLine
        label={i18n.t('receipts.date')}
        value={formatShortDate(receipt.issuedAt, RECEIPT_TIME_ZONE)}
      />
      <ReceiptLine label={i18n.t('receipts.seller')} value={sellerLines.join(' · ')} />
      <ReceiptLine label={i18n.t('receipts.buyerLabel')} value={receipt.buyerName} />
      <ReceiptLine label={i18n.t('receipts.concept')} value={receipt.concept} />
      <ReceiptLine label={i18n.t('receipts.base')} value={formatEuros(receipt.baseCents)} />
      <ReceiptLine
        label={i18n.t('receipts.vat', { rate: receipt.vatRatePercent })}
        value={formatEuros(receipt.vatCents)}
      />
      <ReceiptLine label={i18n.t('receipts.total')} value={formatEuros(receipt.totalCents)} />
      <Text variant="caption" color="ink2">
        {i18n.t('receipts.vatIncludedNote')}
      </Text>
      {receipt.refundedCents > 0 ? (
        <Text color="warning">
          {i18n.t('receipts.refunded', { amount: formatEuros(receipt.refundedCents) })}
        </Text>
      ) : null}
    </View>
  );
}

function ReceiptContent({ paymentId }: Readonly<{ paymentId: string }>): React.JSX.Element {
  const router = useRouter();
  const receipt = useReceipt(paymentId);
  const sharing = useShareReceipt(RECEIPT_TIME_ZONE);
  const loadedReceipt = receipt.data;

  return (
    <ScreenTemplate
      title={i18n.t('receipts.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        loadedReceipt === undefined ? undefined : (
          <Button
            isFullWidth
            leadingIconName="send"
            isLoading={sharing.isSharing}
            label={i18n.t('receipts.shareAction')}
            onPress={() => {
              sharing.shareReceipt(loadedReceipt);
            }}
          />
        )
      }
    >
      {receipt.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {receipt.isError ? (
        <LoadErrorState
          title={i18n.t('receipts.loadError')}
          error={receipt.error}
          onRetry={() => void receipt.refetch()}
          isRetrying={receipt.isFetching}
        />
      ) : null}
      {loadedReceipt === undefined ? null : <ReceiptDetails receipt={loadedReceipt} />}
      {sharing.errorMessage === null ? null : <FormErrorBanner message={sharing.errorMessage} />}
    </ScreenTemplate>
  );
}

/** El recibo de un cobro: quién cobra, a quién, el concepto, la base, el IVA y el total. */
export function ReceiptScreen(): React.JSX.Element {
  const params = receiptRouteParamsSchema.safeParse(useLocalSearchParams());
  if (!params.success) return <Redirect href="/" />;
  return <ReceiptContent paymentId={params.data.paymentId} />;
}
