import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const FACT_GAP = 12;

export const FACTS_STYLE: ViewStyle = { gap: FACT_GAP, alignItems: 'flex-start' };

export function createFactsCardStyle(theme: Theme): ViewStyle {
  return {
    alignSelf: 'stretch',
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const FACT_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: FACT_GAP,
};
