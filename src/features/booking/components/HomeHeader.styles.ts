import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createHomeHeaderStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] };
}

export const HOME_HEADER_TEXT_STYLE: ViewStyle = { flex: 1 };
