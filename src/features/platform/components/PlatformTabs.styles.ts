import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const TRACK_PADDING = 4;
const TAB_GAP = 4;

export function createTabsTrackStyle(theme: Theme): ViewStyle {
  return {
    alignSelf: 'stretch',
    padding: TRACK_PADDING,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  };
}

export const TABS_SCROLL_STYLE: ViewStyle = { flexGrow: 0 };

/** `flexGrow: 1` reparte el ancho sobrante entre las pestañas cuando caben todas. */
export const TABS_CONTENT_STYLE: ViewStyle = { flexGrow: 1, gap: TAB_GAP };

export function createTabStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flexGrow: 1,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingHorizontal: theme.space[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    // Relleno de marca solo en la pestaña elegida (`brand` nunca es un texto).
    backgroundColor: isSelected ? theme.colors.brand : 'transparent',
  };
}
