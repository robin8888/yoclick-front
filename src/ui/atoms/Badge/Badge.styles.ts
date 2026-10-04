import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

import type { IconName } from '../Icon';
import type { BadgeTone } from './Badge.types';

export type BadgeContentColor = 'ink' | 'brandInk' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeAppearance {
  backgroundColor: string;
  contentColor: BadgeContentColor;
  /** Segunda pista visual además del color; las marcas y neutros no la necesitan. */
  iconName: IconName | null;
}

export function resolveBadgeAppearance(theme: Theme, tone: BadgeTone): BadgeAppearance {
  const { colors } = theme;
  switch (tone) {
    case 'neutral':
      return { backgroundColor: colors.surface2, contentColor: 'ink', iconName: null };
    case 'brand':
      return { backgroundColor: colors.brandSoft, contentColor: 'brandInk', iconName: null };
    case 'success':
      return {
        backgroundColor: colors.successSoft,
        contentColor: 'success',
        iconName: 'checkCircle',
      };
    case 'warning':
      return {
        backgroundColor: colors.warningSoft,
        contentColor: 'warning',
        iconName: 'alertTriangle',
      };
    case 'danger':
      return { backgroundColor: colors.dangerSoft, contentColor: 'danger', iconName: 'xCircle' };
    case 'info':
      return { backgroundColor: colors.infoSoft, contentColor: 'info', iconName: 'info' };
  }
}

export function createBadgeStyle(theme: Theme, backgroundColor: string): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.space[1],
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.pill,
    backgroundColor,
  };
}
