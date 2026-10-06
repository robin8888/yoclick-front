import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';

import { createCheckboxStyle, createRadioDotStyle, createRadioStyle } from './OptionCard.styles';
import type { OptionSelectionMode } from './OptionCard.types';

interface OptionIndicatorProps {
  selectionMode: OptionSelectionMode;
  isSelected: boolean;
}

/** El selector de una opción: punto en un círculo, o marca en una casilla (no solo color). */
export function OptionIndicator({
  selectionMode,
  isSelected,
}: Readonly<OptionIndicatorProps>): React.JSX.Element {
  const theme = useTheme();

  if (selectionMode === 'multiple') {
    return (
      <View style={createCheckboxStyle(theme, isSelected)}>
        {isSelected ? <Icon name="check" size="inline" color="onBrand" /> : null}
      </View>
    );
  }
  return (
    <View style={createRadioStyle(theme, isSelected)}>
      {isSelected ? <View style={createRadioDotStyle(theme)} /> : null}
    </View>
  );
}
