import { View } from 'react-native';

import { platformAccentColors, useTheme } from '@/shared/theme';

import { Icon, type IconName } from '../Icon';
import { createIconBadgeStyle } from './IconBadge.styles';

interface IconBadgeProps {
  iconName: IconName;
}

/** Icono grande dentro de un círculo translúcido, para las cabeceras de las pantallas de marca. */
export function IconBadge({ iconName }: Readonly<IconBadgeProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createIconBadgeStyle(theme)}>
      <Icon name={iconName} size="large" tintColor={platformAccentColors.icon} />
    </View>
  );
}
