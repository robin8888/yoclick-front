import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { useLegalLinks } from '@/shared/legal/useLegalLinks';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { LegalLinks } from '@/ui/molecules/LegalLinks';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { AddressDataCredit } from '@/features/address';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ConsentsSection } from '../components/ConsentsSection';
import { ExportDataSection } from '../components/ExportDataSection';
import { PrivacyRequestsSection } from '../components/PrivacyRequestsSection';
import { SECTION_STYLE } from '../components/Privacy.styles';
import { useMyConsents, useMyPrivacyRequests } from '../hooks/usePrivacyQueries';

function LegalTexts(): React.JSX.Element {
  const legal = useLegalLinks();

  return (
    <View>
      <Text variant="titleMd">{i18n.t('legal.title')}</Text>
      <LegalLinks
        links={legal.links}
        errorMessage={legal.hasOpenFailed ? i18n.t('legal.openFailed') : undefined}
      />
    </View>
  );
}

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
      <LegalTexts />
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

/**
 * Prototipo `privacy`: consentimientos, derechos ante el centro, descargar mis datos, los textos legales y
 * eliminar la cuenta.
 */
export function PrivacySettingsScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('privacy.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <PrivacySettingsContent />
      <AddressDataCredit />
    </ScreenTemplate>
  );
}
