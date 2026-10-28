import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import type { PlanOffer } from '../model/plan-offers';
import { PlanIncludes } from './PlanIncludes';
import { createReportCardStyle, REPORT_HEADER_ROW_STYLE } from './ReportCard.styles';

interface PlanOfferCardProps {
  plan: PlanOffer;
  /** El plan justo por debajo en precio; `undefined` en el más barato. */
  previousPlan: PlanOffer | undefined;
  /** Es el plan que el centro tiene ahora. */
  isCurrentPlan: boolean;
}

/**
 * Un plan: su nombre y lo que incluye. No muestra precios ni dice cómo contratar: la app no vende ni
 * dirige a pagos externos (App Store 3.1.1), así que solo informa de lo que da cada plan.
 */
export function PlanOfferCard({
  plan,
  previousPlan,
  isCurrentPlan,
}: Readonly<PlanOfferCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createReportCardStyle(theme)}>
      <View style={REPORT_HEADER_ROW_STYLE}>
        <Text variant="titleLg">{plan.name}</Text>
        {isCurrentPlan ? (
          <Badge label={i18n.t('centerAdmin.plans.currentBadge')} tone="info" />
        ) : null}
      </View>
      <PlanIncludes plan={plan} previousPlan={previousPlan} />
    </View>
  );
}
