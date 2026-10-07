import { View } from 'react-native';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { STACK_STYLE } from './TeamProfiles.styles';

interface ProfileEditorActionsProps {
  status: ProfileResponseDto['status'];
  hasChanges: boolean;
  canSubmit: boolean;
  isRunning: boolean;
  errorMessage: string | null;
  onSave: () => void;
  onSubmit: () => void;
}

/** Guardar los cambios y enviarlos a revisión (si ya estaba publicado se dice que vuelve a revisarse). */
export function ProfileEditorActions({
  status,
  hasChanges,
  canSubmit,
  isRunning,
  errorMessage,
  onSave,
  onSubmit,
}: Readonly<ProfileEditorActionsProps>): React.JSX.Element {
  const submitLabel =
    status === 'published'
      ? i18n.t('teamProfiles.editor.submitChangesAction')
      : i18n.t('teamProfiles.editor.submitAction');

  return (
    <View style={STACK_STYLE}>
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <Button
        variant="outline"
        label={i18n.t('teamProfiles.editor.saveAction')}
        isDisabled={!hasChanges || isRunning}
        onPress={onSave}
      />
      <Button
        label={submitLabel}
        isLoading={isRunning}
        isDisabled={!canSubmit}
        onPress={onSubmit}
      />
    </View>
  );
}
