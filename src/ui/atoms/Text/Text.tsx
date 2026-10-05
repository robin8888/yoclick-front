import { Text as NativeText } from 'react-native';

import { useTextStyle } from './Text.styles';
import type { TextProps, TextVariant } from './Text.types';

// Los títulos se anuncian como encabezados para que los lectores de pantalla puedan saltar
// entre secciones; se puede sobrescribir con la prop `role`.
const HEADING_VARIANTS: readonly TextVariant[] = ['display', 'titleLg', 'titleMd'];

export function Text({
  variant = 'body',
  color = 'ink',
  align,
  tintColor,
  role,
  maxFontSizeMultiplier,
  ...nativeTextProps
}: Readonly<TextProps>): React.JSX.Element {
  const textStyle = useTextStyle({ variant, color, align, tintColor });
  const defaultRole = HEADING_VARIANTS.includes(variant) ? 'heading' : undefined;

  return (
    <NativeText
      {...nativeTextProps}
      role={role ?? defaultRole}
      style={textStyle}
      allowFontScaling
      maxFontSizeMultiplier={maxFontSizeMultiplier}
    />
  );
}
