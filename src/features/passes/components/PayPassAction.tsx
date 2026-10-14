import { View } from 'react-native';

import type { PassListResponseDtoPassesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { usePayPass } from '../hooks/usePayPass';

const ACTION_STYLE = { gap: 8 } as const;

/** «Pagar 50 €» bajo un bono pendiente de un centro que cobra online. */
export function PayPassAction({
  pass,
}: Readonly<{ pass: PassListResponseDtoPassesItem }>): React.JSX.Element {
  const payment = usePayPass();

  return (
    <View style={ACTION_STYLE}>
      {payment.errorMessage === null ? null : <FormErrorBanner message={payment.errorMessage} />}
      {payment.isConfirmationPending ? (
        <Text variant="caption" color="ink2">
          {i18n.t('passes.pay.confirming')}
        </Text>
      ) : null}
      <Button
        isFullWidth
        size="sm"
        leadingIconName="creditCard"
        isLoading={payment.isPaying}
        label={i18n.t('passes.pay.action', { price: formatEuros(pass.priceCents) })}
        accessibilityLabel={i18n.t('passes.pay.label', { name: pass.name })}
        onPress={() => {
          payment.pay(pass.id);
        }}
      />
    </View>
  );
}
