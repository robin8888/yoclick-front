import type { ImageStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const STACK_STYLE: ViewStyle = { gap: 12 };
export const WRAP_ROW_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 };
export const ROW_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 12 };
export const GROW_STYLE: ViewStyle = { flex: 1, minWidth: 0 };
export const GRID_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 10 };
export const THUMBNAIL_IMAGE_STYLE: ImageStyle = { width: '100%', height: '100%' };

const LIBRARY_THUMBNAIL_SIZE = 52;
const MEDIA_CARD_WIDTH = '48%';
const MEDIA_THUMBNAIL_HEIGHT = 96;

export function createDropZoneStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[1],
    padding: theme.space[4],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  };
}

const DOCUMENT_ICON_SIZE = 72;

/** La «hoja» del PDF: una tarjeta grande y centrada con su icono, su nombre y sus datos. */
export function createDocumentSheetStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[6],
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
  };
}

export function createDocumentIconStyle(theme: Theme): ViewStyle {
  return {
    width: DOCUMENT_ICON_SIZE,
    height: DOCUMENT_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brandSoft,
  };
}

export const CENTERED_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 8,
};

export function createLibraryCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[3],
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  };
}

export function createThumbnailStyle(theme: Theme, isLarge: boolean): ViewStyle {
  return {
    width: isLarge ? '100%' : LIBRARY_THUMBNAIL_SIZE,
    height: isLarge ? MEDIA_THUMBNAIL_HEIGHT : LIBRARY_THUMBNAIL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: isLarge ? 0 : theme.radius.md,
    backgroundColor: theme.colors.surface2,
  };
}

export function createMediaCardStyle(theme: Theme): ViewStyle {
  return {
    width: MEDIA_CARD_WIDTH,
    flexGrow: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  };
}

export function createMediaBodyStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[1], padding: theme.space[3] };
}

export function createDurationChipStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    right: theme.space[2],
    bottom: theme.space[2],
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.scrim,
  };
}
