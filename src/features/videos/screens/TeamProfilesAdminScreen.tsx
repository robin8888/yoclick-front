import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { TeamProfilesResponseDtoMembersItem } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { PlayableVideo } from '../components/PlayableVideo';
import { ReviewVideoControls } from '../components/ReviewVideoControls';
import { TeamMemberVideoRow } from '../components/TeamMemberVideoRow';
import { createCardStyle, STACK_STYLE } from '../components/Videos.styles';
import { useTeamProfiles } from '../hooks/useVideoQueries';

type Member = TeamProfilesResponseDtoMembersItem;

function isWaitingForReview(member: Member): boolean {
  return member.video?.status === 'ready' && member.video.reviewStatus === 'pending';
}

function PendingReviewCard({ member }: Readonly<{ member: Member }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCardStyle(theme)}>
      <Text variant="bodyStrong">{member.fullName}</Text>
      {member.video === null ? null : <PlayableVideo video={member.video} />}
      {member.video === null ? null : <ReviewVideoControls videoId={member.video.id} />}
    </View>
  );
}

function TeamProfilesContent({
  members,
}: Readonly<{ members: readonly Member[] }>): React.JSX.Element {
  const router = useRouter();
  const pendingMembers = members.filter(isWaitingForReview);

  return (
    <View style={STACK_STYLE}>
      <Button
        variant="outline"
        leadingIconName="play"
        label={i18n.t('videos.teamAdmin.myVideoAction')}
        onPress={() => {
          router.push('/(admin)/public-profile');
        }}
      />
      <Text variant="titleMd" role="heading">
        {i18n.t('videos.teamAdmin.pendingTitle')}
      </Text>
      {pendingMembers.length === 0 ? (
        <Text color="ink2">{i18n.t('videos.teamAdmin.nothingPending')}</Text>
      ) : (
        pendingMembers.map((member) => (
          <PendingReviewCard key={member.membershipId} member={member} />
        ))
      )}
      <Text variant="titleMd" role="heading">
        {i18n.t('videos.teamAdmin.teamTitle')}
      </Text>
      {members.map((member) => (
        <TeamMemberVideoRow key={member.membershipId} member={member} />
      ))}
    </View>
  );
}

/** Prototipo `aprofiles`: el centro revisa y aprueba los vídeos del equipo antes de que los vean los clientes. */
export function TeamProfilesAdminScreen(): React.JSX.Element {
  const router = useRouter();
  const profiles = useTeamProfiles();
  const { client } = getSectorVocabulary(useActiveCenterSectorId());

  return (
    <ScreenTemplate
      title={i18n.t('videos.teamAdmin.title')}
      subtitle={i18n.t('videos.teamAdmin.subtitle', { clientWord: client.plural })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {profiles.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {profiles.isError ? (
        <LoadErrorState
          title={i18n.t('videos.teamAdmin.loadError')}
          error={profiles.error}
          onRetry={() => void profiles.refetch()}
          isRetrying={profiles.isFetching}
        />
      ) : null}
      {profiles.data === undefined ? null : <TeamProfilesContent members={profiles.data.members} />}
    </ScreenTemplate>
  );
}
