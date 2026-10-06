import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';

import { buildColorGrid } from '../model/color-grid';
import { BRAND_SWATCH_LIST_STYLE, BRAND_SWATCH_SECTION_STYLE } from './BrandSwatchPicker.styles';
import { ColorSwatch } from './ColorSwatch';

interface BrandCustomColorPanelProps {
  selectedColor: string;
  hasColorProblem: boolean;
  onColorChange: (hexColor: string) => void;
}

const COLOR_GRID = buildColorGrid();
const HEX_COLOR_LENGTH = 7;

/** El selector de color: una cuadrícula de tonos y, debajo, el campo para escribir el hexadecimal. */
export function BrandCustomColorPanel({
  selectedColor,
  hasColorProblem,
  onColorChange,
}: Readonly<BrandCustomColorPanelProps>): React.JSX.Element {
  return (
    <View style={BRAND_SWATCH_SECTION_STYLE}>
      <Text variant="caption" color="ink2">
        {i18n.t('branding.color.gridHelper')}
      </Text>
      <View style={BRAND_SWATCH_LIST_STYLE}>
        {COLOR_GRID.map((gridColor) => (
          <ColorSwatch
            key={gridColor}
            swatchColor={gridColor}
            isSelected={gridColor === selectedColor.toUpperCase()}
            onPress={() => {
              onColorChange(gridColor);
            }}
          />
        ))}
      </View>
      <FormField
        label={i18n.t('branding.color.customFieldLabel')}
        helperText={i18n.t('branding.color.customFieldHelper')}
        errorMessage={hasColorProblem ? i18n.t('branding.color.invalid') : undefined}
        value={selectedColor}
        onChangeText={onColorChange}
        autoCapitalize="characters"
        maxLength={HEX_COLOR_LENGTH}
      />
    </View>
  );
}
