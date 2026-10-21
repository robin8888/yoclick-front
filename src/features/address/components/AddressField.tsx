import { AddressAutocomplete } from '@/ui/organisms/AddressAutocomplete';

import { useAddressPicker } from '../hooks/useAddressPicker';
import type { AddressCountryCode, AddressKind } from '../model/address-kind';
import type { AddressValue } from '../model/address-value';

export interface AddressFieldProps {
  label: string;
  kind: AddressKind;
  /** Sin país se ofrecen direcciones de los dos. */
  countryCode?: AddressCountryCode | undefined;
  value: AddressValue;
  onChange: (nextAddress: AddressValue) => void;
  helperText?: string | undefined;
  errorMessage?: string | undefined;
}

/**
 * Un campo de dirección o ciudad con sugerencias. El texto es siempre libre: elegir una sugerencia
 * añade las coordenadas, pero no es obligatorio ni cambia lo que se puede escribir.
 */
export function AddressField({
  label,
  kind,
  countryCode,
  value,
  onChange,
  helperText,
  errorMessage,
}: Readonly<AddressFieldProps>): React.JSX.Element {
  const picker = useAddressPicker({ kind, countryCode, value, onChange });

  return (
    <AddressAutocomplete
      label={label}
      value={value.text}
      onChangeText={picker.handleTextChange}
      options={picker.options}
      helperText={helperText}
      errorMessage={errorMessage}
      autoCapitalize="words"
      autoComplete={kind === 'address' ? 'street-address' : 'off'}
      searchingMessage={picker.searchingMessage}
      statusMessage={picker.statusMessage}
      attributionText={picker.attributionText}
      onOptionSelect={picker.handleOptionSelect}
    />
  );
}
