import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useActiveCenterSummary } from '@/features/auth';
import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { PendingProfileCard } from '../components/PendingProfileCard';
import { PendingReviewsSection } from '../components/PendingReviewsSection';
import { STACK_STYLE } from '../components/TeamProfiles.styles';
import { TeamMemberStatusRow } from '../components/TeamMemberStatusRow';
import { TeamSettingsSection } from '../components/TeamSettingsSection';
import { useTeamProfileList } from '../hooks/useTeamProfileQueries';

function TeamProfilesContent({
  members,
}: Readonly<{ members: readonly ProfileResponseDto[] }>): React.JSX.Element {
  const router = useRouter();
  const center = useActiveCenterSummary();
  const pending = members.filter(({ status }) => status === 'pending');

  return (
    <View style={STACK_STYLE}>
      <Button
        variant="outline"
        leadingIconName="play"
        label={i18n.t('teamProfiles.admin.myProfileAction')}
        onPress={() => {
          router.push('/(admin)/public-profile');
        }}
      />
      <Text variant="titleMd" role="heading">
        {i18n.t('teamProfiles.admin.pendingTitle')}
      </Text>
      {pending.length === 0 ? (
        <Text color="ink2">{i18n.t('teamProfiles.admin.nothingPending')}</Text>
      ) : null}
      {pending.map((profile) => (
        <PendingProfileCard key={profile.membershipId} profile={profile} centerName={center.name} />
      ))}
      <PendingReviewsSection />
      <Text variant="titleMd" role="heading">
        {i18n.t('teamProfiles.admin.teamTitle')}
      </Text>
      {members.map((profile) => (
        <TeamMemberStatusRow key={profile.membershipId} profile={profile} />
      ))}
      <TeamSettingsSection />
    </View>
  );
}

function TeamProfilesLoader(): React.JSX.Element {
  const profiles = useTeamProfileList();

  if (profiles.isPending)
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (profiles.isError) {
    return (
      <LoadErrorState
        title={i18n.t('teamProfiles.admin.loadError')}
        error={profiles.error}
        onRetry={() => void profiles.refetch()}
        isRetrying={profiles.isFetching}
      />
    );
  }
  return <TeamProfilesContent members={profiles.data.members} />;
}

/** Prototipo `aprofiles`: el centro revisa y aprueba los perfiles antes de que los vean los clientes. */
export function TeamProfilesAdminScreen(): React.JSX.Element {
  const router = useRouter();
  const { client } = getSectorVocabulary(useActiveCenterSectorId());

  return (
    <ScreenTemplate
      title={i18n.t('teamProfiles.admin.title')}
      subtitle={i18n.t('teamProfiles.admin.subtitle', { clientWord: client.plural })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <TeamProfilesLoader />
    </ScreenTemplate>
  );
}
