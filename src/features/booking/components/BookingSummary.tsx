import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  formatBookingDayAndTime,
  formatServiceDuration,
  formatServicePrice,
} from '../model/booking-labels';
import { createSummaryStyle, SUMMARY_ROW_STYLE } from './BookingSummary.styles';

interface BookingSummaryProps {
  serviceName: string;
  durationMinutes: number | null;
  priceCents: number | null;
  startsAt: string;
  timeZone: string;
  staffName: string;
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: Readonly<SummaryRowProps>): React.JSX.Element {
  return (
    <View style={SUMMARY_ROW_STYLE}>
      <Text color="ink2">{label}</Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

/** Lo que se va a reservar, en filas etiqueta + valor. */
export function BookingSummary({
  serviceName,
  durationMinutes,
  priceCents,
  startsAt,
  timeZone,
  staffName,
}: Readonly<BookingSummaryProps>): React.JSX.Element {
  const theme = useTheme();
  const serviceText =
    durationMinutes === null
      ? serviceName
      : `${serviceName} · ${formatServiceDuration(durationMinutes)}`;

  return (
    <View style={createSummaryStyle(theme)}>
      <SummaryRow label={i18n.t('booking.confirm.serviceLabel')} value={serviceText} />
      <SummaryRow
        label={i18n.t('booking.confirm.whenLabel')}
        value={formatBookingDayAndTime(startsAt, timeZone)}
      />
      <SummaryRow label={i18n.t('booking.confirm.staffLabel')} value={staffName} />
      <SummaryRow
        label={i18n.t('booking.confirm.priceLabel')}
        value={formatServicePrice(priceCents) ?? i18n.t('booking.book.priceOnRequest')}
      />
    </View>
  );
}
