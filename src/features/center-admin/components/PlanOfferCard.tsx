import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import {
  getAnnualChargeCents,
  getMonthlyPriceCents,
  type BillingPeriod,
  type PlanOffer,
} from '../model/plan-offers';
import { PlanIncludes } from './PlanIncludes';
import { createReportCardStyle, REPORT_HEADER_ROW_STYLE } from './ReportCard.styles';

interface PlanOfferCardProps {
  plan: PlanOffer;
  /** El plan justo por debajo en precio; `undefined` en el más barato. */
  previousPlan: PlanOffer | undefined;
  period: BillingPeriod;
  /** Es el plan que el centro tiene ahora. */
  isCurrentPlan: boolean;
  /** Se puede pulsar «Elegir»: el plan existe en Stripe y no es lo que ya se paga. */
  canChoose: boolean;
  isBusy: boolean;
  onChoosePress: () => void;
}

function describeBilling(plan: PlanOffer, period: BillingPeriod): string {
  return period === 'annual'
    ? i18n.t('centerAdmin.plans.billedAnnually', { price: formatEuros(getAnnualChargeCents(plan)) })
    : i18n.t('centerAdmin.plans.billedMonthly');
}

function ChooseButton({
  plan,
  period,
  canChoose,
  isBusy,
  onChoosePress,
}: Readonly<Omit<PlanOfferCardProps, 'isCurrentPlan' | 'previousPlan'>>): React.JSX.Element {
  if (!plan.isAvailable) {
    return <Text color="ink2">{i18n.t('centerAdmin.plans.unavailable')}</Text>;
  }
  return (
    <Button
      label={i18n.t('centerAdmin.plans.choose', { name: plan.name })}
      accessibilityLabel={i18n.t('centerAdmin.plans.chooseA11y', {
        name: plan.name,
        period: i18n.t(`centerAdmin.subscription.periods.${period}`),
      })}
      isFullWidth
      isLoading={isBusy}
      isDisabled={!canChoose}
      onPress={onChoosePress}
    />
  );
}

/** Un plan que se puede contratar: precio al mes con la periodicidad elegida, qué incluye y «Elegir». */
export function PlanOfferCard(props: Readonly<PlanOfferCardProps>): React.JSX.Element {
  const { plan, previousPlan, period, isCurrentPlan } = props;
  const theme = useTheme();

  return (
    <View style={createReportCardStyle(theme)}>
      <View style={REPORT_HEADER_ROW_STYLE}>
        <Text variant="titleLg">{plan.name}</Text>
        {isCurrentPlan ? (
          <Badge label={i18n.t('centerAdmin.plans.currentBadge')} tone="info" />
        ) : null}
      </View>
      <Text variant="metric" maxFontSizeMultiplier={1.4}>
        {i18n.t('centerAdmin.plans.pricePerMonth', {
          price: formatEuros(getMonthlyPriceCents(plan, period)),
        })}
      </Text>
      <Text color="ink2">{describeBilling(plan, period)}</Text>
      {plan.setupFeeCents > 0 ? (
        <Text color="ink2">
          {i18n.t('centerAdmin.plans.setupFee', { price: formatEuros(plan.setupFeeCents) })}
        </Text>
      ) : null}
      <PlanIncludes plan={plan} previousPlan={previousPlan} />
      <ChooseButton {...props} />
    </View>
  );
}
