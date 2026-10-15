import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const FILL_STYLE: ViewStyle = { flex: 1 };

/** El lienzo gris de fondo del hilo: las burbujas ajenas (blancas) se despegan de él. */
export function createThreadStyle(theme: Theme): ViewStyle {
  return { flex: 1, backgroundColor: theme.colors.surface2 };
}

export function createThreadContentStyle(theme: Theme): ViewStyle {
  return { padding: theme.space[3], gap: theme.space[2] };
}

export function createScreenStyle(theme: Theme): ViewStyle {
  return { flex: 1, backgroundColor: theme.colors.surface };
}
