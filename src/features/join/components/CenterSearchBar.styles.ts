import type { TextStyle, ViewStyle } from 'react-native';

import { platformCardColors, resolveFontFaceName, type Theme } from '@/shared/theme';

const SEARCH_BAR_HEIGHT = 60;
const SEARCH_BAR_BORDER_WIDTH = 2.5;
const SEARCH_INPUT_FONT_SIZE = 17;
const FIELD_GAP = 8;

export const CENTER_SEARCH_FIELD_STYLE: ViewStyle = { gap: FIELD_GAP };

export function createSearchBarStyle(theme: Theme, isInvalid: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    height: SEARCH_BAR_HEIGHT,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.pill,
    borderWidth: SEARCH_BAR_BORDER_WIDTH,
    borderColor: isInvalid ? theme.colors.danger : 'transparent',
    backgroundColor: platformCardColors.surface,
  };
}

export function createSearchInputStyle(): TextStyle {
  return {
    flex: 1,
    height: SEARCH_BAR_HEIGHT,
    fontSize: SEARCH_INPUT_FONT_SIZE,
    fontFamily: resolveFontFaceName({ fontFamily: 'sans', fontWeight: '500' }),
    color: platformCardColors.title,
  };
}
