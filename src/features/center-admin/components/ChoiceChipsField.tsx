import { View } from 'react-native';

import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';

export interface ChoiceOption {
  value: string;
  label: string;
}

interface ChoiceChipsFieldProps {
  title: string;
  options: readonly ChoiceOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  helperText?: string | undefined;
  errorMessage?: string | undefined;
  /** Qué decir cuando no hay opciones («Crea antes un servicio»). */
  emptyText?: string | undefined;
}

const FIELD_STYLE = { gap: 8 } as const;
const CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

/** La ayuda y, si lo hay, el error del campo (anunciado al lector de pantalla). */
export function FieldCaptions({
  helperText,
  errorMessage,
}: Readonly<Pick<ChoiceChipsFieldProps, 'helperText' | 'errorMessage'>>): React.JSX.Element {
  return (
    <>
      {helperText === undefined ? null : (
        <Text variant="caption" color="ink2">
          {helperText}
        </Text>
      )}
      {errorMessage === undefined ? null : (
        <Text variant="caption" color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
    </>
  );
}

/** Una opción entre varias, como fichas con estado «marcada» para el lector de pantalla. */
export function ChoiceChipsField({
  title,
  options,
  selectedValue,
  onValueChange,
  helperText,
  errorMessage,
  emptyText,
}: Readonly<ChoiceChipsFieldProps>): React.JSX.Element {
  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{title}</Text>
      {options.length === 0 && emptyText !== undefined ? (
        <Text color="ink2">{emptyText}</Text>
      ) : null}
      <View style={CHIPS_STYLE}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selectionRole="radio"
            isSelected={option.value === selectedValue}
            onPress={() => {
              onValueChange(option.value);
            }}
          />
        ))}
      </View>
      <FieldCaptions helperText={helperText} errorMessage={errorMessage} />
    </View>
  );
}
