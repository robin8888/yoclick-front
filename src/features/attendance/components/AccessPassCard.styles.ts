import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createAccessPassCardStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[6],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const ACCESS_PASS_HOLDER_STYLE: ViewStyle = { alignItems: 'center' };

export function createAccessQrNoteStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
  };
}

export const ACCESS_QR_NOTE_TEXT_STYLE: ViewStyle = { flex: 1 };
