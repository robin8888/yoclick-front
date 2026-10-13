import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const CHECK_SIZE = 40;

export function createAttendanceRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const ATTENDANCE_NAME_STYLE: ViewStyle = { flex: 1, gap: 2 };

/** El check: círculo vacío para confirmar y relleno con la marca ya confirmado. */
export function createCheckStyle(theme: Theme, isConfirmed: boolean): ViewStyle {
  return {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: isConfirmed ? theme.colors.success : theme.colors.lineStrong,
    backgroundColor: isConfirmed ? theme.colors.success : theme.colors.surface,
  };
}
