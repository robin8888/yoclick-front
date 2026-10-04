import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Input, type InputProps } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';

import { createFormFieldStyle } from './FormField.styles';
import type { FormFieldProps } from './FormField.types';

export function FormField(props: Readonly<FormFieldProps>): React.JSX.Element {
  const { label, helperText, errorMessage, ...inputProps } = props;
  const theme = useTheme();
  const isInvalid = errorMessage !== undefined;

  return (
    <View style={createFormFieldStyle(theme)}>
      <Text variant="bodyStrong">{label}</Text>
      <Input
        {...(inputProps as InputProps)}
        accessibilityLabel={label}
        isInvalid={isInvalid}
        {...(isInvalid ? { invalidAccessibilityLabel: errorMessage } : {})}
      />
      {isInvalid ? (
        <Text variant="caption" color="danger" role="alert">
          {errorMessage}
        </Text>
      ) : null}
      {helperText !== undefined && !isInvalid ? (
        <Text variant="caption" color="ink2">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
