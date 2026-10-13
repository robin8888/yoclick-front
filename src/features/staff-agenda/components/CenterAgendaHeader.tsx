import { View } from 'react-native';

import { NotificationBell } from '@/features/notifications';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createCenterHeaderStyle, CENTER_HEADER_TEXT_STYLE } from './CenterAgendaHeader.styles';

interface CenterAgendaHeaderProps {
  dateLabel: string;
  title: string;
}

/** Título («Inicio») con la fecha debajo y la campana con los avisos sin leer. */
export function CenterAgendaHeader({
  dateLabel,
  title,
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
      <NotificationBell href="/(admin)/(tabs)/notifications" />
    </View>
  );
}
