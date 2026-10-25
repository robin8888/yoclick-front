import { useState } from 'react';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type {
  PlatformPlanListResponseDto,
  PlatformPlanListResponseDtoPlansItem,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatEuros } from '@/shared/lib/format';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { usePlatformPlans } from '../hooks/usePlatformPlans';
import { countPayingCenters } from '../model/plan-labels';
import { PlanCard } from './PlanCard';
import { PlanPriceSheet } from './PlanPriceSheet';
import { RevenueCard } from './RevenueCard';

const PLANS_STYLE = { gap: 16 } as const;

function PlansContent({
  list,
}: Readonly<{ list: PlatformPlanListResponseDto }>): React.JSX.Element {
  const [editedPlan, setEditedPlan] = useState<PlatformPlanListResponseDtoPlansItem | null>(null);
  const payingCenterCount = list.plans.reduce((total, plan) => total + countPayingCenters(plan), 0);

  return (
    <View style={PLANS_STYLE}>
      <RevenueCard
        amountText={formatEuros(list.monthlyRecurringRevenueCents)}
        payingCenterCount={payingCenterCount}
      />
      {list.plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onEditPress={() => {
            setEditedPlan(plan);
          }}
        />
      ))}
      <Text variant="caption" color="ink2">
        {i18n.t('platform.plans.vatNote')}
      </Text>
      <PlanPriceSheet
        plan={editedPlan}
        onDismiss={() => {
          setEditedPlan(null);
        }}
      />
    </View>
  );
}

/** Los planes: lo que ingresa la plataforma al mes, cuántos centros tiene cada plan y sus precios. */
export function PlansTab(): React.JSX.Element {
  const plans = usePlatformPlans();

  if (plans.isError) {
    return (
      <LoadErrorState
        title={i18n.t('platform.plans.errorTitle')}
        error={plans.error}
        onRetry={() => void plans.refetch()}
        isRetrying={plans.isFetching}
      />
    );
  }
  if (plans.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  return <PlansContent list={plans.data} />;
}
