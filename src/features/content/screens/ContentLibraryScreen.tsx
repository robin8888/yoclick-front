import { i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ContentLibraryList } from '../components/ContentLibraryList';
import { ContentSheets } from '../components/ContentSheets';
import { ContentUploadStatus } from '../components/ContentUploadStatus';
import { UploadDropZone } from '../components/UploadDropZone';
import { useContentVocabulary } from '../hooks/useContentVocabulary';
import { useDeferredUpload } from '../hooks/useDeferredUpload';
import { useSelectedContent } from '../hooks/useSelectedContent';
import { useUploadContent, type ContentUpload } from '../hooks/useUploadContent';
import { useVisibility } from '../hooks/useVisibility';

/** El recuadro de «Subir vídeo o PDF» y lo que pasa mientras se sube. */
function UploadArea({
  upload,
  onPress,
}: Readonly<{ upload: ContentUpload; onPress: () => void }>): React.JSX.Element {
  return (
    <>
      <UploadDropZone isDisabled={upload.isBusy} onPress={onPress} />
      <ContentUploadStatus upload={upload} />
    </>
  );
}

interface ContentLibraryScreenProps {
  /** `false` para el equipo: ve la biblioteca y asigna, pero no sube, edita ni borra. */
  canManageLibrary?: boolean;
  /** La flecha de volver, cuando la pantalla se abre desde otra (el perfil del equipo). */
  onBackPress?: () => void;
}

/** Prototipo `acontent`: subir vídeos y PDF, y asignarlos por nivel, por grupo o por persona. */
export function ContentLibraryScreen({
  canManageLibrary = true,
  onBackPress,
}: Readonly<ContentLibraryScreenProps>): React.JSX.Element {
  const { clientWordPlural } = useContentVocabulary();
  const uploadKind = useVisibility();
  const assigning = useSelectedContent();
  const editing = useSelectedContent();
  const upload = useUploadContent({ onContentAdded: editing.select });

  const deferredUpload = useDeferredUpload({ hideSheet: uploadKind.hide, upload });

  return (
    <ScreenTemplate
      title={i18n.t('content.admin.title')}
      subtitle={i18n.t('content.admin.subtitle', { clients: clientWordPlural })}
      onBackPress={onBackPress}
      backLabel={onBackPress === undefined ? undefined : i18n.t('actions.back')}
    >
      {canManageLibrary ? <UploadArea upload={upload} onPress={uploadKind.show} /> : null}
      <ContentLibraryList
        canManageLibrary={canManageLibrary}
        onUploadRequest={uploadKind.show}
        onAssignPress={assigning.select}
        onDetailsPress={editing.select}
      />
      <ContentSheets
        isUploadKindVisible={uploadKind.isVisible}
        contentToAssign={assigning.content}
        contentToEdit={editing.content}
        onUploadChoose={deferredUpload.choose}
        onUploadKindDismiss={uploadKind.hide}
        onUploadKindClosed={deferredUpload.handleSheetClosed}
        onAssignDismiss={assigning.clear}
        onDetailsDismiss={editing.clear}
      />
    </ScreenTemplate>
  );
}
