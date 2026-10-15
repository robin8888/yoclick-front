import { Image } from 'expo-image';
import { Linking, Pressable, View } from 'react-native';

import type { MessageResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createBubbleStyle,
  createBubbleRowStyle,
  createImageStyle,
  createDocumentStyle,
} from './MessageBubble.styles';

interface MessageBubbleProps {
  message: MessageResponseDto;
  /** Hora ya formateada («18:05»). */
  timeLabel: string;
}

function openAttachment(url: string): void {
  // Si el móvil no puede abrir el enlace no hay nada útil que hacer: el archivo sigue en el hilo.
  Linking.openURL(url).catch(() => undefined);
}

function AttachmentContent({
  attachment,
}: Readonly<{ attachment: NonNullable<MessageResponseDto['attachment']> }>): React.JSX.Element {
  const theme = useTheme();
  if (attachment.kind === 'image') {
    return (
      <Pressable
        role="button"
        accessibilityLabel={i18n.t('chat.openPhoto')}
        onPress={() => {
          openAttachment(attachment.url);
        }}
      >
        <Image
          source={{ uri: attachment.url }}
          style={createImageStyle(theme)}
          contentFit="cover"
          accessible={false}
        />
      </Pressable>
    );
  }
  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('chat.openDocument', { name: attachment.name })}
      onPress={() => {
        openAttachment(attachment.url);
      }}
      style={createDocumentStyle(theme)}
    >
      <Icon name="file" color="ink" />
      <Text variant="body" numberOfLines={2}>
        {attachment.name}
      </Text>
    </Pressable>
  );
}

/** Un mensaje del hilo: a la derecha y con el color de marca si es mío, a la izquierda si no. */
export function MessageBubble({
  message,
  timeLabel,
}: Readonly<MessageBubbleProps>): React.JSX.Element {
  const theme = useTheme();
  const textColor = message.isMine ? 'onBrand' : 'ink';

  return (
    <View style={createBubbleRowStyle(message.isMine)}>
      <View style={createBubbleStyle(theme, message.isMine)}>
        {message.isMine ? null : (
          <Text variant="caption" color="ink2">
            {message.senderName}
          </Text>
        )}
        {message.attachment ? <AttachmentContent attachment={message.attachment} /> : null}
        {message.body === null ? null : (
          <Text variant="body" color={textColor}>
            {message.body}
          </Text>
        )}
        <Text variant="caption" color={message.isMine ? 'onBrand' : 'ink2'}>
          {timeLabel}
        </Text>
      </View>
    </View>
  );
}
