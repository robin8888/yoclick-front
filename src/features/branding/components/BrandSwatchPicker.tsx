import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { BRAND_SWATCH_GROUPS, type BrandSwatchGroup } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { BrandCustomColorPanel } from './BrandCustomColorPanel';
import { BRAND_SWATCH_LIST_STYLE, BRAND_SWATCH_SECTION_STYLE } from './BrandSwatchPicker.styles';
import { ColorSelectorToggle } from './ColorSelectorToggle';
import { ColorSwatch } from './ColorSwatch';

interface BrandSwatchPickerProps {
  selectedColor: string;
  hasColorProblem: boolean;
  onColorChange: (hexColor: string) => void;
}

interface SwatchGroupRowProps {
  group: BrandSwatchGroup;
  selectedColor: string;
  onColorChange: (hexColor: string) => void;
}

const GROUP_TITLE_KEYS = {
  vivid: 'branding.color.groups.vivid',
  pastel: 'branding.color.groups.pastel',
  metallic: 'branding.color.groups.metallic',
} as const satisfies Record<BrandSwatchGroup['id'], string>;

function SwatchGroupRow({
  group,
  selectedColor,
  onColorChange,
}: Readonly<SwatchGroupRowProps>): React.JSX.Element {
  return (
    <View style={BRAND_SWATCH_SECTION_STYLE}>
      <Text variant="caption" color="ink2">
        {i18n.t(GROUP_TITLE_KEYS[group.id])}
      </Text>
      <View style={BRAND_SWATCH_LIST_STYLE}>
        {group.colors.map((swatchColor) => (
          <ColorSwatch
            key={swatchColor}
            swatchColor={swatchColor}
            isSelected={swatchColor === selectedColor.toUpperCase()}
            onPress={() => {
              onColorChange(swatchColor);
            }}
          />
        ))}
      </View>
    </View>
  );
}

/** Prototipo `abrand`, «Color principal»: vivos, pastel y metalizados, y un «+» con el selector de color. */
export function BrandSwatchPicker({
  selectedColor,
  hasColorProblem,
  onColorChange,
}: Readonly<BrandSwatchPickerProps>): React.JSX.Element {
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  return (
    <View style={BRAND_SWATCH_SECTION_STYLE}>
      <Text variant="bodyStrong">{i18n.t('branding.color.title')}</Text>
      {BRAND_SWATCH_GROUPS.map((group) => (
        <SwatchGroupRow
          key={group.id}
          group={group}
          selectedColor={selectedColor}
          onColorChange={onColorChange}
        />
      ))}
      <ColorSelectorToggle
        isOpen={isCustomOpen}
        onToggle={() => {
          setIsCustomOpen((isOpen) => !isOpen);
        }}
      />
      {isCustomOpen ? (
        <BrandCustomColorPanel
          selectedColor={selectedColor}
          hasColorProblem={hasColorProblem}
          onColorChange={onColorChange}
        />
      ) : null}
    </View>
  );
}
