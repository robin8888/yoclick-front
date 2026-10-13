import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import {
  createNotificationRowStyle,
  createUnreadDotStyle,
  NOTIFICATION_CONTENT_STYLE,
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
  onDeletePress: () => void;
}

/** Lo que se toca para marcar como leído: icono, textos y punto de sin leer. */
function NotificationContent({
  title,
  description,
  ageLabel,
  isRead,
  isCancellation,
  onPress,
}: Readonly<Omit<NotificationRowProps, 'onDeletePress'>>): React.JSX.Element {
  const theme = useTheme();
  const unreadPrefix = isRead ? '' : 'Sin leer. ';

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${unreadPrefix}${title}. ${description}. ${ageLabel}`}
      onPress={onPress}
      style={NOTIFICATION_CONTENT_STYLE}
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

/**
 * Un aviso: icono, título, qué ha pasado y cuándo; sin leer lleva un punto y el título en negrita.
 * A la derecha, la papelera lo quita de la lista.
 */
export function NotificationRow({
  onDeletePress,
  ...content
}: Readonly<NotificationRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createNotificationRowStyle(theme, content.isRead)}>
      <NotificationContent {...content} />
      <IconButton
        iconName="trash"
        accessibilityLabel={i18n.t('notifications.deleteOne', { title: content.title })}
        onPress={onDeletePress}
      />
    </View>
  );
}
