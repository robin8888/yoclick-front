import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { CenterSubscriptionResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClientUsageCard } from '../components/ClientUsageCard';
import { ManageSubscriptionButton } from '../components/ManageSubscriptionButton';
import { REPORT_SECTION_STYLE } from '../components/ReportCard.styles';
import { SubscriptionSummaryCard } from '../components/SubscriptionSummaryCard';
import { useCenterSubscription } from '../hooks/useCenterSubscription';
import { useRefreshSubscriptionOnReturn } from '../hooks/useRefreshSubscriptionOnReturn';
import { NOTE_STYLE } from './PrivacyLegalScreen.styles';

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

/** Mientras no pague con una suscripción activa, se le ofrece elegir plan; si ya paga, se le tranquiliza. */
function PlanAction({
  subscription,
}: Readonly<{ subscription: CenterSubscriptionResponseDto }>): React.JSX.Element {
  const router = useRouter();
  const isPaying = subscription.hasSubscription && subscription.status === 'active';
  if (isPaying) {
    return (
      <>
        <View style={NOTE_STYLE}>
          <Icon name="info" color="info" />
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.subscription.activeNote')}
          </Text>
        </View>
        <ManageSubscriptionButton />
      </>
    );
  }
  return (
    <Button
      label={i18n.t('centerAdmin.subscription.chooseAction')}
      isFullWidth
      onPress={() => {
        router.push('/(admin)/subscription/plans');
      }}
    />
  );
}

/**
 * Prototipo `asubs`: el plan, su estado y el uso. Elegir o cambiar de plan lleva a `aplans`, que abre la
 * página de pago de Stripe en el navegador: dentro de la app no se introducen datos de pago.
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
          <PlanAction subscription={subscription.data} />
        </View>
      )}
    </ScreenTemplate>
  );
}
