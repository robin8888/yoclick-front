import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createPreviewCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.brandSoft,
  };
}

export const PREVIEW_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};
