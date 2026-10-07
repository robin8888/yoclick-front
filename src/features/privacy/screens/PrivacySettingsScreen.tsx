import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ConsentsSection } from '../components/ConsentsSection';
import { ExportDataSection } from '../components/ExportDataSection';
import { PrivacyRequestsSection } from '../components/PrivacyRequestsSection';
import { SECTION_STYLE } from '../components/Privacy.styles';
import { useMyConsents, useMyPrivacyRequests } from '../hooks/usePrivacyQueries';

function PrivacySettingsContent(): React.JSX.Element {
  const router = useRouter();
  const consents = useMyConsents();
  const requests = useMyPrivacyRequests();

  if (consents.isPending || requests.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (consents.isError || requests.isError) {
    return (
      <LoadErrorState
        title={i18n.t('privacy.loadError')}
        error={consents.error ?? requests.error}
        onRetry={() => {
          void consents.refetch();
          void requests.refetch();
        }}
        isRetrying={consents.isFetching || requests.isFetching}
      />
    );
  }
  return (
    <View style={SECTION_STYLE}>
      <ConsentsSection consents={consents.data.consents} />
      <PrivacyRequestsSection requests={requests.data.requests} />
      <ExportDataSection />
      <Button
        variant="danger"
        leadingIconName="trash"
        label={i18n.t('privacy.delete.openAction')}
        onPress={() => {
          router.push('/(client)/delete-account');
        }}
      />
    </View>
  );
}

/** Prototipo `privacy`: consentimientos, derechos ante el centro, descargar mis datos y eliminar la cuenta. */
export function PrivacySettingsScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('privacy.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <PrivacySettingsContent />
    </ScreenTemplate>
  );
}
