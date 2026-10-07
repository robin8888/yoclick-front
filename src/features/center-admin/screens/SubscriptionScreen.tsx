import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { CenterSubscriptionResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClientUsageCard } from '../components/ClientUsageCard';
import { REPORT_SECTION_STYLE } from '../components/ReportCard.styles';
import { SubscriptionSummaryCard } from '../components/SubscriptionSummaryCard';
import { useCenterSubscription } from '../hooks/useCenterSubscription';
import { NOTE_STYLE } from './PrivacyLegalScreen.styles';

const STATUS_NOTE_KEYS = {
  past_due: 'centerAdmin.subscription.pastDueNote',
  suspended: 'centerAdmin.subscription.suspendedNote',
} as const;

function StatusNote({
  status,
}: Readonly<{ status: CenterSubscriptionResponseDto['status'] }>): React.JSX.Element | null {
  if (status !== 'past_due' && status !== 'suspended') return null;
  return (
    <Text variant="bodyStrong" color="warning">
      {i18n.t(STATUS_NOTE_KEYS[status])}
    </Text>
  );
}

/**
 * Prototipo `asubs`: el plan, su estado y el uso. La suscripción se paga en la web (decisión del 5 oct
 * 2026), así que aquí no hay método de pago, facturas ni cambio de plan.
 */
export function SubscriptionScreen(): React.JSX.Element {
  const router = useRouter();
  const subscription = useCenterSubscription();
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
          <StatusNote status={subscription.data.status} />
          <ClientUsageCard subscription={subscription.data} clientWord={clientWord} />
        </View>
      )}
      <View style={NOTE_STYLE}>
        <Icon name="info" color="info" />
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.subscription.webNote')}
        </Text>
      </View>
    </ScreenTemplate>
  );
}
