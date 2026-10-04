import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { ICON_PIXEL_SIZES, ICON_STROKE_WIDTH } from './Icon.styles';
import type { IconProps } from './Icon.types';
import { ICON_REGISTRY } from './icon-registry';

export function Icon({
  name,
  size = 'inline',
  color = 'ink',
  accessibilityLabel,
}: Readonly<IconProps>): React.JSX.Element {
  const theme = useTheme();
  const LucideGlyph = ICON_REGISTRY[name];
  const isDecorative = accessibilityLabel === undefined;

  return (
    <View
      accessible={!isDecorative}
      role={isDecorative ? undefined : 'img'}
      aria-label={accessibilityLabel}
      aria-hidden={isDecorative}
      importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'auto'}
    >
      <LucideGlyph
        size={ICON_PIXEL_SIZES[size]}
        color={theme.colors[color]}
        strokeWidth={ICON_STROKE_WIDTH}
      />
    </View>
  );
}
