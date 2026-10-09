import { View } from 'react-native';

import { VideoUploadProgress } from '@/features/videos';
import { i18n } from '@/shared/i18n';
import { Spinner } from '@/ui/atoms/Spinner';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import type { ContentUpload } from '../hooks/useUploadContent';
import { ROW_STYLE, STACK_STYLE } from './Content.styles';

/** El primer motivo de fallo que haya: el del vídeo, el del PDF o el de ponerlo en la biblioteca. */
function pickFailureMessage(upload: ContentUpload): string | null {
  if (upload.video.stage.kind === 'failed') return upload.video.stage.message;
  if (upload.pdf.stage.kind === 'failed') return upload.pdf.stage.message;
  return upload.libraryErrorMessage;
}

/** Lo que pasa mientras se sube: el avance del vídeo o del PDF, y el motivo si algo falla. */
export function ContentUploadStatus({
  upload,
}: Readonly<{ upload: ContentUpload }>): React.JSX.Element | null {
  const failureMessage = pickFailureMessage(upload);

  if (!upload.isBusy && failureMessage === null) return null;
  return (
    <View style={STACK_STYLE}>
      <VideoUploadProgress stage={upload.video.stage} />
      {upload.pdf.stage.kind === 'uploading' ? (
        <View
          style={ROW_STYLE}
          accessible
          accessibilityLabel={i18n.t('content.upload.pdfUploadingLabel')}
        >
          <Spinner />
          <Text>{i18n.t('content.upload.pdfUploading')}</Text>
        </View>
      ) : null}
      {failureMessage === null ? null : <FormErrorBanner message={failureMessage} />}
    </View>
  );
}
