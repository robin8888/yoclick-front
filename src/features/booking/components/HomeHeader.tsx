import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import { createHomeHeaderStyle, HOME_HEADER_TEXT_STYLE } from './HomeHeader.styles';

interface HomeHeaderProps {
  dateLabel: string;
  greeting: string;
  fullName: string;
}

/** Prototipo `home`: logo del centro, fecha y saludo a la izquierda; las iniciales a la derecha. */
export function HomeHeader({
  dateLabel,
  greeting,
  fullName,
}: Readonly<HomeHeaderProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createHomeHeaderStyle(theme)}>
      <View style={HOME_HEADER_TEXT_STYLE}>
        <Text variant="caption" color="ink2">
          {dateLabel}
        </Text>
        <Text variant="titleLg" role="heading">
          {greeting}
        </Text>
      </View>
      <Avatar name={fullName} size="md" />
    </View>
  );
}
