import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { STACK_STYLE } from '../components/TeamProfiles.styles';
import { TeamMemberCard } from '../components/TeamMemberCard';
import { useTeamProfileList } from '../hooks/useTeamProfileQueries';

function TeamList({
  members,
}: Readonly<{ members: readonly ProfileResponseDto[] }>): React.JSX.Element {
  const router = useRouter();

  return (
    <View style={STACK_STYLE}>
      {members.map((profile) => (
        <TeamMemberCard
          key={profile.membershipId}
          profile={profile}
          onPress={() => {
            router.push({
              pathname: '/(client)/team/[membershipId]',
              params: { membershipId: profile.membershipId },
            });
          }}
        />
      ))}
    </View>
  );
}

function TeamContent(): React.JSX.Element {
  const profiles = useTeamProfileList();

  if (profiles.isPending)
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (profiles.isError) {
    return (
      <LoadErrorState
        title={i18n.t('teamProfiles.team.loadError')}
        error={profiles.error}
        onRetry={() => void profiles.refetch()}
        isRetrying={profiles.isFetching}
      />
    );
  }
  if (profiles.data.members.length === 0) {
    return (
      <EmptyState
        iconName="users"
        title={i18n.t('teamProfiles.team.emptyTitle')}
        description={i18n.t('teamProfiles.team.emptyDescription')}
        actionLabel={getSharedStateCopy().retryLabel}
        onActionPress={() => void profiles.refetch()}
      />
    );
  }
  return <TeamList members={profiles.data.members} />;
}

/** Prototipo `team`: la clientela conoce al equipo antes de reservar. */
export function TeamScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('teamProfiles.team.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <TeamContent />
    </ScreenTemplate>
  );
}
