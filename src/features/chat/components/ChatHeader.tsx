import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { createChatHeaderStyle } from './ChatHeader.styles';

interface ChatHeaderProps {
  name: string;
  photoUrl: string | null;
  onBackPress: (() => void) | undefined;
}

/** La cabecera del hilo: volver, la foto y el nombre de con quién se habla. */
export function ChatHeader({
  name,
  photoUrl,
  onBackPress,
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
      <Avatar name={name} photoUrl={photoUrl} size="sm" isDecorative />
      <Text variant="titleMd" role="heading" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}
