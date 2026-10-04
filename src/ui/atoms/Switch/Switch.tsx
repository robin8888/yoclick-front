import { Switch as NativeSwitch, View, type ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, useTheme } from '@/shared/theme';

import type { SwitchProps } from './Switch.types';

// El interruptor nativo mide ~31 px de alto: la caja de 44 px garantiza el área táctil mínima.
const touchAreaStyle: ViewStyle = {
  minHeight: MIN_TOUCH_TARGET_SIZE,
  minWidth: MIN_TOUCH_TARGET_SIZE,
  justifyContent: 'center',
};

export function Switch({
  isOn,
  onToggle,
  accessibilityLabel,
  isDisabled = false,
}: Readonly<SwitchProps>): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={touchAreaStyle}>
      <NativeSwitch
        value={isOn}
        onValueChange={onToggle}
        disabled={isDisabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ checked: isOn, disabled: isDisabled }}
        // La pista apagada usa lineStrong (3:1 sobre el fondo) y la encendida brand, con el
        // pulgar en onBrand: la posición del pulgar también comunica el estado, no solo el color.
        trackColor={{ false: colors.lineStrong, true: colors.brand }}
        thumbColor={isOn ? colors.onBrand : colors.surface}
        ios_backgroundColor={colors.lineStrong}
      />
    </View>
  );
}
