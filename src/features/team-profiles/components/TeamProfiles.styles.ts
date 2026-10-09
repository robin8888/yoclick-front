import type { ImageStyle, ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export const STACK_STYLE: ViewStyle = { gap: 12 };
/** Entre tarjetas de una pantalla larga: más aire que dentro de una tarjeta. */
export const WIDE_STACK_STYLE: ViewStyle = { gap: 16 };
export const TIGHT_STACK_STYLE: ViewStyle = { gap: 4 };
export const ROW_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 12 };
/** Contenido centrado en columna (cabecera del perfil). */
export const CENTERED_STACK_STYLE: ViewStyle = { alignItems: 'center', gap: 8 };
/** El botón mide lo que dice su texto y se queda en el centro (el átomo siempre se pega a la izquierda). */
export const CENTER_ROW_STYLE: ViewStyle = {
  alignSelf: 'stretch',
  flexDirection: 'row',
  justifyContent: 'center',
};
export const WRAP_ROW_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 };
export const GROW_STYLE: ViewStyle = { flex: 1 };

/** Cuadrícula de dos columnas del prototipo (`grid2`). */
export const GRID_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 10 };
export const GRID_CELL_STYLE: ViewStyle = { width: '48%', flexGrow: 1, gap: 4 };

/** La cuadrícula de fotos del perfil: dos columnas con las fotos en 4:5, algo más altas que anchas. */
const GALLERY_PHOTO_WIDTH_UNITS = 4;
const GALLERY_PHOTO_HEIGHT_UNITS = 5;
const GALLERY_PHOTO_ASPECT_RATIO = GALLERY_PHOTO_WIDTH_UNITS / GALLERY_PHOTO_HEIGHT_UNITS;
export const GALLERY_GRID_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 10 };
export const GALLERY_CELL_STYLE: ViewStyle = { width: '48%', flexGrow: 1, gap: 4 };

export function createGalleryPhotoStyle(theme: Theme): ImageStyle {
  return { width: '100%', aspectRatio: GALLERY_PHOTO_ASPECT_RATIO, borderRadius: theme.radius.lg };
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

/** Lista agrupada del prototipo (`nf-list`): un solo borde y las filas separadas por una línea. */
export function createListCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createChipStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.brandInk : theme.colors.line,
    backgroundColor: isSelected ? theme.colors.brandSoft : theme.colors.surface,
  };
}

export function createStarButtonStyle(theme: Theme): ViewStyle {
  return {
    minWidth: MIN_TOUCH_TARGET_SIZE,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
  };
}
