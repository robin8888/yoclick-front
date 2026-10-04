import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const DEFAULT_BORDER_WIDTH = 1;
const SELECTED_BORDER_WIDTH = 2;

interface ListItemStyleRequest {
  theme: Theme;
  isSelected: boolean;
}

export function createListItemStyle({ theme, isSelected }: ListItemStyleRequest): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[4],
    borderRadius: theme.radius.md,
    borderWidth: isSelected ? SELECTED_BORDER_WIDTH : DEFAULT_BORDER_WIDTH,
    borderColor: isSelected ? theme.colors.brand : theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const LIST_ITEM_TEXT_STYLE: ViewStyle = { flex: 1 };
