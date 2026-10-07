import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Spinner } from '@/ui/atoms/Spinner';
import { Text } from '@/ui/atoms/Text';

import type { VideoUploadStage } from '../model/video-upload';
import {
  createProgressFillStyle,
  createProgressTrackStyle,
  ROW_STYLE,
  STACK_STYLE,
} from './Videos.styles';

/** Lo que pasa mientras el vídeo sube (con barra y porcentaje) y mientras el servicio lo procesa. */
export function VideoUploadProgress({
  stage,
}: Readonly<{ stage: VideoUploadStage }>): React.JSX.Element | null {
  const theme = useTheme();

  if (stage.kind === 'uploading') {
    return (
      <View style={STACK_STYLE}>
        <Text>{i18n.t('videos.upload.uploading', { percent: stage.uploadedPercent })}</Text>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={i18n.t('videos.upload.uploadingLabel')}
          accessibilityValue={{ min: 0, max: 100, now: stage.uploadedPercent }}
          style={createProgressTrackStyle(theme)}
        >
          <View style={createProgressFillStyle(theme, stage.uploadedPercent)} />
        </View>
      </View>
    );
  }
  if (stage.kind === 'processing') {
    return (
      <View style={ROW_STYLE}>
        <Spinner accessibilityLabel={i18n.t('videos.upload.processing')} />
        <Text color="ink2">{i18n.t('videos.upload.processing')}</Text>
      </View>
    );
  }
  return null;
}
