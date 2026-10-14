import type { Href } from 'expo-router';
import { View } from 'react-native';

import { NotificationBell } from '@/features/notifications';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createCenterHeaderStyle, CENTER_HEADER_TEXT_STYLE } from './CenterAgendaHeader.styles';

interface CenterAgendaHeaderProps {
  dateLabel: string;
  title: string;
  /** Los avisos de quien mira: cada rol tiene su pestaña de avisos. */
  notificationsHref: Href;
}

/** Título («Inicio») con la fecha debajo y la campana con los avisos sin leer; sirve al centro y al profesor. */
export function CenterAgendaHeader({
  dateLabel,
  title,
  notificationsHref,
}: Readonly<CenterAgendaHeaderProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCenterHeaderStyle(theme)}>
      <View style={CENTER_HEADER_TEXT_STYLE}>
        <Text variant="titleLg" role="heading">
          {title}
        </Text>
        <Text variant="caption" color="ink2">
          {dateLabel}
        </Text>
      </View>
      <NotificationBell href={notificationsHref} />
    </View>
  );
}
