import type { ViewStyle } from 'react-native';

import { FINISHED_PALETTE, MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const DATE_TILE_WIDTH = 56;

export function createAppointmentCardStyle(theme: Theme, isPast: boolean): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: isPast ? FINISHED_PALETTE.background : theme.colors.line,
    backgroundColor: isPast ? FINISHED_PALETTE.background : theme.colors.surface,
  };
}

export const APPOINTMENT_SUMMARY_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'stretch' };

export function createDateTileStyle(theme: Theme): ViewStyle {
  return {
    width: DATE_TILE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brandSoft,
  };
}

export function createAppointmentDetailsStyle(theme: Theme): ViewStyle {
  return { flex: 1, justifyContent: 'center', marginStart: theme.space[3] };
}

export function createStatusBadgeRowStyle(theme: Theme): ViewStyle {
  return { alignItems: 'flex-start', marginTop: theme.space[1] };
}

export function createButtonRowStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[2] };
}

export const LINK_ROW_STYLE: ViewStyle = { flexDirection: 'row', justifyContent: 'space-around' };

export function createLinkStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingHorizontal: theme.space[2],
  };
}
