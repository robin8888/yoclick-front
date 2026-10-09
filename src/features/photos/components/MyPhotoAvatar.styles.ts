import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const BADGE_SIZE = 28;

export const CENTERED_STYLE: ViewStyle = { alignItems: 'center', gap: 8 };

/** El «+» del prototipo: un círculo con el color de la marca pegado a la esquina de la foto. */
export function createPhotoBadgeStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.brand,
  };
}
