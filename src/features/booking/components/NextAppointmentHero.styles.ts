import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createHeroStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.brand,
    // Recorta el anillo decorativo que sobresale por la esquina.
    overflow: 'hidden',
  };
}

export const HERO_DECORATION_SIZE = 150;
export const HERO_DECORATION_OFFSET = -30;
export const HERO_DECORATION_OPACITY = 0.14;

export const HERO_DECORATION_STYLE: ViewStyle = {
  position: 'absolute',
  top: HERO_DECORATION_OFFSET,
  right: HERO_DECORATION_OFFSET,
  opacity: HERO_DECORATION_OPACITY,
};

export function createHeroDetailsStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[4], marginTop: theme.space[2] };
}

export function createHeroDetailStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] };
}
