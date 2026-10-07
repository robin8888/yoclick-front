import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { TeamProfilesResponseDtoMembersItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { VideoPlanNotice, VideoPlanUsage } from '../components/VideoPlanNotice';
import { VideoUploadField } from '../components/VideoUploadField';
import { STACK_STYLE } from '../components/Videos.styles';
import { useTeamProfiles, useVideoPlan } from '../hooks/useVideoQueries';

type ProfileVideo = TeamProfilesResponseDtoMembersItem['video'];

/** Lo que el centro ha decidido sobre el vídeo, con palabras: aprobado, pendiente o con cambios pedidos. */
function describeReviewStatus(video: NonNullable<ProfileVideo>): string | null {
  if (video.status !== 'ready') return null;
  if (video.reviewStatus === 'pending') return i18n.t('videos.profile.statusPending');
  if (video.reviewStatus === 'approved') return i18n.t('videos.profile.statusApproved');
  return video.reviewNote === null
    ? i18n.t('videos.profile.statusChangesNoNote')
    : i18n.t('videos.profile.statusChanges', { note: video.reviewNote });
}

function PresentationVideoSection({ video }: Readonly<{ video: ProfileVideo }>): React.JSX.Element {
  const reviewText = video === null ? null : describeReviewStatus(video);

  return (
    <View style={STACK_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('videos.profile.introTitle')}
      </Text>
      {/* La lista del equipo se refresca sola al terminar la subida: no hay nada que guardar aquí. */}
      <VideoUploadField purpose="profile" video={video} onVideoChange={() => undefined} />
      {reviewText === null ? null : <Text color="ink2">{reviewText}</Text>}
      <Text variant="caption" color="ink2">
        {i18n.t('videos.profile.introHint')}
      </Text>
    </View>
  );
}

function findMyVideo(members: readonly TeamProfilesResponseDtoMembersItem[]): ProfileVideo {
  return members.find(({ isMe }) => isMe)?.video ?? null;
}

function MyPublicProfileContent(): React.JSX.Element {
  const plan = useVideoPlan();
  const profiles = useTeamProfiles();

  if (plan.isPending || profiles.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (plan.isError || profiles.isError) {
    return (
      <LoadErrorState
        title={i18n.t('videos.profile.loadError')}
        error={plan.error ?? profiles.error}
        onRetry={() => {
          void plan.refetch();
          void profiles.refetch();
        }}
        isRetrying={plan.isFetching || profiles.isFetching}
      />
    );
  }
  if (!plan.data.isIncluded) return <VideoPlanNotice />;
  return (
    <View style={STACK_STYLE}>
      <PresentationVideoSection video={findMyVideo(profiles.data.members)} />
      <VideoPlanUsage plan={plan.data} />
    </View>
  );
}

/** Prototipo `iprof`: el equipo sube su vídeo de presentación y el centro lo revisa antes de publicarlo. */
export function MyPublicProfileScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('videos.profile.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <MyPublicProfileContent />
    </ScreenTemplate>
  );
}
