import { ActivityIndicator } from 'react-native';

import { useTheme } from '@/shared/theme';

import type { SpinnerProps } from './Spinner.types';

export function Spinner({
  size = 'small',
  color = 'brandInk',
  accessibilityLabel,
}: Readonly<SpinnerProps>): React.JSX.Element {
  const theme = useTheme();
  const isDecorative = accessibilityLabel === undefined;

  return (
    <ActivityIndicator
      size={size}
      color={theme.colors[color]}
      accessible={!isDecorative}
      role={isDecorative ? undefined : 'progressbar'}
      aria-label={accessibilityLabel}
      aria-busy={!isDecorative}
      importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'auto'}
    />
  );
}
