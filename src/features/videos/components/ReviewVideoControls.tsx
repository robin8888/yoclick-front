import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useReviewVideo } from '../hooks/useVideoMutations';
import { STACK_STYLE, WRAP_ROW_STYLE } from './Videos.styles';

const MAX_REVIEW_NOTE_LENGTH = 300;

interface ChangesFormProps {
  isSending: boolean;
  onSend: (note: string) => void;
  onCancel: () => void;
}

/** La nota con lo que debe cambiar: la persona la lee en su perfil y le llega un aviso. */
function ChangesRequestForm({
  isSending,
  onSend,
  onCancel,
}: Readonly<ChangesFormProps>): React.JSX.Element {
  const [note, setNote] = useState('');

  return (
    <View style={STACK_STYLE}>
      <Text variant="bodyStrong">{i18n.t('videos.teamAdmin.changesNoteLabel')}</Text>
      <Input
        value={note}
        onChangeText={setNote}
        accessibilityLabel={i18n.t('videos.teamAdmin.changesNoteLabel')}
        placeholder={i18n.t('videos.teamAdmin.changesNotePlaceholder')}
        maxLength={MAX_REVIEW_NOTE_LENGTH}
      />
      <View style={WRAP_ROW_STYLE}>
        <Button
          size="sm"
          label={i18n.t('videos.teamAdmin.changesSendAction')}
          isLoading={isSending}
          isDisabled={note.trim() === ''}
          onPress={() => {
            onSend(note.trim());
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          label={i18n.t('videos.teamAdmin.changesCancelAction')}
          onPress={onCancel}
        />
      </View>
    </View>
  );
}

interface ChoicesProps {
  isBusy: boolean;
  onApprove: () => void;
  onAskChanges: () => void;
}

function ReviewChoices({
  isBusy,
  onApprove,
  onAskChanges,
}: Readonly<ChoicesProps>): React.JSX.Element {
  return (
    <View style={WRAP_ROW_STYLE}>
      <Button
        size="sm"
        leadingIconName="check"
        label={i18n.t('videos.teamAdmin.approveAction')}
        isLoading={isBusy}
        onPress={onApprove}
      />
      <Button
        size="sm"
        variant="outline"
        label={i18n.t('videos.teamAdmin.requestChangesAction')}
        isDisabled={isBusy}
        onPress={onAskChanges}
      />
    </View>
  );
}

/** Aprobar y publicar, o pedir cambios con una nota. */
export function ReviewVideoControls({ videoId }: Readonly<{ videoId: string }>): React.JSX.Element {
  const review = useReviewVideo();
  const [isAskingChanges, setIsAskingChanges] = useState(false);

  return (
    <View style={STACK_STYLE}>
      {review.errorMessage === null ? null : <FormErrorBanner message={review.errorMessage} />}
      {isAskingChanges ? (
        <ChangesRequestForm
          isSending={review.isRunning}
          onSend={(note) => {
            review.run({ videoId, isApproved: false, note });
          }}
          onCancel={() => {
            setIsAskingChanges(false);
          }}
        />
      ) : (
        <ReviewChoices
          isBusy={review.isRunning}
          onApprove={() => {
            review.run({ videoId, isApproved: true });
          }}
          onAskChanges={() => {
            setIsAskingChanges(true);
          }}
        />
      )}
    </View>
  );
}
