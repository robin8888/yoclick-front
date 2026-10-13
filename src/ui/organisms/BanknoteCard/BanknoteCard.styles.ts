import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

import type { BanknoteTone } from './BanknoteCard.types';

const FRAME_INSET = 6;
const FRAME_WIDTH = 1.5;
const CARD_MIN_HEIGHT = 168;
const STAMP_BORDER_WIDTH = 1.5;
const WATERMARK_SIZE = 124;
const WATERMARK_OPACITY = 0.16;

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
    borderWidth: 1,
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

/** La marca de agua: a la derecha, centrada en vertical, tenue. */
export const BANKNOTE_WATERMARK_STYLE: ViewStyle = {
  position: 'absolute',
  end: 20,
  top: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  width: WATERMARK_SIZE,
  opacity: WATERMARK_OPACITY,
};

export const BANKNOTE_WATERMARK_IMAGE_STYLE = {
  width: WATERMARK_SIZE,
  height: WATERMARK_SIZE,
} as const;
