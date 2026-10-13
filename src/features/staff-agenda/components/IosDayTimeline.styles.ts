import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const IOS_HOUR_HEIGHT = 64;
export const IOS_LABEL_WIDTH = 48;
const EVENT_ACCENT_WIDTH = 4;
const EVENT_GAP = 2;
const NOW_DOT_SIZE = 10;
const NOW_LINE_WIDTH = 2;
const HALF = 0.5;
const LABEL_LIFT = 8;
const GAP_COUNT = 2;
const PERCENT_DECIMALS = 2;

export function createTimelineStyle(totalHeight: number): ViewStyle {
  return { height: totalHeight, marginTop: 8 };
}

/** Una raya fina por hora, como la rejilla del calendario de iOS. */
export function createHourLineStyle(theme: Theme, top: number): ViewStyle {
  return {
    position: 'absolute',
    top,
    start: IOS_LABEL_WIDTH,
    end: 0,
    height: 1,
    backgroundColor: theme.colors.line,
  };
}

export function createHourLabelStyle(top: number): ViewStyle {
  return {
    position: 'absolute',
    top: top - LABEL_LIFT,
    start: 0,
    width: IOS_LABEL_WIDTH - LABEL_LIFT,
    alignItems: 'flex-end',
  };
}

/** El área de las clases: a la derecha de las etiquetas de hora. */
export const EVENTS_AREA_STYLE: ViewStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  start: IOS_LABEL_WIDTH,
  end: 0,
};

/** Cada clase: bloque suave con una barra de color a la izquierda, fijado por minutos y columna. */
export function createEventStyle(
  theme: Theme,
  placement: { top: number; height: number; leftPercent: number; widthPercent: number },
): ViewStyle {
  return {
    position: 'absolute',
    top: placement.top + EVENT_GAP,
    height: Math.max(placement.height - EVENT_GAP * GAP_COUNT, 0),
    start: `${placement.leftPercent.toFixed(PERCENT_DECIMALS)}%` as `${number}%`,
    width: `${placement.widthPercent.toFixed(PERCENT_DECIMALS)}%` as `${number}%`,
    overflow: 'hidden',
    paddingHorizontal: theme.space[2],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.sm,
    borderStartWidth: EVENT_ACCENT_WIDTH,
    borderStartColor: theme.colors.brand,
    backgroundColor: theme.colors.brandSoft,
  };
}

/** La línea de «ahora»: un punto y una raya del color de peligro, como en iOS. */
export function createNowLineStyle(theme: Theme, top: number): ViewStyle {
  return {
    position: 'absolute',
    top: top - NOW_LINE_WIDTH * HALF,
    start: IOS_LABEL_WIDTH - NOW_DOT_SIZE * HALF,
    end: 0,
    height: NOW_LINE_WIDTH,
    backgroundColor: theme.colors.danger,
  };
}

export function createNowDotStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: -(NOW_DOT_SIZE * HALF) + NOW_LINE_WIDTH * HALF,
    start: 0,
    width: NOW_DOT_SIZE,
    height: NOW_DOT_SIZE,
    borderRadius: NOW_DOT_SIZE * HALF,
    backgroundColor: theme.colors.danger,
  };
}
