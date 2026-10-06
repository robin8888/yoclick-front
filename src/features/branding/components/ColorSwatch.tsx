import { Pressable } from 'react-native';

import { i18n } from '@/shared/i18n';
import { buildTheme, useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';

import { createBrandSwatchStyle } from './BrandSwatchPicker.styles';

interface ColorSwatchProps {
  swatchColor: string;
  isSelected: boolean;
  onPress: () => void;
}

/** Un color elegible: círculo relleno con una marca de verificación cuando es el elegido. */
export function ColorSwatch({
  swatchColor,
  isSelected,
  onPress,
}: Readonly<ColorSwatchProps>): React.JSX.Element {
  const theme = useTheme();
  const checkColor = buildTheme({ mode: theme.mode, brandHexColor: swatchColor }).colors.onBrand;

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('branding.color.optionLabel', { hex: swatchColor })}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={createBrandSwatchStyle(theme, swatchColor, isSelected)}
    >
      {isSelected ? <Icon name="check" size="navigation" tintColor={checkColor} /> : null}
    </Pressable>
  );
}
