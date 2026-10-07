import { View } from 'react-native';

import { PlayableVideo, useDeleteVideo, VideoUploadField } from '@/features/videos';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { STACK_STYLE } from './TeamProfiles.styles';

const MAX_TECHNIQUE_VIDEOS = 3;

function TechniqueVideos({
  videos,
}: Readonly<{ videos: ProfileResponseDto['techniqueVideos'] }>): React.JSX.Element {
  const removal = useDeleteVideo();

  return (
    <View style={STACK_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('teamProfiles.editor.techniqueTitle', { count: videos.length })}
      </Text>
      {videos.map((video) => (
        <View key={video.id} style={STACK_STYLE}>
          <PlayableVideo video={video} shouldShowTitle />
          <Button
            size="sm"
            variant="ghost"
            label={i18n.t('videos.upload.removeAction')}
            accessibilityLabel={`${i18n.t('videos.upload.removeAction')}: ${video.title}`}
            isDisabled={removal.isRunning}
            onPress={() => {
              removal.run(video.id);
            }}
          />
        </View>
      ))}
      {removal.errorMessage === null ? null : <FormErrorBanner message={removal.errorMessage} />}
      {videos.length < MAX_TECHNIQUE_VIDEOS ? (
        <VideoUploadField purpose="technique" video={null} onVideoChange={() => undefined} />
      ) : null}
    </View>
  );
}

/** El vídeo de presentación y hasta tres de técnica; al terminar una subida el perfil se refresca solo. */
export function ProfileVideosSection({
  profile,
}: Readonly<{ profile: ProfileResponseDto }>): React.JSX.Element {
  return (
    <View style={STACK_STYLE}>
      <View style={STACK_STYLE}>
        <Text variant="titleMd" role="heading">
          {i18n.t('teamProfiles.editor.introTitle')}
        </Text>
        <VideoUploadField
          purpose="profile"
          video={profile.introVideo}
          onVideoChange={() => undefined}
        />
        <Text variant="caption" color="ink2">
          {i18n.t('teamProfiles.editor.introHint')}
        </Text>
      </View>
      <TechniqueVideos videos={profile.techniqueVideos} />
    </View>
  );
}
