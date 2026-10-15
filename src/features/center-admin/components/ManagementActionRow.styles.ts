import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const ROW_MIN_HEIGHT = 84;
const FEATURED_MIN_HEIGHT = 108;
const ICON_PILL_SIZE = 52;
const FEATURED_ICON_PILL_SIZE = 60;
const VEIL_OPACITY = 0.16;
const TEXT_GAP = 2;
const SOFT_SHADOW_OPACITY = 0.07;
const SOFT_SHADOW_RADIUS = 14;
const SOFT_SHADOW_OFFSET_Y = 4;
const SOFT_SHADOW_ELEVATION = 2;

export function createManagementStackStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}

export function createManagementRowStyle(theme: Theme, isFeatured: boolean): ViewStyle {
  const base: ViewStyle = {
    minHeight: isFeatured ? FEATURED_MIN_HEIGHT : ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
  };
  if (isFeatured) return { ...base, backgroundColor: theme.colors.brand };
  return {
    ...base,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.ink,
    shadowOpacity: SOFT_SHADOW_OPACITY,
    shadowRadius: SOFT_SHADOW_RADIUS,
    shadowOffset: { width: 0, height: SOFT_SHADOW_OFFSET_Y },
    elevation: SOFT_SHADOW_ELEVATION,
  };
}

/** Pastilla del icono: suave de marca en las filas normales; con velo claro sobre la marca en la destacada. */
export function createManagementIconPillStyle(theme: Theme, isFeatured: boolean): ViewStyle {
  const size = isFeatured ? FEATURED_ICON_PILL_SIZE : ICON_PILL_SIZE;
  return {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    ...(isFeatured ? {} : { backgroundColor: theme.colors.brandSoft }),
  };
}

export function createManagementVeilStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: VEIL_OPACITY,
    backgroundColor: theme.colors.onBrand,
  };
}

export const MANAGEMENT_ROW_TEXT_STYLE: ViewStyle = { flex: 1, gap: TEXT_GAP };
