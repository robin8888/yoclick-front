import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

import type { ClientLevelId } from '../model/client-display';

const LEVEL_DOT_SIZE = 6;

export function createLevelPillStyle(theme: Theme, level: ClientLevelId): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.pill,
    backgroundColor: level === 'advanced' ? theme.colors.infoSoft : theme.colors.surface2,
  };
}

/** Inicio, un punto gris; base, uno oscuro; avanzado, uno azul. */
export function createLevelDotStyle(theme: Theme, level: ClientLevelId): ViewStyle {
  const dotColors: Record<ClientLevelId, string> = {
    beginner: theme.colors.ink2,
    intermediate: theme.colors.ink,
    advanced: theme.colors.info,
  };
  return {
    width: LEVEL_DOT_SIZE,
    height: LEVEL_DOT_SIZE,
    borderRadius: theme.radius.pill,
    backgroundColor: dotColors[level],
  };
}
