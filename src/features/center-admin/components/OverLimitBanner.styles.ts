import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createBannerStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.warningSoft,
  };
}
