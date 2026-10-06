import type { TextStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createShareCardStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const CODE_TEXT_STYLE: ViewStyle = { alignItems: 'center' };
export const CODE_LETTER_SPACING: TextStyle = { letterSpacing: 4 };
export const BUTTON_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 8,
};
