import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { CenterSubscriptionResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClientUsageCard } from '../components/ClientUsageCard';
import { REPORT_SECTION_STYLE } from '../components/ReportCard.styles';
import { SubscriptionSummaryCard } from '../components/SubscriptionSummaryCard';
import { useCenterSubscription } from '../hooks/useCenterSubscription';
import { useRefreshSubscriptionOnReturn } from '../hooks/useRefreshSubscriptionOnReturn';

const PLATFORM_TIME_ZONE = 'Europe/Madrid';

function StatusNote({
  subscription,
}: Readonly<{ subscription: CenterSubscriptionResponseDto }>): React.JSX.Element | null {
  const { status, graceEndsAt } = subscription;
  if (status === 'suspended') {
    return (
      <Text variant="bodyStrong" color="warning">
        {i18n.t('centerAdmin.subscription.suspendedNote')}
      </Text>
    );
  }
  if (status !== 'past_due') return null;
  const untilText =
    graceEndsAt === null
      ? ''
      : ` ${i18n.t('centerAdmin.subscription.pastDueUntil', { date: formatShortDate(graceEndsAt, PLATFORM_TIME_ZONE) })}`;
  return (
    <Text variant="bodyStrong" color="warning">
      {`${i18n.t('centerAdmin.subscription.pastDueNote')}${untilText}`}
    </Text>
  );
}

/** «Ver planes» lleva a lo que incluye cada plan; no dice cómo contratar ni cambiar de plan. */
function PlanAction(): React.JSX.Element {
  const router = useRouter();
  return (
    <Button
      label={i18n.t('centerAdmin.subscription.changeAction')}
      variant="secondary"
      isFullWidth
      onPress={() => {
        router.push('/(admin)/subscription/plans');
      }}
    />
  );
}

/**
 * Prototipo `asubs`: el plan, su estado y el uso. «Ver planes» lleva a `aplans`, que solo informa: la app
 * no vende ni dirige a pagos externos (App Store 3.1.1 y Google Play).
 */
export function SubscriptionScreen(): React.JSX.Element {
  const router = useRouter();
  const subscription = useCenterSubscription();
  useRefreshSubscriptionOnReturn();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.subscription.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {subscription.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {subscription.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.subscription.errorTitle')}
          error={subscription.error}
          onRetry={() => void subscription.refetch()}
          isRetrying={subscription.isFetching}
        />
      ) : null}
      {subscription.data === undefined ? null : (
        <View style={REPORT_SECTION_STYLE}>
          <SubscriptionSummaryCard subscription={subscription.data} />
          <StatusNote subscription={subscription.data} />
          <ClientUsageCard subscription={subscription.data} clientWord={clientWord} />
          <PlanAction />
        </View>
      )}
    </ScreenTemplate>
  );
}
