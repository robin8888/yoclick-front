import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { ColorWheelIcon } from './ColorWheelIcon';
import {
  COLOR_SELECTOR_TEXT_STYLE,
  COLOR_WHEEL_SIZE,
  createColorSelectorStyle,
} from './ColorSelectorToggle.styles';

interface ColorSelectorToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

/** Fila que abre y cierra el selector de color: círculo cromático, explicación y flecha. */
export function ColorSelectorToggle({
  isOpen,
  onToggle,
}: Readonly<ColorSelectorToggleProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('branding.color.customLabel')}
      accessibilityState={{ expanded: isOpen }}
      onPress={onToggle}
      style={createColorSelectorStyle(theme, isOpen)}
    >
      <ColorWheelIcon size={COLOR_WHEEL_SIZE} />
      <View style={COLOR_SELECTOR_TEXT_STYLE}>
        <Text variant="bodyStrong">{i18n.t('branding.color.showCustomAction')}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('branding.color.selectorHelper')}
        </Text>
      </View>
      <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size="navigation" color="ink2" />
    </Pressable>
  );
}
