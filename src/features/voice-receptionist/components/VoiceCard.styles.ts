import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const BAR_HEIGHT = 10;
const FULL_BAR_PERCENT = 100;

export function createVoiceCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

/** Texto y control en una fila; si no caben, el control baja en lugar de cortar el texto. */
export function createVoiceRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: theme.space[3],
    rowGap: theme.space[2],
  };
}

export const VOICE_FLEX_TEXT_STYLE: ViewStyle = { flexShrink: 1, flexGrow: 1, flexBasis: '60%' };

export function createVoiceBarTrackStyle(theme: Theme): ViewStyle {
  return {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.line,
    overflow: 'hidden',
  };
}

export function createVoiceBarFillStyle(theme: Theme, percent: number): ViewStyle {
  return {
    flex: percent,
    height: BAR_HEIGHT,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand,
  };
}

/** El hueco hasta el 100 %: el relleno y el hueco se reparten el ancho con `flex`. */
export function createVoiceBarGapStyle(percent: number): ViewStyle {
  return { flex: FULL_BAR_PERCENT - percent };
}

export function createVoiceListStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[2] };
}
