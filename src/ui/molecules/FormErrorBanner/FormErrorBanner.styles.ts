import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

import type { FormBannerTone } from './FormErrorBanner.types';

export function createBannerStyle(theme: Theme, tone: FormBannerTone): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    padding: theme.space[3],
    borderRadius: theme.radius.md,
    backgroundColor: tone === 'error' ? theme.colors.dangerSoft : theme.colors.successSoft,
  };
}

export const BANNER_TEXT_STYLE: ViewStyle = { flex: 1 };
