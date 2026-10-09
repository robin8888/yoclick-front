import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import { useVisibility } from '../hooks/useVisibility';
import { ContentDetailsForm } from './ContentDetailsForm';
import { DeleteContentSheet } from './DeleteContentSheet';

interface ContentDetailsSheetProps {
  /** La pieza que se está viendo; `null` con la hoja cerrada. */
  content: ContentResponseDto | null;
  onDismiss: () => void;
}

/** Detalles de una pieza: se cambian su título, nivel y necesidad, o se borra (libera su espacio). */
export function ContentDetailsSheet({
  content,
  onDismiss,
}: Readonly<ContentDetailsSheetProps>): React.JSX.Element {
  const confirmation = useVisibility();

  return (
    <>
      <BottomSheet
        isVisible={content !== null && !confirmation.isVisible}
        title={i18n.t('content.details.title')}
        onDismiss={onDismiss}
      >
        {content === null ? null : (
          <ContentDetailsForm
            key={content.id}
            content={content}
            onSaved={onDismiss}
            onDeleteRequest={confirmation.show}
          />
        )}
      </BottomSheet>
      <DeleteContentSheet
        content={confirmation.isVisible ? content : null}
        onDeleted={() => {
          confirmation.hide();
          onDismiss();
        }}
        onDismiss={confirmation.hide}
      />
    </>
  );
}
