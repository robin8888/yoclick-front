import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import { createCenterHeaderStyle, CENTER_HEADER_TEXT_STYLE } from './CenterAgendaHeader.styles';

interface CenterAgendaHeaderProps {
  centerName: string;
  centerLogoUrl: string | null;
  dateLabel: string;
  title: string;
}

/** Prototipo `aagenda`: logo del centro, fecha y título «Agenda del centro». */
export function CenterAgendaHeader({
  centerName,
  centerLogoUrl,
  dateLabel,
  title,
}: Readonly<CenterAgendaHeaderProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCenterHeaderStyle(theme)}>
      <Avatar name={centerName} photoUrl={centerLogoUrl} size="lg" isDecorative />
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
