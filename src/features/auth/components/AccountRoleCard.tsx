import { Pressable, View } from 'react-native';

import { platformCardColors, useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createAccountRoleCardStyle,
  createRoleIconTileStyle,
  ROLE_TEXT_STYLE,
} from './AccountRoleCard.styles';

interface AccountRoleCardProps {
  iconName: IconName;
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}

/** Una opción del «Soy…»: tarjeta blanca con la elegida marcada con borde dorado y una marca. */
export function AccountRoleCard({
  iconName,
  title,
  description,
  isSelected,
  onPress,
}: Readonly<AccountRoleCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={createAccountRoleCardStyle(theme, isSelected)}
    >
      <View style={createRoleIconTileStyle(theme)}>
        <Icon name={iconName} size="navigation" tintColor={platformCardColors.icon} />
      </View>
      <View style={ROLE_TEXT_STYLE}>
        <Text variant="bodyStrong" tintColor={platformCardColors.title}>
          {title}
        </Text>
        <Text variant="caption" tintColor={platformCardColors.description}>
          {description}
        </Text>
      </View>
      {isSelected ? (
        <Icon name="checkCircle" size="navigation" tintColor={platformCardColors.icon} />
      ) : null}
    </Pressable>
  );
}
