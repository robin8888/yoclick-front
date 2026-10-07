import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useReviewProfile } from '../hooks/useTeamProfileMutations';
import { STACK_STYLE, WRAP_ROW_STYLE } from './TeamProfiles.styles';

const MAX_NOTE_LENGTH = 300;

function ChangesForm({
  isSending,
  onSend,
  onCancel,
}: Readonly<{
  isSending: boolean;
  onSend: (note: string) => void;
  onCancel: () => void;
}>): React.JSX.Element {
  const [note, setNote] = useState('');

  return (
    <View style={STACK_STYLE}>
      <Text variant="bodyStrong">{i18n.t('teamProfiles.admin.changesNoteLabel')}</Text>
      <Input
        value={note}
        onChangeText={setNote}
        accessibilityLabel={i18n.t('teamProfiles.admin.changesNoteLabel')}
        placeholder={i18n.t('teamProfiles.admin.changesNotePlaceholder')}
        maxLength={MAX_NOTE_LENGTH}
      />
      <View style={WRAP_ROW_STYLE}>
        <Button
          size="sm"
          label={i18n.t('teamProfiles.admin.changesSendAction')}
          isLoading={isSending}
          isDisabled={note.trim() === ''}
          onPress={() => {
            onSend(note.trim());
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          label={i18n.t('teamProfiles.admin.changesCancelAction')}
          onPress={onCancel}
        />
      </View>
    </View>
  );
}

function DecisionButtons({
  isBusy,
  onApprove,
  onAskChanges,
}: Readonly<{
  isBusy: boolean;
  onApprove: () => void;
  onAskChanges: () => void;
}>): React.JSX.Element {
  return (
    <View style={WRAP_ROW_STYLE}>
      <Button
        size="sm"
        leadingIconName="check"
        label={i18n.t('teamProfiles.admin.approveAction')}
        isLoading={isBusy}
        onPress={onApprove}
      />
      <Button
        size="sm"
        variant="outline"
        label={i18n.t('teamProfiles.admin.requestChangesAction')}
        isDisabled={isBusy}
        onPress={onAskChanges}
      />
    </View>
  );
}

/** Aprobar y publicar el perfil, o pedir cambios con una nota que la persona lee en su perfil. */
export function ProfileDecisionControls({
  membershipId,
}: Readonly<{ membershipId: string }>): React.JSX.Element {
  const review = useReviewProfile();
  const [isAskingChanges, setIsAskingChanges] = useState(false);

  return (
    <View style={STACK_STYLE}>
      {review.errorMessage === null ? null : <FormErrorBanner message={review.errorMessage} />}
      {isAskingChanges ? (
        <ChangesForm
          isSending={review.isRunning}
          onSend={(note) => {
            review.run({ membershipId, isApproved: false, note });
          }}
          onCancel={() => {
            setIsAskingChanges(false);
          }}
        />
      ) : (
        <DecisionButtons
          isBusy={review.isRunning}
          onApprove={() => {
            review.run({ membershipId, isApproved: true });
          }}
          onAskChanges={() => {
            setIsAskingChanges(true);
          }}
        />
      )}
    </View>
  );
}
