import { useRouter } from 'expo-router';
import { Share, View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import { buildCenterJoinLink } from '@/features/onboarding';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import type { CenterSettingsResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { QrCard } from '@/ui/organisms/QrCard';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useCenterSettings } from '../hooks/useCenterSettings';
import { buildInviteMessage } from '../model/invite-messages';
import {
  createPosterStyle,
  POSTER_HEADER_STYLE,
  POSTER_STEPS_STYLE,
} from './ReceptionPosterScreen.styles';

const POSTER_STEP_KEYS = ['step1', 'step2', 'step3'] as const;

interface PosterProps {
  centerName: string;
  logoUrl: string | null;
  joinCode: string;
  sessionWord: string;
}

function Poster({
  centerName,
  logoUrl,
  joinCode,
  sessionWord,
}: Readonly<PosterProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createPosterStyle(theme)}>
      <View style={POSTER_HEADER_STYLE}>
        <Avatar name={centerName} photoUrl={logoUrl} size="lg" isDecorative />
        <Text variant="titleMd" color="onBrand">
          {centerName}
        </Text>
      </View>
      <Text variant="titleLg" color="onBrand">
        {i18n.t('centerAdmin.poster.headline', { sessionWord })}
      </Text>
      <QrCard
        value={buildCenterJoinLink(joinCode)}
        accessibilityLabel={i18n.t('centerAdmin.inviteClients.qrLabel', { centerName })}
      />
      <View style={POSTER_STEPS_STYLE}>
        {POSTER_STEP_KEYS.map((stepKey) => (
          <Text key={stepKey} color="onBrand">
            {i18n.t(`centerAdmin.poster.${stepKey}`)}
          </Text>
        ))}
      </View>
      <Text variant="bodyStrong" color="onBrand">
        {i18n.t('centerAdmin.poster.codeLine', { joinCode })}
      </Text>
    </View>
  );
}

function PosterContent({
  center,
  sessionWord,
}: Readonly<{ center: CenterSettingsResponseDto; sessionWord: string }>): React.JSX.Element {
  const joinLink = buildCenterJoinLink(center.joinCode);

  return (
    <>
      <Poster
        centerName={center.name}
        logoUrl={resolveApiAssetUrl(`/v1/centers/${center.id}/logo`)}
        joinCode={center.joinCode}
        sessionWord={sessionWord}
      />
      <Button
        isFullWidth
        leadingIconName="mail"
        label={i18n.t('centerAdmin.poster.shareAction')}
        onPress={() => {
          void Share.share({
            message: buildInviteMessage({
              centerName: center.name,
              joinCode: center.joinCode,
              joinLink,
            }),
          });
        }}
      />
    </>
  );
}

/** Prototipo `aposter`: el cartel con el logo, el QR y los tres pasos para unirse. */
export function ReceptionPosterScreen(): React.JSX.Element {
  const router = useRouter();
  const settings = useCenterSettings();
  const sessionWord = getSectorVocabulary(useActiveCenterSectorId()).session.plural;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.poster.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {settings.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {settings.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.inviteClients.errorTitle')}
          error={settings.error}
          onRetry={() => void settings.refetch()}
          isRetrying={settings.isFetching}
        />
      ) : null}
      {settings.data === undefined ? null : (
        <PosterContent center={settings.data} sessionWord={sessionWord} />
      )}
    </ScreenTemplate>
  );
}
