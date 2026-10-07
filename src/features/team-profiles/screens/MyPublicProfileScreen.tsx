import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useActiveCenterSummary } from '@/features/auth';
import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import { useVideoPlan } from '@/features/videos';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ProfileDetailView } from '../components/ProfileDetailView';
import { ProfileEditor } from '../components/ProfileEditor';
import { STACK_STYLE } from '../components/TeamProfiles.styles';
import { useTeamProfileList } from '../hooks/useTeamProfileQueries';

interface PreviewProps {
  profile: ProfileResponseDto;
  clientWord: string;
  onClose: () => void;
}

/** La vista previa: cómo ve la clientela lo que hay guardado, con un botón para volver a editar. */
function ProfilePreview({
  profile,
  clientWord,
  onClose,
}: Readonly<PreviewProps>): React.JSX.Element {
  const center = useActiveCenterSummary();

  return (
    <View style={STACK_STYLE}>
      <Text color="ink2">{i18n.t('teamProfiles.editor.previewNote', { clientWord })}</Text>
      <ProfileDetailView profile={profile} centerName={center.name} />
      <Button
        variant="outline"
        label={i18n.t('teamProfiles.editor.closePreviewAction')}
        onPress={onClose}
      />
    </View>
  );
}

function ProfileLoadFailure({
  profiles,
  plan,
}: Readonly<{
  profiles: ReturnType<typeof useTeamProfileList>;
  plan: ReturnType<typeof useVideoPlan>;
}>): React.JSX.Element {
  return (
    <LoadErrorState
      title={i18n.t('teamProfiles.editor.loadError')}
      error={profiles.error ?? plan.error}
      onRetry={() => {
        void profiles.refetch();
        void plan.refetch();
      }}
      isRetrying={profiles.isFetching || plan.isFetching}
    />
  );
}

function MyPublicProfileContent(): React.JSX.Element {
  const profiles = useTeamProfileList();
  const plan = useVideoPlan();
  const center = useActiveCenterSummary();
  const { client } = getSectorVocabulary(useActiveCenterSectorId());
  const [isPreviewing, setIsPreviewing] = useState(false);
  const myProfile = profiles.data?.members.find(({ isMe }) => isMe);

  if (profiles.isPending || plan.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (profiles.isError || plan.isError || myProfile === undefined) {
    return <ProfileLoadFailure profiles={profiles} plan={plan} />;
  }
  if (isPreviewing) {
    return (
      <ProfilePreview
        profile={myProfile}
        clientWord={client.plural}
        onClose={() => {
          setIsPreviewing(false);
        }}
      />
    );
  }
  return (
    <ProfileEditor
      profile={myProfile}
      centerName={center.name}
      clientWord={client.plural}
      isVideoIncluded={plan.data.isIncluded}
      onPreview={() => {
        setIsPreviewing(true);
      }}
    />
  );
}

/** Prototipo `iprof`: el equipo escribe su perfil profesional y el centro lo revisa antes de publicarlo. */
export function MyPublicProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const { client } = getSectorVocabulary(useActiveCenterSectorId());

  return (
    <ScreenTemplate
      title={i18n.t('teamProfiles.editor.title')}
      subtitle={i18n.t('teamProfiles.editor.subtitle', { clientWord: client.plural })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <MyPublicProfileContent />
    </ScreenTemplate>
  );
}
