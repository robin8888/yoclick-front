import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const BORDER_WIDTH = 1;

export function createAutocompleteStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[2] };
}

export function createOptionListStyle(theme: Theme): ViewStyle {
  return {
    borderWidth: BORDER_WIDTH,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  };
}

export function createOptionRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[2],
  };
}

export function createOptionSeparatorStyle(theme: Theme): ViewStyle {
  return { height: BORDER_WIDTH, backgroundColor: theme.colors.line };
}

export const OPTION_TEXT_STYLE: ViewStyle = { flex: 1 };
