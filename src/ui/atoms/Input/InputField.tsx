import { TextInput } from 'react-native';

import { useTheme } from '@/shared/theme';

import { useTextStyle } from '../Text';
import { createInputFieldStyle } from './Input.styles';
import type { InputProps } from './Input.types';
import { pickNativeTextInputProps } from './pick-native-text-input-props';

type SharedInputProps = Omit<
  InputProps,
  'isSecure' | 'showSecureTextLabel' | 'hideSecureTextLabel'
>;

interface InputFieldProps extends SharedInputProps {
  isSecureTextHidden: boolean;
  onFocusChange: (isFocused: boolean) => void;
}

/** El `TextInput` nativo con los tokens de texto; el borde y los iconos los pone `Input`. */
export function InputField(props: Readonly<InputFieldProps>): React.JSX.Element {
  const { isDisabled = false, isSecureTextHidden, onFocusChange, inputRef } = props;
  const theme = useTheme();
  const textStyle = useTextStyle('body', isDisabled ? 'ink2' : 'ink');

  return (
    <TextInput
      {...pickNativeTextInputProps(props)}
      ref={inputRef}
      placeholderTextColor={theme.colors.ink2}
      editable={!isDisabled}
      secureTextEntry={isSecureTextHidden}
      onFocus={() => {
        onFocusChange(true);
        props.onFocus?.();
      }}
      onBlur={() => {
        onFocusChange(false);
        props.onBlur?.();
      }}
      allowFontScaling
      style={createInputFieldStyle(textStyle)}
    />
  );
}
