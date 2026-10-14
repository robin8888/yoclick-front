import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

import type { BanknoteTone } from './BanknoteCard.types';

const FRAME_INSET = 6;
const FRAME_WIDTH = 1.5;
const INNER_FRAME_INSET = 11;
const INNER_FRAME_WIDTH = 0.75;
const CARD_MIN_HEIGHT = 224;
const CARD_BORDER_WIDTH = 2;
const STRIP_WIDTH = 12;
const STRIP_OPACITY = 0.16;
const CORNER_SIZE = 16;
const CORNER_INSET = 2;
const CORNER_BORDER_WIDTH = 1.5;
const NUMERAL_BORDER_WIDTH = 1.5;
const STAMP_BORDER_WIDTH = 1.5;
const WATERMARK_OPACITY = 0.22;
const PORTRAIT_WIDTH = 76;
const PORTRAIT_HEIGHT = 96;
const PORTRAIT_PADDING = 4;
const SIDE_COLUMN_WIDTH = 96;
const SEAL_SIZE = 72;
const SEAL_RING_GAP = 12;
const SEAL_BORDER_WIDTH = 2;

export interface BanknoteColors {
  /** Fondo del papel. */
  paper: string;
  /** Trazos, marco y sello. */
  accent: string;
}

/** Cada tono es un «papel» y una tinta, siempre desde los tokens del tema (claro y oscuro). */
export function resolveBanknoteColors(theme: Theme, tone: BanknoteTone): BanknoteColors {
  if (tone === 'pending') {
    return { paper: theme.colors.warningSoft, accent: theme.colors.warning };
  }
  if (tone === 'inactive') {
    return { paper: theme.colors.surface2, accent: theme.colors.lineStrong };
  }
  return { paper: theme.colors.brandSoft, accent: theme.colors.brandInk };
}

export function createBanknoteStyle(theme: Theme, colors: BanknoteColors): ViewStyle {
  return {
    minHeight: CARD_MIN_HEIGHT,
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    borderWidth: CARD_BORDER_WIDTH,
    borderColor: colors.accent,
    backgroundColor: colors.paper,
  };
}

/** El marco interior fino, como la orla impresa de un billete. */
export function createBanknoteFrameStyle(theme: Theme, colors: BanknoteColors): ViewStyle {
  return {
    position: 'absolute',
    top: FRAME_INSET,
    bottom: FRAME_INSET,
    start: FRAME_INSET,
    end: FRAME_INSET,
    borderRadius: theme.radius.sm,
    borderWidth: FRAME_WIDTH,
    borderColor: colors.accent,
    opacity: 0.7,
  };
}

/** Segundo filete, más fino y por dentro del marco: da el aspecto de orla de billete. */
export function createBanknoteInnerFrameStyle(theme: Theme, colors: BanknoteColors): ViewStyle {
  return {
    position: 'absolute',
    top: INNER_FRAME_INSET,
    bottom: INNER_FRAME_INSET,
    start: INNER_FRAME_INSET,
    end: INNER_FRAME_INSET,
    borderRadius: theme.radius.sm,
    borderWidth: INNER_FRAME_WIDTH,
    borderColor: colors.accent,
    opacity: 0.5,
  };
}

function createBanknoteStripBaseStyle(colors: BanknoteColors): ViewStyle {
  return {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: STRIP_WIDTH,
    backgroundColor: colors.accent,
    opacity: STRIP_OPACITY,
  };
}

/** Las bandas de seguridad verticales de los bordes, como el fondo oscuro de un billete. */
export function createBanknoteStartStripStyle(colors: BanknoteColors): ViewStyle {
  return { ...createBanknoteStripBaseStyle(colors), start: 0 };
}

export function createBanknoteEndStripStyle(colors: BanknoteColors): ViewStyle {
  return { ...createBanknoteStripBaseStyle(colors), end: 0 };
}

interface BanknoteCornerPlacement {
  isTop: boolean;
  isStart: boolean;
}

