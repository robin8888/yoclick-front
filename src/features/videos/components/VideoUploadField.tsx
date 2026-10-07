import { View } from 'react-native';

import type { StartVideoUploadRequestDto, VideoResponseDto } from '@/shared/api/generated/model';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useDeleteVideo } from '../hooks/useVideoMutations';
import { useVideoUpload } from '../hooks/useVideoUpload';
import { PlayableVideo } from './PlayableVideo';
import { VideoFieldActions } from './VideoFieldActions';
import { VideoUploadProgress } from './VideoUploadProgress';
import { STACK_STYLE } from './Videos.styles';

interface VideoUploadFieldProps {
  purpose: StartVideoUploadRequestDto['purpose'];
  /** El vídeo que ya tiene, si lo tiene. */
  video: VideoResponseDto | null;
  onVideoChange: (video: VideoResponseDto | null) => void;
  accessibilityName?: string;
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
      <VideoFieldActions
        hasVideo={video !== null}
        isDisabled={upload.isBusy || removal.isRunning}
        accessibilityName={accessibilityName}
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
