import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { IconButton } from '@/ui/atoms/IconButton';
import { Input } from '@/ui/atoms/Input';

import type { AttachmentSource } from '../hooks/useSendAttachment';
import { COMPOSER_INPUT_STYLE, createComposerStyle } from './MessageComposer.styles';

const MAX_MESSAGE_LENGTH = 2000;

interface MessageComposerProps {
  isBusy: boolean;
  onSend: (body: string, onSent: () => void) => void;
  onAttach: (source: AttachmentSource) => void;
}

function AttachButtons({
  isBusy,
  onAttach,
}: Readonly<Pick<MessageComposerProps, 'isBusy' | 'onAttach'>>): React.JSX.Element {
  return (
    <>
      <IconButton
        iconName="image"
        accessibilityLabel={i18n.t('chat.attachPhoto')}
        isDisabled={isBusy}
        onPress={() => {
          onAttach('photo');
        }}
      />
      <IconButton
        iconName="file"
        accessibilityLabel={i18n.t('chat.attachDocument')}
        isDisabled={isBusy}
        onPress={() => {
          onAttach('pdf');
        }}
      />
    </>
  );
}

/** La barra de abajo del hilo: un campo de texto, dos adjuntos (foto, PDF) y enviar. */
export function MessageComposer({
  isBusy,
  onSend,
  onAttach,
}: Readonly<MessageComposerProps>): React.JSX.Element {
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const trimmedDraft = draft.trim();

  return (
    <View style={createComposerStyle(theme)}>
      <AttachButtons isBusy={isBusy} onAttach={onAttach} />
      <View style={COMPOSER_INPUT_STYLE}>
        <Input
          value={draft}
          onChangeText={setDraft}
          accessibilityLabel={i18n.t('chat.messageLabel')}
          placeholder={i18n.t('chat.messagePlaceholder')}
          isMultiline
          maxLength={MAX_MESSAGE_LENGTH}
        />
      </View>
      <IconButton
        iconName="send"
        variant="brand"
        accessibilityLabel={i18n.t('chat.send')}
        isDisabled={isBusy || trimmedDraft === ''}
        onPress={() => {
          onSend(trimmedDraft, () => {
            setDraft('');
          });
        }}
      />
    </View>
  );
}
