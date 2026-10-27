import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatEuros, formatShortDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import {
  buildChargeAmountsLine,
  canChargeBeEdited,
  getChargeStatusLabel,
  getPaymentMethodLabel,
  type PlatformCharge,
} from '../model/charge-labels';
import { Panel } from './Panel';
import { FLEXIBLE_TEXT_STYLE } from './Panel.styles';

const PLATFORM_TIME_ZONE = 'Europe/Madrid';
const CHARGE_HEADER_STYLE = { flexDirection: 'row', alignItems: 'flex-start', gap: 12 } as const;

interface ChargeCardProps {
  charge: PlatformCharge;
  /** Sin esta función la tarjeta es de solo lectura (el gestor no cambia cobros). */
  onEditPress?: () => void;
}

function buildInvoiceLine(charge: PlatformCharge): string {
  return charge.invoiceReference === null
    ? i18n.t('platform.charges.noInvoice')
    : i18n.t('platform.charges.invoice', { reference: charge.invoiceReference });
}

/** Un cobro de plan: de qué centro, cuándo, cuánto (base, IVA y total), cómo y con qué factura. */
export function ChargeCard({ charge, onEditPress }: Readonly<ChargeCardProps>): React.JSX.Element {
  const dateText = formatShortDate(`${charge.chargedOn}T12:00:00Z`, PLATFORM_TIME_ZONE);
  const methodText = getPaymentMethodLabel(charge.paymentMethod);

  return (
    <Panel>
      <View style={CHARGE_HEADER_STYLE}>
        <View style={FLEXIBLE_TEXT_STYLE}>
          <Text variant="titleMd">{charge.centerName}</Text>
          <Text color="ink2">{charge.concept}</Text>
        </View>
        <Text variant="bodyStrong">{formatEuros(charge.totalCents)}</Text>
      </View>
      <Text color="ink2">{buildChargeAmountsLine(charge)}</Text>
      <Text color="ink2">{`${dateText} · ${methodText} · ${getChargeStatusLabel(charge.status)}`}</Text>
      <Text variant="caption" color="ink2">
        {buildInvoiceLine(charge)}
      </Text>
      {onEditPress !== undefined && canChargeBeEdited(charge.status) ? (
        <Button
          variant="outline"
          label={i18n.t('platform.charges.edit')}
          accessibilityLabel={i18n.t('platform.charges.editOf', { name: charge.centerName })}
          onPress={onEditPress}
        />
      ) : null}
    </Panel>
  );
}
