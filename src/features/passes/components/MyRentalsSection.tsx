import { View } from 'react-native';

import type { MyRentalsResponseDtoRentalsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros, formatShortDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useMyRentals } from '../hooks/useMyRentals';
import { usePayRental } from '../hooks/usePayRental';
import { usePaymentsStatus } from '../hooks/usePaymentsStatus';

const SECTION_STYLE = { gap: 8 } as const;

function describeRental(rental: MyRentalsResponseDtoRentalsItem): string {
  const when = formatShortDate(rental.startsAt);
  if (rental.priceCents === null) return when;
  const state = i18n.t(rental.isPaid ? 'passes.rentals.paid' : 'passes.rentals.unpaid');
  return `${when} · ${formatEuros(rental.priceCents)} · ${state}`;
}

interface RentalItemProps {
  rental: MyRentalsResponseDtoRentalsItem;
  canPayOnline: boolean;
  isPaying: boolean;
  onPayPress: () => void;
}

function RentalItem({
  rental,
  canPayOnline,
  isPaying,
  onPayPress,
}: Readonly<RentalItemProps>): React.JSX.Element {
  const isPayable = canPayOnline && rental.priceCents !== null && !rental.isPaid;

  return (
    <View style={SECTION_STYLE}>
      <Text variant="bodyStrong">{rental.roomName}</Text>
      <Text variant="caption" color="ink2">
        {describeRental(rental)}
      </Text>
      {isPayable && rental.priceCents !== null ? (
        <Button
          isFullWidth
          size="sm"
          leadingIconName="creditCard"
          isLoading={isPaying}
          label={i18n.t('passes.pay.action', { price: formatEuros(rental.priceCents) })}
          accessibilityLabel={i18n.t('passes.rentals.payLabel', { name: rental.roomName })}
          onPress={onPayPress}
        />
      ) : null}
    </View>
  );
}

/** Los alquileres de sala a nombre de la persona; los pendientes de pago se pagan con tarjeta. */
export function MyRentalsSection(): React.JSX.Element | null {
  const rentals = useMyRentals();
  const payment = usePayRental();
  const canPayOnline = usePaymentsStatus() === 'ready';
  const items = rentals.data?.rentals ?? [];
  if (items.length === 0) return null;

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('passes.rentals.title')}
      </Text>
      {payment.errorMessage === null ? null : <FormErrorBanner message={payment.errorMessage} />}
      {payment.isConfirmationPending ? (
        <Text variant="caption" color="ink2">
          {i18n.t('passes.pay.confirming')}
        </Text>
      ) : null}
      {items.map((rental) => (
        <RentalItem
          key={rental.id}
          rental={rental}
          canPayOnline={canPayOnline}
          isPaying={payment.isPaying}
          onPayPress={() => {
            payment.pay(rental.id);
          }}
        />
      ))}
    </View>
  );
}
