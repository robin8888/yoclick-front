import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const HOUR_ROW_HEIGHT = 64;
const HOUR_LABEL_WIDTH = 48;
const BLOCK_ACCENT_WIDTH = 4;

export const TIMELINE_STYLE: ViewStyle = { gap: 0 };

export function createHourRowStyle(rowSpan: number): ViewStyle {
  return { flexDirection: 'row', gap: 8, height: HOUR_ROW_HEIGHT * rowSpan };
}

export const HOUR_LABEL_STYLE: ViewStyle = { width: HOUR_LABEL_WIDTH, paddingTop: 4 };

export function createAppointmentBlockStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 2,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.md,
    borderLeftWidth: BLOCK_ACCENT_WIDTH,
    borderLeftColor: theme.colors.ink,
    backgroundColor: theme.colors.surface2,
  };
}

export function createFreeSlotStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 2,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.lineStrong,
  };
}

export const CLOSED_SLOT_STYLE: ViewStyle = { flex: 1, justifyContent: 'center', opacity: 0.6 };
