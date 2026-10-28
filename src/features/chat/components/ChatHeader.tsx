import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { CHAT_HEADER_NAME_STYLE, createChatHeaderStyle } from './ChatHeader.styles';

interface ChatHeaderProps {
  name: string;
  photoUrl: string | null;
  /** En lugar de la foto: un icono (la cabecera de «mensaje a un grupo»). */
  iconName?: IconName | undefined;
  onBackPress: (() => void) | undefined;
  /** Abre las opciones de la conversación (bloquear); sin él no hay menú. */
  onMenuPress?: (() => void) | undefined;
}

/** La cabecera del hilo: volver, la foto, el nombre de con quién se habla y, si procede, el menú. */
export function ChatHeader({
  name,
  photoUrl,
  iconName,
  onBackPress,
  onMenuPress,
}: Readonly<ChatHeaderProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createChatHeaderStyle(theme)}>
      {onBackPress === undefined ? null : (
        <IconButton
          iconName="arrowLeft"
          accessibilityLabel={i18n.t('actions.back')}
          onPress={onBackPress}
        />
      )}
      {iconName === undefined ? (
        <Avatar name={name} photoUrl={photoUrl} size="sm" isDecorative />
      ) : (
        <Icon name={iconName} color="brandInk" />
      )}
      <View style={CHAT_HEADER_NAME_STYLE}>
        <Text variant="titleMd" role="heading" numberOfLines={1}>
          {name}
        </Text>
      </View>
      {onMenuPress === undefined ? null : (
        <IconButton
          iconName="more"
          accessibilityLabel={i18n.t('chat.block.menuLabel')}
          onPress={onMenuPress}
        />
      )}
    </View>
  );
}
