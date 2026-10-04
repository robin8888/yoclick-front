import { View, type ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import type { OfflineBannerProps } from './OfflineBanner.types';

export function OfflineBanner({
  isOffline,
  message,
}: Readonly<OfflineBannerProps>): React.JSX.Element | null {
  const theme = useTheme();
  if (!isOffline) return null;

  // Franja fija `ink` con texto `surface` (sistema de diseño › Estados); el icono y la palabra
  // «sin conexión» hacen que no dependa solo del color.
  const bannerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[2],
    backgroundColor: theme.colors.ink,
  };

  return (
    <View
      role="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      accessible
      style={bannerStyle}
    >
      <Icon name="wifiOff" color="surface" />
      <Text variant="caption" color="surface">
        {message}
      </Text>
    </View>
  );
}
