import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { IconButton } from '@/ui/atoms/IconButton';
import { useTextStyle } from '@/ui/atoms/Text';

import type { AttachmentSource } from '../hooks/useSendAttachment';
import {
  createComposerBarStyle,
  createComposerFieldStyle,
  createComposerPillStyle,
} from './MessageComposer.styles';

const MAX_MESSAGE_LENGTH = 2000;

interface MessageComposerProps {
  isBusy: boolean;
  onSend: (body: string, onSent: () => void) => void;
  /** Sin él no salen los botones de foto y PDF (el mensaje a un grupo es solo texto). */
  onAttach?: ((source: AttachmentSource) => void) | undefined;
  /** Con el centro sin nadie elegido todavía, no se puede enviar. */
  isSendDisabled?: boolean;
}

function AttachButtons({
  isBusy,
  onAttach,
}: Readonly<{
  isBusy: boolean;
  onAttach: ((source: AttachmentSource) => void) | undefined;
}>): React.JSX.Element | null {
  if (onAttach === undefined) return null;
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

/**
 * La barra de abajo del hilo, como en WhatsApp: una píldora con el campo y los adjuntos (foto y
 * PDF) y, al lado, el botón redondo de enviar. Vive fuera de `ScreenTemplate`: su pie se vuelve a
 * montar al salir el teclado y el campo perdería el foco.
 */
export function MessageComposer({
  isBusy,
  onSend,
  onAttach,
  isSendDisabled = false,
}: Readonly<MessageComposerProps>): React.JSX.Element {
  const theme = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const textStyle = useTextStyle({ variant: 'body', color: 'ink' });
  const [draft, setDraft] = useState('');
  const trimmedDraft = draft.trim();

  return (
    <View style={createComposerBarStyle(theme, bottomInset)}>
      <View style={createComposerPillStyle(theme)}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          accessibilityLabel={i18n.t('chat.messageLabel')}
          placeholder={i18n.t('chat.messagePlaceholder')}
          placeholderTextColor={theme.colors.ink2}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          style={createComposerFieldStyle(textStyle)}
        />
        <AttachButtons isBusy={isBusy} onAttach={onAttach} />
      </View>
      <IconButton
        iconName="send"
        variant="brand"
        accessibilityLabel={i18n.t('chat.send')}
        isDisabled={isBusy || isSendDisabled || trimmedDraft === ''}
        onPress={() => {
          onSend(trimmedDraft, () => {
            setDraft('');
          });
        }}
      />
    </View>
  );
}
