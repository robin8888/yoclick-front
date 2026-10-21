import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';

import { createAutocompleteStyle } from './AddressAutocomplete.styles';
import type { AddressAutocompleteProps } from './AddressAutocomplete.types';
import { AddressOptionList } from './AddressOptionList';

/**
 * Un campo de dirección con sugerencias debajo mientras se escribe. No sabe de dónde salen:
 * recibe las opciones y avisa de la elegida. El texto sigue siendo libre: se puede ignorar la lista.
 */
export function AddressAutocomplete({
  value,
  onChangeText,
  options,
  searchingMessage,
  statusMessage,
  attributionText,
  onOptionSelect,
  ...fieldProps
}: Readonly<AddressAutocompleteProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createAutocompleteStyle(theme)}>
      <FormField {...fieldProps} value={value} onChangeText={onChangeText} />
      {searchingMessage === undefined ? null : (
        <Text variant="caption" color="ink2" role="status">
          {searchingMessage}
        </Text>
      )}
      {options.length === 0 ? null : (
        <AddressOptionList options={options} onOptionSelect={onOptionSelect} />
      )}
      {options.length === 0 || attributionText === undefined ? null : (
        <Text variant="caption" color="ink2">
          {attributionText}
        </Text>
      )}
      {statusMessage === undefined ? null : (
        <Text variant="caption" color="ink2" role="status">
          {statusMessage}
        </Text>
      )}
    </View>
  );
}
