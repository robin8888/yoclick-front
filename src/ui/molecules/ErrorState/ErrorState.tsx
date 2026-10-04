import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createErrorStateStyle, createErrorIconTileStyle } from './ErrorState.styles';
import type { ErrorStateProps } from './ErrorState.types';

export function ErrorState({
  title,
  message,
  retryLabel,
  onRetry,
  isRetrying = false,
  supportCodeText,
}: Readonly<ErrorStateProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createErrorStateStyle(theme)}>
      <View style={createErrorIconTileStyle(theme)}>
        <Icon name="alertTriangle" size="navigation" color="warning" />
      </View>
      <Text variant="titleMd">{title}</Text>
      <Text variant="caption" color="ink2">
        {message}
      </Text>
      <Button
        label={retryLabel}
        variant="secondary"
        size="sm"
        isLoading={isRetrying}
        onPress={onRetry}
      />
      {supportCodeText === undefined ? null : (
        <Text variant="caption" color="ink2">
          {supportCodeText}
        </Text>
      )}
    </View>
  );
}
