import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const AUDIT_LIST_GAP = 8;

export const AUDIT_LIST_STYLE: ViewStyle = { gap: AUDIT_LIST_GAP };

export function createAuditRowStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[1],
    padding: theme.space[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
