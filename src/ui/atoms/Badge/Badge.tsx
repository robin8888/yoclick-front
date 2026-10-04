import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Icon } from '../Icon';
import { Text } from '../Text';
import { createBadgeStyle, resolveBadgeAppearance } from './Badge.styles';
import type { BadgeProps } from './Badge.types';

/** Pastilla de estado (también sirve de StatusPill): icono + palabra + color suave. */
export function Badge({ label, tone = 'neutral' }: Readonly<BadgeProps>): React.JSX.Element {
  const theme = useTheme();
  const { backgroundColor, contentColor, iconName } = resolveBadgeAppearance(theme, tone);

  return (
    <View accessible style={createBadgeStyle(theme, backgroundColor)}>
      {iconName === null ? null : <Icon name={iconName} color={contentColor} />}
      <Text variant="caption" color={contentColor}>
        {label}
      </Text>
    </View>
  );
}
