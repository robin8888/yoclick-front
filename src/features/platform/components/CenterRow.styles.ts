import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const BADGES_GAP = 6;

export function createCenterRowStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: BADGES_GAP,
};

export const BADGES_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: BADGES_GAP };
