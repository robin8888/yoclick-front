import { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { createInputContainerStyle } from './Input.styles';
import type { InputProps } from './Input.types';
import { InputField } from './InputField';

export function Input(props: Readonly<InputProps>): React.JSX.Element {
  const { isInvalid = false, isDisabled = false, leadingIconName } = props;
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(false);

  return (
    <View style={createInputContainerStyle({ theme, isFocused, isInvalid, isDisabled })}>
      {leadingIconName === undefined ? null : <Icon name={leadingIconName} color="ink2" />}
      <InputField
        {...props}
        isSecureTextHidden={props.isSecure === true && !isSecureTextVisible}
        onFocusChange={setIsFocused}
      />
      {isInvalid ? (
        <Icon
          name="alertTriangle"
          color="danger"
          accessibilityLabel={props.invalidAccessibilityLabel}
        />
      ) : null}
      {props.isSecure === true ? (
        <IconButton
          iconName={isSecureTextVisible ? 'eyeOff' : 'eye'}
          accessibilityLabel={
            isSecureTextVisible ? props.hideSecureTextLabel : props.showSecureTextLabel
          }
          onPress={() => {
            setIsSecureTextVisible((isVisible) => !isVisible);
          }}
        />
      ) : null}
    </View>
  );
}
