import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

import { useDeleteContent } from '../hooks/useContentMutations';

interface DeleteContentSheetProps {
  /** La pieza que se va a borrar; `null` con la hoja cerrada. */
  content: ContentResponseDto | null;
  onDeleted: () => void;
  onDismiss: () => void;
}

/** «¿Borrar este contenido?»: se pregunta antes porque libera el espacio y no se puede deshacer. */
export function DeleteContentSheet({
  content,
  onDeleted,
  onDismiss,
}: Readonly<DeleteContentSheetProps>): React.JSX.Element {
  const deletion = useDeleteContent();

  return (
    <ConfirmSheet
      isVisible={content !== null}
      title={i18n.t('content.details.deleteConfirmTitle')}
      message={i18n.t('content.details.deleteConfirmMessage')}
      confirmLabel={i18n.t('content.details.deleteConfirmAction')}
      dismissLabel={i18n.t('content.details.keepAction')}
      isConfirming={deletion.isRunning}
      isDestructive
      onConfirm={() => {
        if (content !== null) deletion.run(content.id, onDeleted);
      }}
      onDismiss={onDismiss}
    />
  );
}
