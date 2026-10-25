import { View } from 'react-native';

import { formatStorageSize } from '@/features/videos';
import type { PlatformPlanListResponseDtoPlansItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import {
  buildPriceLines,
  calculatePlanMonthlyRevenueCents,
  countAllCenters,
  getPlanName,
} from '../model/plan-labels';
import { createPlanCardStyle, PLAN_HEADER_STYLE, PLAN_LINES_STYLE } from './PlanCard.styles';

type Plan = PlatformPlanListResponseDtoPlansItem;

interface PlanCardProps {
  plan: Plan;
  onEditPress: () => void;
}

function buildLimitsLine(plan: Plan): string {
  const clients =
    plan.maxClients === null
      ? i18n.t('platform.plans.unlimitedClients')
      : i18n.t('platform.plans.clientLimit', { count: plan.maxClients });
  const video =
    plan.videoStorageLimitBytes === null
      ? i18n.t('platform.plans.noVideo')
      : i18n.t('platform.plans.videoLimit', {
          size: formatStorageSize(plan.videoStorageLimitBytes),
        });
  const documents = i18n.t('platform.plans.documentLimit', {
    size: formatStorageSize(plan.documentStorageLimitBytes),
  });
  return `${clients} · ${documents} · ${video}`;
}

function buildCentersLine(plan: Plan): string {
  const { trial, active, past_due: pastDue, suspended } = plan.centerCountByStatus;
  return i18n.t('platform.plans.centersByStatus', { trial, active, pastDue, suspended });
}

/** Un plan: su precio, cuántos centros lo tienen por estado, lo que aporta al mes y sus límites. */
export function PlanCard({ plan, onEditPress }: Readonly<PlanCardProps>): React.JSX.Element {
  const theme = useTheme();
  const name = getPlanName(plan.id);
  const totalCenters = countAllCenters(plan);

  return (
    <View style={createPlanCardStyle(theme)}>
      <View style={PLAN_HEADER_STYLE}>
        <Text variant="titleMd">{name}</Text>
        <View
          accessible
          accessibilityLabel={i18n.t('platform.plans.centersCount', { count: totalCenters })}
        >
          <Text variant="metric">{String(totalCenters)}</Text>
        </View>
      </View>
      <View style={PLAN_LINES_STYLE}>
        {buildPriceLines(plan).map((line) => (
          <Text key={line} variant="bodyStrong">
            {line}
          </Text>
        ))}
      </View>
      <Text color="ink2">{buildCentersLine(plan)}</Text>
      <Text color="ink2">
        {i18n.t('platform.plans.revenue', {
          amount: formatEuros(calculatePlanMonthlyRevenueCents(plan)),
        })}
      </Text>
      <Text variant="caption" color="ink2">
        {buildLimitsLine(plan)}
      </Text>
      <Button
        variant="outline"
        label={i18n.t('platform.plans.editPrices')}
        accessibilityLabel={i18n.t('platform.plans.editPricesOf', { name })}
        onPress={onEditPress}
      />
    </View>
  );
}
