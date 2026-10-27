import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';

import type { BillingPeriod } from '../model/plan-offers';

const PERIOD_CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;
const TOGGLE_STYLE = { gap: 8 } as const;

interface BillingPeriodToggleProps {
  selectedPeriod: BillingPeriod;
  /** El mayor ahorro de pagar el año entero; 0 no lo anuncia. */
  annualSavingsPercent: number;
  onPeriodSelect: (period: BillingPeriod) => void;
}

/** Elige si el plan se paga mes a mes o una vez al año (más barato por mes). */
export function BillingPeriodToggle({
  selectedPeriod,
  annualSavingsPercent,
  onPeriodSelect,
}: Readonly<BillingPeriodToggleProps>): React.JSX.Element {
  const annualLabel =
    annualSavingsPercent > 0
      ? i18n.t('centerAdmin.plans.annualWithSavings', { percent: annualSavingsPercent })
      : i18n.t('centerAdmin.plans.annual');

  return (
    <View style={TOGGLE_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.plans.periodLabel')}</Text>
      <View accessibilityRole="radiogroup" style={PERIOD_CHIPS_STYLE}>
        <Chip
          label={i18n.t('centerAdmin.plans.monthly')}
          isSelected={selectedPeriod === 'monthly'}
          selectionRole="radio"
          onPress={() => {
            onPeriodSelect('monthly');
          }}
        />
        <Chip
          label={annualLabel}
          isSelected={selectedPeriod === 'annual'}
          selectionRole="radio"
          onPress={() => {
            onPeriodSelect('annual');
          }}
        />
      </View>
    </View>
  );
}
