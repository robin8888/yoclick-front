import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createPlanCardStyle } from './PlanCard.styles';

interface RevenueCardProps {
  /** Ya escrito en euros: «1.250,00 €». */
  amountText: string;
  payingCenterCount: number;
}

/** Lo que ingresa la plataforma al mes con los centros que pagan (activos y en gracia), sin IVA. */
export function RevenueCard({
  amountText,
  payingCenterCount,
}: Readonly<RevenueCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={createPlanCardStyle(theme)}
      accessible
      accessibilityLabel={`${i18n.t('platform.plans.revenueTitle')}, ${amountText}`}
    >
      <Text variant="caption" color="ink2">
        {i18n.t('platform.plans.revenueTitle')}
      </Text>
      <Text variant="display" maxFontSizeMultiplier={1.5}>
        {amountText}
      </Text>
      <Text color="ink2">
        {i18n.t('platform.plans.payingCenters', { count: payingCenterCount })}
      </Text>
    </View>
  );
}
