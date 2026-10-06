import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createContrastCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const CONTRAST_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

export const CONTRAST_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

export const CONTRAST_RESULT_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};
