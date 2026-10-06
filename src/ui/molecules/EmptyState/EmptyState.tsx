import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { ACTION_ROW_STYLE, createEmptyStateStyle, createIconTileStyle } from './EmptyState.styles';
import type { EmptyStateProps } from './EmptyState.types';

export function EmptyState({
  iconName,
  title,
  description,
  actionLabel,
  onActionPress,
}: Readonly<EmptyStateProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createEmptyStateStyle(theme)}>
      <View style={createIconTileStyle(theme)}>
        <Icon name={iconName} size="navigation" color="brandInk" />
      </View>
      <Text variant="titleMd" align="center">
        {title}
      </Text>
      {description === undefined ? null : (
        <Text color="ink2" align="center">
          {description}
        </Text>
      )}
      <View style={ACTION_ROW_STYLE}>
        <Button label={actionLabel} size="sm" onPress={onActionPress} />
      </View>
    </View>
  );
}
