import { View } from 'react-native';

import type { StartVideoUploadRequestDto, VideoResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useDeleteVideo } from '../hooks/useVideoMutations';
import { useVideoUpload } from '../hooks/useVideoUpload';
import { PlayableVideo } from './PlayableVideo';
import { VideoDropTile } from './VideoDropTile';
import { VideoFieldActions } from './VideoFieldActions';
import { VideoUploadProgress } from './VideoUploadProgress';
import { STACK_STYLE } from './Videos.styles';

interface VideoUploadFieldProps {
  purpose: StartVideoUploadRequestDto['purpose'];
  /** El vídeo que ya tiene, si lo tiene. */
  video: VideoResponseDto | null;
  onVideoChange: (video: VideoResponseDto | null) => void;
  accessibilityName?: string;
  /** Con vídeo vacío se muestra el recuadro de rayas con este texto en lugar del botón. */
  emptyTileTitle?: string;
}

interface VideoFieldControlsProps {
  video: VideoResponseDto | null;
  emptyTileTitle: string | undefined;
  accessibilityName: string | undefined;
  isDisabled: boolean;
  onAddOrChange: () => void;
  onRemove: () => void;
}

/** El recuadro de rayas (si se pide y no hay vídeo) o los botones de añadir, cambiar y quitar. */
function VideoFieldControls({
  video,
  emptyTileTitle,
  accessibilityName,
  isDisabled,
  onAddOrChange,
  onRemove,
}: Readonly<VideoFieldControlsProps>): React.JSX.Element {
  if (video === null && emptyTileTitle !== undefined) {
    return (
      <VideoDropTile
        title={emptyTileTitle}
        accessibilityLabel={i18n.t('videos.upload.addAction')}
        isDisabled={isDisabled}
        onPress={onAddOrChange}
      />
    );
  }
  return (
    <VideoFieldActions
      hasVideo={video !== null}
      isDisabled={isDisabled}
      accessibilityName={accessibilityName}
      onAddOrChange={onAddOrChange}
      onRemove={onRemove}
    />
  );
}

/**
 * Añadir, cambiar o quitar un vídeo. Sube directamente al servicio de vídeo y muestra el avance;
 * el servidor decide si el plan lo permite, aquí solo se oculta el botón cuando no.
 */
export function VideoUploadField({
  purpose,
  video,
  onVideoChange,
  accessibilityName,
  emptyTileTitle,
}: Readonly<VideoUploadFieldProps>): React.JSX.Element {
  const upload = useVideoUpload(purpose);
  const removal = useDeleteVideo();
  const failureMessage = upload.stage.kind === 'failed' ? upload.stage.message : null;
  const errorMessage = failureMessage ?? removal.errorMessage;

  return (
    <View style={STACK_STYLE}>
      {video === null ? null : <PlayableVideo video={video} />}
      <VideoUploadProgress stage={upload.stage} />
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <VideoFieldControls
        video={video}
        emptyTileTitle={emptyTileTitle}
        accessibilityName={accessibilityName}
        isDisabled={upload.isBusy || removal.isRunning}
        onAddOrChange={() => {
          upload.start(onVideoChange);
        }}
        onRemove={() => {
          if (video === null) return;
          removal.run(video.id, () => {
            onVideoChange(null);
          });
        }}
      />
    </View>
  );
}
