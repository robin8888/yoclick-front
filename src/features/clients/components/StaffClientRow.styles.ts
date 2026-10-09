import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createStaffClientRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createStaffClientListStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}

export function createNextAppointmentStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[1] };
}

export function createStaffClientHeadStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
  };
}
