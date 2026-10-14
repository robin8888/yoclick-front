import type { TimeEntryResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import { TimeEntryForm } from './TimeEntryForm';

/** Cerrado, añadiendo un día olvidado (`entry: null`) o corrigiendo un fichaje. */
export type TimeEntryEditorState =
  { isOpen: false } | { isOpen: true; entry: TimeEntryResponseDto | null };

interface TimeEntryEditorSheetProps {
  editor: TimeEntryEditorState;
  timeZone: string;
  todayIsoDate: string;
  onClose: () => void;
}

/** La hoja para añadir o corregir un fichaje; el formulario nace de cero cada vez que se abre. */
export function TimeEntryEditorSheet({
  editor,
  timeZone,
  todayIsoDate,
  onClose,
}: Readonly<TimeEntryEditorSheetProps>): React.JSX.Element {
  const isEditing = editor.isOpen && editor.entry !== null;

  return (
    <BottomSheet
      isVisible={editor.isOpen}
      title={i18n.t(isEditing ? 'timeClock.editor.editTitle' : 'timeClock.editor.addTitle')}
      onDismiss={onClose}
    >
      {editor.isOpen ? (
        <TimeEntryForm
          key={editor.entry?.id ?? 'new-entry'}
          entry={editor.entry}
          timeZone={timeZone}
          todayIsoDate={todayIsoDate}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}
