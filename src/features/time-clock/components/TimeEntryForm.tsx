import { View } from 'react-native';

import type { TimeEntryResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useDeleteTimeEntry } from '../hooks/useDeleteTimeEntry';
import { useSaveTimeEntry } from '../hooks/useSaveTimeEntry';
import { useTimeEntryDraft } from '../hooks/useTimeEntryDraft';
import { DeleteEntrySection } from './DeleteEntrySection';
import { createEditorStyle } from './TimeClock.styles';
import { TimeEntryFields } from './TimeEntryFields';

interface TimeEntryFormProps {
  /** El fichaje que se corrige; `null` para añadir un día olvidado. */
  entry: TimeEntryResponseDto | null;
  timeZone: string;
  todayIsoDate: string;
  onClose: () => void;
}

/** Día (solo al añadir), hora de entrada y de salida; guardar corrige o crea, eliminar lo quita. */
export function TimeEntryForm({
  entry,
  timeZone,
  todayIsoDate,
  onClose,
}: Readonly<TimeEntryFormProps>): React.JSX.Element {
  const theme = useTheme();
  const saving = useSaveTimeEntry();
  const deletion = useDeleteTimeEntry();
  const draft = useTimeEntryDraft({ entry, timeZone, todayIsoDate });
  const isBusy = saving.isSaving || deletion.isDeleting;
  const errorMessage = saving.errorMessage ?? deletion.errorMessage;

  return (
    <View style={createEditorStyle(theme)}>
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <TimeEntryFields draft={draft} isDateEditable={entry === null} todayIsoDate={todayIsoDate} />
      <Button
        label={i18n.t('timeClock.editor.saveAction')}
        isFullWidth
        isLoading={saving.isSaving}
        isDisabled={isBusy || draft.workDate === ''}
        onPress={() => {
          const { clockInAt, clockOutAt } = draft;
          saving.saveEntry({ entryId: entry?.id ?? null, clockInAt, clockOutAt }, onClose);
        }}
      />
      {entry === null ? null : (
        <DeleteEntrySection
          isDeleting={deletion.isDeleting}
          isDisabled={isBusy}
          onConfirmPress={() => {
            deletion.deleteEntry(entry.id, onClose);
          }}
        />
      )}
    </View>
  );
}
