import type { ImageStyle, ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const PLAY_BUTTON_SIZE = 64;
const COMPACT_PLAY_BUTTON_SIZE = 40;
const COMPACT_WIDTH_UNITS = 16;
const COMPACT_HEIGHT_UNITS = 10;
const COMPACT_VIDEO_ASPECT_RATIO = COMPACT_WIDTH_UNITS / COMPACT_HEIGHT_UNITS;
const TILE_MIN_HEIGHT = 120;
const VIDEO_WIDTH_UNITS = 16;
const VIDEO_HEIGHT_UNITS = 9;
const VIDEO_ASPECT_RATIO = VIDEO_WIDTH_UNITS / VIDEO_HEIGHT_UNITS;
const PROGRESS_BAR_HEIGHT = 8;

export const PLAYER_STYLE: ViewStyle = { width: '100%', aspectRatio: VIDEO_ASPECT_RATIO };
export const THUMBNAIL_STYLE: ImageStyle = { width: '100%', height: '100%' };
export const STACK_STYLE: ViewStyle = { gap: 12 };
export const ROW_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 12 };
export const WRAP_ROW_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 };
export const GROW_STYLE: ViewStyle = { flex: 1 };

/** Marco oscuro del prototipo (`tvid`): el vídeo se ve sobre negro y el botón de reproducir lleva la marca. */
export function createThumbnailFrameStyle(theme: Theme, isCompact: boolean): ViewStyle {
  return {
    width: '100%',
    aspectRatio: isCompact ? COMPACT_VIDEO_ASPECT_RATIO : VIDEO_ASPECT_RATIO,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/** El botón de reproducir va relleno con la marca: el icono encima lleva `onBrand`. */
export function createPlayBadgeStyle(theme: Theme, isCompact: boolean): ViewStyle {
  const size = isCompact ? COMPACT_PLAY_BUTTON_SIZE : PLAY_BUTTON_SIZE;
  return {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export function createVideoTitleStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    left: theme.space[3],
    right: theme.space[10],
    bottom: theme.space[2],
  };
}

/** Recuadro de rayas del prototipo (`drop`): «Sube tu vídeo» / «Añadir vídeo». */
export function createVideoTileStyle(theme: Theme, isCompact: boolean): ViewStyle {
  return {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    minHeight: isCompact ? TILE_MIN_HEIGHT : undefined,
    padding: theme.space[4],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  };
}

export function createDurationChipStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    right: theme.space[2],
    bottom: theme.space[2],
    paddingHorizontal: theme.space[2],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.sm,
    // `surface` es el texto que contrasta con `ink` en claro y en oscuro.
    backgroundColor: theme.colors.ink,
  };
}

export function createProgressTrackStyle(theme: Theme): ViewStyle {
  return {
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    overflow: 'hidden',
  };
}

export function createProgressFillStyle(theme: Theme, uploadedPercent: number): ViewStyle {
  return {
    height: PROGRESS_BAR_HEIGHT,
    width: `${String(uploadedPercent)}%` as `${number}%`,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand,
  };
}

export function createCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createMemberRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
  };
}
