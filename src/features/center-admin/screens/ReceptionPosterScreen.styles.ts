import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

/** El cartel va en el color de la marca, con el texto que contrasta sobre él (`onBrand`). */
export function createPosterStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[4],
    padding: theme.space[6],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brand,
  };
}

export const POSTER_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};
export const POSTER_STEPS_STYLE: ViewStyle = { gap: 4, alignSelf: 'stretch' };
