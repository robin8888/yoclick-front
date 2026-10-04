import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createEmptyStateStyle, createIconTileStyle } from './EmptyState.styles';
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
        <Icon name={iconName} size="navigation" color="ink2" />
      </View>
      <Text variant="titleMd">{title}</Text>
      {description === undefined ? null : (
        <Text variant="caption" color="ink2">
          {description}
        </Text>
      )}
      <Button label={actionLabel} size="sm" onPress={onActionPress} />
    </View>
  );
}
