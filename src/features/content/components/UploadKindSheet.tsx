import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

interface UploadKindSheetProps {
  isVisible: boolean;
  onVideoChoose: () => void;
  onPdfChoose: () => void;
  onDismiss: () => void;
  /** La hoja ya terminó de cerrarse (iOS): ahora se puede abrir el selector del sistema. */
  onClosed: () => void;
}

/** Qué se va a subir: el selector del sistema es distinto para un vídeo (galería) y un PDF (ficheros). */
export function UploadKindSheet({
  isVisible,
  onVideoChoose,
  onPdfChoose,
  onDismiss,
  onClosed,
}: Readonly<UploadKindSheetProps>): React.JSX.Element {
  return (
    <BottomSheet
      isVisible={isVisible}
      title={i18n.t('content.upload.chooseTitle')}
      onDismiss={onDismiss}
      onClosed={onClosed}
    >
      <Button label={i18n.t('content.upload.videoAction')} isFullWidth onPress={onVideoChoose} />
      <Button
        variant="secondary"
        label={i18n.t('content.upload.pdfAction')}
        isFullWidth
        onPress={onPdfChoose}
      />
      <Button
        variant="ghost"
        label={i18n.t('content.upload.cancelAction')}
        isFullWidth
        onPress={onDismiss}
      />
    </BottomSheet>
  );
}
