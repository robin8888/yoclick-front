import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createHeroStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.brand,
  };
}

export function createHeroDetailsStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[4], marginTop: theme.space[2] };
}

export function createHeroDetailStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] };
}
