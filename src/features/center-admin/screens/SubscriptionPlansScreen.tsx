import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { CenterSubscriptionResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { PlanOfferCard } from '../components/PlanOfferCard';
import { REPORT_SECTION_STYLE } from '../components/ReportCard.styles';
import { useCenterSubscription } from '../hooks/useCenterSubscription';
import { useRefreshSubscriptionOnReturn } from '../hooks/useRefreshSubscriptionOnReturn';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';
import { findPreviousPlan, type PlanOffer } from '../model/plan-offers';

interface PlansListProps {
  plans: readonly PlanOffer[];
  subscription: CenterSubscriptionResponseDto;
}

function PlansList({ plans, subscription }: Readonly<PlansListProps>): React.JSX.Element {
  return (
    <View style={REPORT_SECTION_STYLE}>
      {plans.map((plan) => (
        <PlanOfferCard
          key={plan.id}
          plan={plan}
          previousPlan={findPreviousPlan(plan, plans)}
          isCurrentPlan={plan.id === subscription.planId}
        />
      ))}
    </View>
  );
}

function PlansContent(): React.JSX.Element {
  const subscription = useCenterSubscription();
  const plans = useSubscriptionPlans();
  const failedQuery = [subscription, plans].find((query) => query.isError);

  if (failedQuery !== undefined) {
    return (
      <LoadErrorState
        title={i18n.t('centerAdmin.plans.errorTitle')}
        error={failedQuery.error}
        onRetry={() => void failedQuery.refetch()}
        isRetrying={failedQuery.isFetching}
      />
    );
  }
  if (subscription.data === undefined || plans.data === undefined) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  return (
    <>
      <PlansList plans={plans.data.plans} subscription={subscription.data} />
    </>
  );
}

/**
 * Prototipo `aplans`: lo que incluye cada plan. Es solo informativa, sin precios ni nada sobre cómo contratar:
 * la app no vende ni dirige a pagos externos (App Store 3.1.1 y Google Play). Al volver a la app se
 * recarga la suscripción por si ya ha cambiado.
 */
export function SubscriptionPlansScreen(): React.JSX.Element {
  const router = useRouter();
  useRefreshSubscriptionOnReturn();

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.plans.title')}
      subtitle={i18n.t('centerAdmin.plans.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <PlansContent />
    </ScreenTemplate>
  );
}
