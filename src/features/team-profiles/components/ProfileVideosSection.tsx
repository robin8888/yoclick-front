import { View } from 'react-native';

import {
  PlayableVideo,
  useDeleteVideo,
  useVideoUpload,
  VideoDropTile,
  VideoUploadField,
  VideoUploadProgress,
} from '@/features/videos';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { ProfileSection } from './ProfileSection';
import { GRID_CELL_STYLE, GRID_STYLE, WIDE_STACK_STYLE } from './TeamProfiles.styles';

const MAX_TECHNIQUE_VIDEOS = 3;

function TechniqueVideoCell({
  video,
  isRemoving,
  onRemove,
}: Readonly<{
  video: ProfileResponseDto['techniqueVideos'][number];
  isRemoving: boolean;
  onRemove: (videoId: string) => void;
}>): React.JSX.Element {
  return (
    <View style={GRID_CELL_STYLE}>
      <PlayableVideo video={video} isCompact />
      <Button
        size="sm"
        variant="ghostDanger"
        label={i18n.t('videos.upload.removeAction')}
        accessibilityLabel={`${i18n.t('videos.upload.removeAction')}: ${video.title}`}
        isDisabled={isRemoving}
        onPress={() => {
          onRemove(video.id);
        }}
      />
    </View>
  );
}

function TechniqueGrid({
  videos,
  upload,
  removal,
}: Readonly<{
  videos: ProfileResponseDto['techniqueVideos'];
  upload: ReturnType<typeof useVideoUpload>;
  removal: ReturnType<typeof useDeleteVideo>;
}>): React.JSX.Element {
  return (
    <View style={GRID_STYLE}>
      {videos.map((video) => (
        <TechniqueVideoCell
          key={video.id}
          video={video}
          isRemoving={removal.isRunning}
          onRemove={(videoId) => {
            removal.run(videoId);
          }}
        />
      ))}
      {videos.length < MAX_TECHNIQUE_VIDEOS ? (
        <View style={GRID_CELL_STYLE}>
          <VideoDropTile
            isCompact
            title={i18n.t('videos.upload.addAction')}
            isDisabled={upload.isBusy}
            onPress={() => {
              upload.start(() => undefined);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

/** Los vídeos de técnica de dos en dos y, si caben más, el recuadro de rayas «Añadir vídeo». */
function TechniqueVideos({
  videos,
}: Readonly<{ videos: ProfileResponseDto['techniqueVideos'] }>): React.JSX.Element {
  const removal = useDeleteVideo();
  const upload = useVideoUpload('technique');
  const failureMessage = upload.stage.kind === 'failed' ? upload.stage.message : null;
  const errorMessage = failureMessage ?? removal.errorMessage;

  return (
    <ProfileSection
      title={i18n.t('teamProfiles.editor.techniqueTitle', { count: videos.length })}
      description={i18n.t('teamProfiles.editor.techniqueHint')}
    >
      <TechniqueGrid videos={videos} upload={upload} removal={removal} />
      <VideoUploadProgress stage={upload.stage} />
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
    </ProfileSection>
  );
}

/** El vídeo de presentación y hasta tres de técnica; al terminar una subida el perfil se refresca solo. */
export function ProfileVideosSection({
  profile,
}: Readonly<{ profile: ProfileResponseDto }>): React.JSX.Element {
  return (
    <View style={WIDE_STACK_STYLE}>
      <ProfileSection
        title={i18n.t('teamProfiles.editor.introTitle')}
        description={i18n.t('teamProfiles.editor.introHint')}
      >
        <VideoUploadField
          purpose="profile"
          video={profile.introVideo}
          onVideoChange={() => undefined}
          emptyTileTitle={i18n.t('teamProfiles.editor.introDropTitle')}
        />
      </ProfileSection>
      <TechniqueVideos videos={profile.techniqueVideos} />
    </View>
  );
}
