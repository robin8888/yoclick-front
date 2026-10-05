import { Pressable, View } from 'react-native';

import { platformCardColors, useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createIconTileStyle,
  createJoinOptionCardStyle,
  JOIN_OPTION_TEXT_STYLE,
} from './JoinOptionCard.styles';

interface JoinOptionCardProps {
  iconName: IconName;
  title: string;
  description: string;
  onPress: () => void;
}

/** Tarjeta de una forma de unirse a un centro, con el icono en los azules del logo. */
export function JoinOptionCard({
  iconName,
  title,
  description,
  onPress,
}: Readonly<JoinOptionCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed: isPressed }) => createJoinOptionCardStyle(theme, isPressed)}
    >
      <View style={createIconTileStyle(theme, platformCardColors.iconTile)}>
        <Icon name={iconName} size="large" tintColor={platformCardColors.icon} />
      </View>
      <View style={JOIN_OPTION_TEXT_STYLE}>
        <Text variant="bodyStrong" tintColor={platformCardColors.title}>
          {title}
        </Text>
        <Text variant="caption" tintColor={platformCardColors.description}>
          {description}
        </Text>
      </View>
      <Icon name="chevronRight" size="navigation" tintColor={platformCardColors.icon} />
    </Pressable>
  );
}