/** Un medallón redondo en la esquina, sobre el cruce de los marcos. */
export function createBanknoteCornerStyle(
  colors: BanknoteColors,
  { isTop, isStart }: BanknoteCornerPlacement,
): ViewStyle {
  return {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderRadius: CORNER_SIZE,
    borderWidth: CORNER_BORDER_WIDTH,
    borderColor: colors.accent,
    backgroundColor: colors.paper,
    ...(isTop ? { top: CORNER_INSET } : { bottom: CORNER_INSET }),
    ...(isStart ? { start: CORNER_INSET } : { end: CORNER_INSET }),
  };
}

/** El número en el recuadro del pie, a la derecha: la cifra del billete como en su esquina. */
export function createBanknoteNumeralStyle(theme: Theme, colors: BanknoteColors): ViewStyle {
  return {
    minWidth: theme.space[8],
    alignItems: 'center',
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.sm,
    borderWidth: NUMERAL_BORDER_WIDTH,
    borderColor: colors.accent,
    backgroundColor: colors.paper,
  };
}

export function createBanknoteBodyStyle(theme: Theme): ViewStyle {
  return { padding: theme.space[4], paddingHorizontal: theme.space[5], gap: theme.space[2] };
}

export const BANKNOTE_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

export const BANKNOTE_TITLE_STYLE: ViewStyle = { flex: 1 };

export const BANKNOTE_VALUE_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: 8,
};

export const BANKNOTE_FOOTER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

export function createBanknoteStampStyle(theme: Theme, colors: BanknoteColors): ViewStyle {
  return {
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.sm,
    borderWidth: STAMP_BORDER_WIDTH,
    borderColor: colors.accent,
    backgroundColor: colors.paper,
  };
}

/** La franja de acciones: una línea de puntos sobre el papel, como el corte de un talón. */
export function createBanknoteActionsStyle(theme: Theme, colors: BanknoteColors): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[5],
    paddingVertical: theme.space[3],
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: colors.accent,
  };
}

/** La marca de agua: el logo del centro, tenue, dentro del óvalo central del billete. */
export const BANKNOTE_WATERMARK_STYLE: ViewStyle = {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  borderRadius: PORTRAIT_WIDTH,
  justifyContent: 'center',
  alignItems: 'center',
  opacity: WATERMARK_OPACITY,
};

/** El logo llena todo el óvalo; el recorte redondo del contenedor le da la forma. */
export const BANKNOTE_WATERMARK_IMAGE_STYLE = {
  width: '100%',
  height: '100%',
} as const;

export const BANKNOTE_MIDDLE_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const BANKNOTE_VALUE_COLUMN_STYLE: ViewStyle = {
  width: SIDE_COLUMN_WIDTH,
  alignItems: 'flex-end',
};

export const BANKNOTE_SEAL_COLUMN_STYLE: ViewStyle = {
  width: SIDE_COLUMN_WIDTH,
  alignItems: 'flex-start',
};

/** La banda superior con el nombre de la academia, como el rótulo «Federal Reserve Note». */
export function createBanknoteIssuerBandStyle(theme: Theme, colors: BanknoteColors): ViewStyle {
  return {
    alignSelf: 'center',
    maxWidth: '100%',
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.sm,
    borderWidth: NUMERAL_BORDER_WIDTH,
    borderColor: colors.accent,
    backgroundColor: colors.paper,
  };
}

/** El sello redondo del estado, con doble aro como el sello de la Reserva Federal. */
export function createBanknoteSealStyle(colors: BanknoteColors): ViewStyle {
  return {
    width: SEAL_SIZE,
    height: SEAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SEAL_SIZE,
    borderWidth: SEAL_BORDER_WIDTH,
    borderColor: colors.accent,
    backgroundColor: colors.paper,
  };
}

export function createBanknoteSealInnerStyle(colors: BanknoteColors): ViewStyle {
  return {
    width: SEAL_SIZE - SEAL_RING_GAP,
    height: SEAL_SIZE - SEAL_RING_GAP,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SEAL_SIZE,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
  };
}

/** El óvalo central, donde el billete real lleva el retrato: aquí, el logo del centro. */
export function createBanknotePortraitStyle(colors: BanknoteColors): ViewStyle {
  return {
    width: PORTRAIT_WIDTH,
    height: PORTRAIT_HEIGHT,
    padding: PORTRAIT_PADDING,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: PORTRAIT_WIDTH,
    borderWidth: SEAL_BORDER_WIDTH,
    borderColor: colors.accent,
    backgroundColor: colors.paper,
  };
}
