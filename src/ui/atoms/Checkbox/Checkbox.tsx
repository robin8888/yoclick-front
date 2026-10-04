import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Icon } from '../Icon';
import { createCheckboxBoxStyle, createCheckboxHitAreaStyle } from './Checkbox.styles';
import type { CheckboxProps } from './Checkbox.types';

export function Checkbox({
  isChecked,
  onCheckedChange,
  accessibilityLabel,
  isInvalid = false,
  isDisabled = false,
}: Readonly<CheckboxProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: isChecked, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => {
        onCheckedChange(!isChecked);
      }}
      style={createCheckboxHitAreaStyle()}
    >
      <View style={createCheckboxBoxStyle({ theme, isChecked, isInvalid, isDisabled })}>
        {isChecked ? <Icon name="check" color="onBrand" /> : null}
      </View>
    </Pressable>
  );
}
