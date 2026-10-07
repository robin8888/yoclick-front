import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { TeamProfilesResponseDtoMembersItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { PlayableVideo } from '../components/PlayableVideo';
import { createCardStyle, STACK_STYLE } from '../components/Videos.styles';
import { useTeamProfiles } from '../hooks/useVideoQueries';

function TeamVideoCard({
  member,
}: Readonly<{ member: TeamProfilesResponseDtoMembersItem }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCardStyle(theme)}>
      <Text variant="titleMd">{member.fullName}</Text>
      {member.staffTitle === null ? null : <Text color="ink2">{member.staffTitle}</Text>}
      {member.video === null ? null : <PlayableVideo video={member.video} />}
    </View>
  );
}

function TeamVideosContent(): React.JSX.Element {
  const profiles = useTeamProfiles();

  if (profiles.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (profiles.isError) {
    return (
      <LoadErrorState
        title={i18n.t('videos.team.loadError')}
        error={profiles.error}
        onRetry={() => void profiles.refetch()}
        isRetrying={profiles.isFetching}
      />
    );
  }
  const membersWithVideo = profiles.data.members.filter(({ video }) => video !== null);
  if (membersWithVideo.length === 0) {
    return (
      <EmptyState
        iconName="users"
        title={i18n.t('videos.team.emptyTitle')}
        description={i18n.t('videos.team.emptyDescription')}
        actionLabel={getSharedStateCopy().retryLabel}
        onActionPress={() => void profiles.refetch()}
      />
    );
  }
  return (
    <View style={STACK_STYLE}>
      {membersWithVideo.map((member) => (
        <TeamVideoCard key={member.membershipId} member={member} />
      ))}
    </View>
  );
}

/** Prototipo `team`: la clientela conoce al equipo por su vídeo de presentación antes de reservar. */
export function TeamVideosScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('videos.team.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <TeamVideosContent />
    </ScreenTemplate>
  );
}
