import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

import type { CapUsage, CapUsageLevel } from '../model/client-cap-usage';
import { toPercentWidth } from '../model/percent-width';

const METER_HEIGHT = 6;

const LEVEL_COLOR_KEYS = {
  ok: 'success',
  warning: 'warning',
  full: 'danger',
} as const satisfies Record<CapUsageLevel, keyof Theme['colors']>;

export function createMeterTrackStyle(theme: Theme): ViewStyle {
  return {
    height: METER_HEIGHT,
    borderRadius: METER_HEIGHT,
    backgroundColor: theme.colors.line,
    overflow: 'hidden',
  };
}

export function createMeterFillStyle(theme: Theme, usage: CapUsage): ViewStyle {
  return {
    width: toPercentWidth(usage.ratio),
    height: METER_HEIGHT,
    borderRadius: METER_HEIGHT,
    backgroundColor: theme.colors[LEVEL_COLOR_KEYS[usage.level]],
  };
}
