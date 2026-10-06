import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { ConsentSummaryResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useConsentSummary } from '../hooks/useConsentSummary';
import { createConsentCardStyle, CONSENT_ROW_STYLE, NOTE_STYLE } from './PrivacyLegalScreen.styles';

type ConsentRowKey = 'privacy' | 'health' | 'marketing' | 'image' | 'parental';

const CONSENT_ROW_KEYS: readonly ConsentRowKey[] = [
  'privacy',
  'health',
  'marketing',
  'image',
  'parental',
];

function ConsentCard({
  summary,
}: Readonly<{ summary: ConsentSummaryResponseDto }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createConsentCardStyle(theme)}>
      {CONSENT_ROW_KEYS.map((key) => (
        <View key={key} style={CONSENT_ROW_STYLE}>
          <Text color="ink2">{i18n.t(`centerAdmin.privacy.consents.${key}`)}</Text>
          <Text variant="bodyStrong">
            {key === 'privacy'
              ? i18n.t('centerAdmin.privacy.outOf', {
                  granted: summary.privacy,
                  total: summary.clientCount,
                })
              : String(summary[key])}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Prototipo `alegal`: los consentimientos recogidos entre los clientes del centro. */
export function PrivacyLegalScreen(): React.JSX.Element {
  const router = useRouter();
  const summary = useConsentSummary();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.privacy.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <Text variant="titleMd">{i18n.t('centerAdmin.privacy.consentsTitle', { clientWord })}</Text>
      {summary.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {summary.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.privacy.errorTitle')}
          error={summary.error}
          onRetry={() => void summary.refetch()}
          isRetrying={summary.isFetching}
        />
      ) : null}
      {summary.data === undefined ? null : <ConsentCard summary={summary.data} />}
      <View style={NOTE_STYLE}>
        <Icon name="info" color="info" />
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.privacy.legalNote')}
        </Text>
      </View>
    </ScreenTemplate>
  );
}
