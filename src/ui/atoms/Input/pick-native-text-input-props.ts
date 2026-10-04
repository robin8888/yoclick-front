import type { TextInputProps } from 'react-native';

import type { InputProps } from './Input.types';

type PassThroughProps = Pick<
  InputProps,
  | 'value'
  | 'onChangeText'
  | 'accessibilityLabel'
  | 'placeholder'
  | 'keyboardType'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'textContentType'
  | 'returnKeyType'
  | 'maxLength'
  | 'onSubmitEditing'
>;

/** Solo pasa al `TextInput` lo que es suyo: `isInvalid`, iconos y demás son del átomo. */
export function pickNativeTextInputProps(props: PassThroughProps): TextInputProps {
  return {
    value: props.value,
    onChangeText: props.onChangeText,
    accessibilityLabel: props.accessibilityLabel,
    placeholder: props.placeholder,
    keyboardType: props.keyboardType,
    autoCapitalize: props.autoCapitalize,
    autoComplete: props.autoComplete,
    textContentType: props.textContentType,
    returnKeyType: props.returnKeyType,
    maxLength: props.maxLength,
    onSubmitEditing: props.onSubmitEditing,
  };
}
