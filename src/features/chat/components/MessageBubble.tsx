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
  /** Denunciar este mensaje (Apple 1.2); solo se ofrece en los de la otra parte. */
  onReportPress?: (() => void) | undefined;
}

/** El texto es pequeño: el área pulsable se amplía para llegar al mínimo táctil. */
const REPORT_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

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
  onReportPress,
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
        {message.isMine || onReportPress === undefined ? null : (
          <Pressable
            role="button"
            accessibilityLabel={i18n.t('chat.report.actionA11y', { name: message.senderName })}
            hitSlop={REPORT_HIT_SLOP}
            onPress={onReportPress}
          >
            <Text variant="caption" color="ink2">
              {i18n.t('chat.report.action')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
