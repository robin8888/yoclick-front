import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { BRAND_COLOR_PRESETS, buildTheme, useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  BRAND_SWATCH_LIST_STYLE,
  createBrandSwatchStyle,
  BRAND_COLOR_PICKER_STYLE,
} from './BrandColorPicker.styles';

interface BrandColorPickerProps {
  selectedColor: string;
  onColorSelect: (hexColor: string) => void;
}

/** Paleta de partida; la marca se ajusta con el logo cuando la API admita subirlo. */
export function BrandColorPicker({
  selectedColor,
  onColorSelect,
}: Readonly<BrandColorPickerProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={BRAND_COLOR_PICKER_STYLE}>
      <Text variant="bodyStrong">{i18n.t('onboarding.center.colorLabel')}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('onboarding.center.colorHelper')}
      </Text>
      <View style={BRAND_SWATCH_LIST_STYLE}>
        {BRAND_COLOR_PRESETS.map((presetColor) => {
          const isSelected = presetColor === selectedColor;
          const checkColor = buildTheme({
            mode: theme.mode,
            brandHexColor: presetColor,
          }).colors.onBrand;
          return (
            <Pressable
              key={presetColor}
              role="button"
              accessibilityLabel={i18n.t('onboarding.center.colorOptionLabel', {
                hex: presetColor,
              })}
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                onColorSelect(presetColor);
              }}
              style={createBrandSwatchStyle(theme, presetColor, isSelected)}
            >
              {isSelected ? <Icon name="check" size="navigation" tintColor={checkColor} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
