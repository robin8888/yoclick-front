import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const BAR_TRACK_HEIGHT = 10;
const CHART_HEIGHT = 120;
const MAX_PERCENT = 100;

export function createReportCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createBarTrackStyle(theme: Theme): ViewStyle {
  return {
    height: BAR_TRACK_HEIGHT,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brandSoft,
    flexDirection: 'row',
    overflow: 'hidden',
  };
}

/** Se reparte el ancho con `flex`: el relleno pesa `percent` y el hueco, lo que falta hasta 100. */
export function createBarFillStyle(theme: Theme, percent: number): ViewStyle {
  return {
    flex: percent,
    height: BAR_TRACK_HEIGHT,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand,
  };
}

export function createBarGapStyle(percent: number): ViewStyle {
  return { flex: MAX_PERCENT - percent };
}

export function createColumnFillStyle(theme: Theme, percent: number): ViewStyle {
  return {
    flex: percent,
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
    backgroundColor: theme.colors.brand,
  };
}

export function createTableRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET_SIZE,
    gap: theme.space[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  };
}

export const REPORT_SECTION_STYLE: ViewStyle = { gap: 16 };
export const REPORT_HEADER_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};
export const KPI_GRID_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 12 };
export const KPI_TILE_STYLE: ViewStyle = { flexBasis: '47%', flexGrow: 1 };
export const BAR_ROW_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
};
export const CHART_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: 8,
  height: CHART_HEIGHT,
};
export const CHART_COLUMN_STYLE: ViewStyle = { flex: 1, flexDirection: 'column-reverse' };
export const AXIS_STYLE: ViewStyle = { flexDirection: 'row', gap: 8 };
export const AXIS_LABEL_STYLE: ViewStyle = { flex: 1, alignItems: 'center' };
export const TABLE_TEXT_COLUMN_STYLE: ViewStyle = { flex: 1 };
export const TABLE_NUMBER_COLUMN_STYLE: ViewStyle = { width: 56, alignItems: 'flex-end' };
