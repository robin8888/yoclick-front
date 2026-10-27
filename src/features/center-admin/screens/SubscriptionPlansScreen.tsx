import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { CenterSubscriptionResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { BillingPeriodToggle } from '../components/BillingPeriodToggle';
import { ManageSubscriptionButton } from '../components/ManageSubscriptionButton';
import { PlanOfferCard } from '../components/PlanOfferCard';
import { REPORT_SECTION_STYLE } from '../components/ReportCard.styles';
import { useCenterSubscription } from '../hooks/useCenterSubscription';
import { useRefreshSubscriptionOnReturn } from '../hooks/useRefreshSubscriptionOnReturn';
import { useStartPlanCheckout } from '../hooks/useStartPlanCheckout';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';
import {
  canChoosePlan,
  findPreviousPlan,
  getBestAnnualSavingsPercent,
  type BillingPeriod,
  type PlanOffer,
} from '../model/plan-offers';
import { NOTE_STYLE } from './PrivacyLegalScreen.styles';

interface PlansListProps {
  plans: readonly PlanOffer[];
  subscription: CenterSubscriptionResponseDto;
}

/** Ya paga con una suscripción de Stripe: de momento no puede cambiar de plan desde la app. */
function isPayingBySubscription(subscription: CenterSubscriptionResponseDto): boolean {
  return subscription.hasSubscription && subscription.status === 'active';
}

function PlansList({ plans, subscription }: Readonly<PlansListProps>): React.JSX.Element {
  const [period, setPeriod] = useState<BillingPeriod>(subscription.billingPeriod ?? 'monthly');
  const checkout = useStartPlanCheckout();

  return (
    <View style={REPORT_SECTION_STYLE}>
      <BillingPeriodToggle
        selectedPeriod={period}
        annualSavingsPercent={getBestAnnualSavingsPercent(plans)}
        onPeriodSelect={setPeriod}
      />
      {plans.map((plan) => (
        <PlanOfferCard
          key={plan.id}
          plan={plan}
          previousPlan={findPreviousPlan(plan, plans)}
          period={period}
          isCurrentPlan={plan.id === subscription.planId}
          canChoose={canChoosePlan({
            plan,
            period,
            currentPlanId: subscription.planId,
            currentPeriod: subscription.billingPeriod,
            hasActiveSubscription: isPayingBySubscription(subscription),
          })}
          isBusy={checkout.pendingPlanId === plan.id}
          onChoosePress={() => {
            checkout.startCheckout({ planId: plan.id, period });
          }}
        />
      ))}
      <ProblemModal
        message={checkout.checkoutErrorMessage}
        onDismiss={checkout.clearError}
        {...getProblemModalCopy()}
      />
    </View>
  );
}

function PlansNotes({
  subscription,
}: Readonly<{ subscription: CenterSubscriptionResponseDto }>): React.JSX.Element {
  const closingKey = isPayingBySubscription(subscription)
    ? 'centerAdmin.plans.activeNote'
    : 'centerAdmin.plans.browserNote';

  return (
    <View style={NOTE_STYLE}>
      <Icon name="info" color="info" />
      <View>
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.plans.vatNote')}
        </Text>
        <Text variant="caption" color="ink2">
          {i18n.t(closingKey)}
        </Text>
      </View>
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
      {isPayingBySubscription(subscription.data) ? <ManageSubscriptionButton /> : null}
      <PlansNotes subscription={subscription.data} />
    </>
  );
}

/**
 * Prototipo `aplans`: los planes para elegir, con pago mensual o anual. «Elegir» abre la página de pago de
 * Stripe en el navegador; al volver a la app se recarga la suscripción. Solo el propietario llega aquí.
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
