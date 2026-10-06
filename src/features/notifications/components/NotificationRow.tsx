import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createNotificationRowStyle,
  createUnreadDotStyle,
  NOTIFICATION_TEXT_STYLE,
} from './NotificationRow.styles';

interface NotificationRowProps {
  title: string;
  description: string;
  /** «hace 5 min». */
  ageLabel: string;
  isRead: boolean;
  isCancellation: boolean;
  onPress: () => void;
}

/** Un aviso: icono, título, qué ha pasado y cuándo; sin leer lleva un punto y el título en negrita. */
export function NotificationRow({
  title,
  description,
  ageLabel,
  isRead,
  isCancellation,
  onPress,
}: Readonly<NotificationRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${isRead ? '' : 'Sin leer. '}${title}. ${description}. ${ageLabel}`}
      onPress={onPress}
      style={createNotificationRowStyle(theme, isRead)}
    >
      <Icon
        name={isCancellation ? 'xCircle' : 'calendar'}
        color={isCancellation ? 'danger' : 'brandInk'}
      />
      <View style={NOTIFICATION_TEXT_STYLE}>
        <Text variant={isRead ? 'body' : 'bodyStrong'}>{title}</Text>
        <Text variant="caption" color="ink2">
          {description}
        </Text>
        <Text variant="caption" color="ink2">
          {ageLabel}
        </Text>
      </View>
      {isRead ? null : <View style={createUnreadDotStyle(theme)} />}
    </Pressable>
  );
}
