import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createListItemStyle, LIST_ITEM_TEXT_STYLE } from './ListItem.styles';
import type { ListItemProps } from './ListItem.types';

export function ListItem({
  title,
  subtitle,
  leadingIconName,
  leading,
  isSelected = false,
  onPress,
  accessibilityLabel,
}: Readonly<ListItemProps>): React.JSX.Element {
  const theme = useTheme();
  const spokenLabel = subtitle === undefined ? title : `${title}. ${subtitle}`;

  return (
    <Pressable
      role="button"
      accessibilityLabel={accessibilityLabel ?? spokenLabel}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={createListItemStyle({ theme, isSelected })}
    >
      {leading}
      {leadingIconName === undefined ? null : <Icon name={leadingIconName} color="brandInk" />}
      <View style={LIST_ITEM_TEXT_STYLE}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle === undefined ? null : (
          <Text variant="caption" color="ink2">
            {subtitle}
          </Text>
        )}
      </View>
      <Icon name={isSelected ? 'check' : 'chevronRight'} color={isSelected ? 'brandInk' : 'ink2'} />
    </Pressable>
  );
}
