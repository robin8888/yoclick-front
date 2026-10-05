import type { ViewStyle } from 'react-native';

import { qrCodeColors, type Theme } from '@/shared/theme';

export const DEFAULT_QR_SIZE = 200;

// Los lectores de QR necesitan fondo claro y margen.
export function createQrCardStyle(theme: Theme): ViewStyle {
  return {
    alignSelf: 'center',
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    backgroundColor: qrCodeColors.background,
  };
}
