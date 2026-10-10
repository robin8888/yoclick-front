import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createPremiumSectionStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const PREMIUM_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

export function createPremiumFieldStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}
