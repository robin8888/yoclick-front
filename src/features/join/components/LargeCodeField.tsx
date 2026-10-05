import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { TextInput, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createLargeCodeInputStyle, LARGE_CODE_FIELD_STYLE } from './LargeCodeField.styles';

interface CodeFieldMessageProps {
  errorMessage: string | undefined;
  helperText: string | undefined;
}

/** Bajo el campo: el error si lo hay y, si no, la ayuda. */
function CodeFieldMessage({
  errorMessage,
  helperText,
}: Readonly<CodeFieldMessageProps>): React.JSX.Element | null {
  if (errorMessage !== undefined) {
    return (
      <Text variant="caption" color="danger" align="center" role="alert">
        {errorMessage}
      </Text>
    );
  }
  if (helperText === undefined) return null;
  return (
    <Text variant="caption" color="ink2" align="center">
      {helperText}
    </Text>
  );
}

interface LargeCodeFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  /** Etiqueta accesible (el campo no muestra etiqueta visible: lo explica el subtítulo). */
  label: string;
  placeholder: string;
  maxLength: number;
  /** Ayuda bajo el campo; se oculta cuando hay un error. */
  helperText?: string;
  onSubmitEditing: () => void;
}

/** Código de un centro o de una invitación: campo ancho con letras grandes, centradas y en mayúsculas. */
export function LargeCodeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  maxLength,
  helperText,
  onSubmitEditing,
}: Readonly<LargeCodeFieldProps<TFieldValues>>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={LARGE_CODE_FIELD_STYLE}>
          <TextInput
            value={typeof field.value === 'string' ? field.value : ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={onSubmitEditing}
            accessibilityLabel={label}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.ink2}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            maxLength={maxLength}
            style={createLargeCodeInputStyle(theme, fieldState.error !== undefined)}
          />
          <CodeFieldMessage errorMessage={fieldState.error?.message} helperText={helperText} />
        </View>
      )}
    />
  );
}
