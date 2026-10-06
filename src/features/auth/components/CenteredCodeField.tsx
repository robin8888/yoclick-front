import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { TextInput, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  CENTERED_CODE_FIELD_STYLE,
  createCenteredCodeInputStyle,
} from './CenteredCodeField.styles';

interface CenteredCodeFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  /** Etiqueta accesible: el campo no dibuja etiqueta, lo explica el subtítulo de la pantalla. */
  label: string;
  placeholder: string;
  onSubmitEditing: () => void;
}

/** Un código que no son seis dígitos (el de recuperación): campo ancho, letras grandes y centradas. */
export function CenteredCodeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  onSubmitEditing,
}: Readonly<CenteredCodeFieldProps<TFieldValues>>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={CENTERED_CODE_FIELD_STYLE}>
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
            style={createCenteredCodeInputStyle(theme, fieldState.error !== undefined)}
          />
          {fieldState.error === undefined ? null : (
            <Text variant="caption" color="danger" align="center" role="alert">
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
