import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createCenterHeaderStyle, CENTER_HEADER_TEXT_STYLE } from './CenterAgendaHeader.styles';

interface CenterAgendaHeaderProps {
  dateLabel: string;
  title: string;
}

/** Prototipo `aagenda`: logo del centro, fecha y título «Agenda del centro». */
export function CenterAgendaHeader({
  dateLabel,
  title,
}: Readonly<CenterAgendaHeaderProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCenterHeaderStyle(theme)}>
      <View style={CENTER_HEADER_TEXT_STYLE}>
        <Text variant="caption" color="ink2">
          {dateLabel}
        </Text>
        <Text variant="titleLg" role="heading">
          {title}
        </Text>
      </View>
    </View>
  );
}
