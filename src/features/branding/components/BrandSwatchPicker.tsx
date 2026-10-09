import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { BrandCustomColorPanel } from './BrandCustomColorPanel';
import { BRAND_SWATCH_SECTION_STYLE } from './BrandSwatchPicker.styles';

interface BrandSwatchPickerProps {
  selectedColor: string;
  hasColorProblem: boolean;
  onColorChange: (hexColor: string) => void;
}

/** «Color principal»: un solo selector de color, como el `<input type="color">` de HTML, y su hexadecimal. */
export function BrandSwatchPicker({
  selectedColor,
  hasColorProblem,
  onColorChange,
}: Readonly<BrandSwatchPickerProps>): React.JSX.Element {
  return (
    <View style={BRAND_SWATCH_SECTION_STYLE}>
      <Text variant="bodyStrong">{i18n.t('branding.color.title')}</Text>
      <BrandCustomColorPanel
        selectedColor={selectedColor}
        hasColorProblem={hasColorProblem}
        onColorChange={onColorChange}
      />
    </View>
  );
}
