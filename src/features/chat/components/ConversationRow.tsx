import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { CountBadge } from '@/ui/atoms/CountBadge';
import { Text } from '@/ui/atoms/Text';

import { createRowStyle, createRowTextStyle } from './ConversationRow.styles';

interface ConversationRowProps {
  name: string;
  photoUrl: string | null;
  preview: string;
  unreadCount: number;
  /** «3 mensajes sin leer» o vacío: va en la etiqueta accesible, porque el número es un dibujo. */
  unreadLabel: string;
  onPress: () => void;
}

/** Una fila de la bandeja: quién es, lo último que se dijo y cuántos hay sin leer. */
export function ConversationRow({
  name,
  photoUrl,
  preview,
  unreadCount,
  unreadLabel,
  onPress,
}: Readonly<ConversationRowProps>): React.JSX.Element {
  const theme = useTheme();
  const label = [name, preview, unreadLabel].filter((part) => part !== '').join('. ');

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={createRowStyle(theme)}
    >
      <Avatar name={name} photoUrl={photoUrl} isDecorative />
      <View style={createRowTextStyle(theme)}>
        <Text variant={unreadCount > 0 ? 'bodyStrong' : 'body'} numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" color="ink2" numberOfLines={1}>
          {preview}
        </Text>
      </View>
      <CountBadge count={unreadCount} />
    </Pressable>
  );
}
