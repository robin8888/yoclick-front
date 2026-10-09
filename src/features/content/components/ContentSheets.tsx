import type { ContentResponseDto } from '@/shared/api/generated/model';

import { AssignContentSheet } from './AssignContentSheet';
import { ContentDetailsSheet } from './ContentDetailsSheet';
import { UploadKindSheet } from './UploadKindSheet';

interface ContentSheetsProps {
  isUploadKindVisible: boolean;
  contentToAssign: ContentResponseDto | null;
  contentToEdit: ContentResponseDto | null;
  onUploadChoose: (kind: 'video' | 'pdf') => void;
  onUploadKindDismiss: () => void;
  onUploadKindClosed: () => void;
  onAssignDismiss: () => void;
  onDetailsDismiss: () => void;
}

/** Las tres hojas de la biblioteca: qué subir, a quién asignar y los detalles de una pieza. */
export function ContentSheets({
  isUploadKindVisible,
  contentToAssign,
  contentToEdit,
  onUploadChoose,
  onUploadKindDismiss,
  onUploadKindClosed,
  onAssignDismiss,
  onDetailsDismiss,
}: Readonly<ContentSheetsProps>): React.JSX.Element {
  return (
    <>
      <UploadKindSheet
        isVisible={isUploadKindVisible}
        onVideoChoose={() => {
          onUploadChoose('video');
        }}
        onPdfChoose={() => {
          onUploadChoose('pdf');
        }}
        onDismiss={onUploadKindDismiss}
        onClosed={onUploadKindClosed}
      />
      <AssignContentSheet content={contentToAssign} onDismiss={onAssignDismiss} />
      <ContentDetailsSheet content={contentToEdit} onDismiss={onDetailsDismiss} />
    </>
  );
}
