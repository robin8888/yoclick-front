import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { buildTypedAddress } from '../model/address-value';
import { AddressField, type AddressFieldProps } from './AddressField';

type FormCityFieldProps<TFieldValues extends FieldValues> = Omit<
  AddressFieldProps,
  'value' | 'onChange' | 'errorMessage' | 'kind'
> & {
  control: Control<TFieldValues>;
  /** El campo del formulario guarda solo el nombre de la ciudad, como texto. */
  name: Path<TFieldValues>;
};

/** Ciudad con sugerencias, enlazada a un campo de texto de react-hook-form. */
export function FormCityField<TFieldValues extends FieldValues>({
  control,
  name,
  ...fieldProps
}: Readonly<FormCityFieldProps<TFieldValues>>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <AddressField
          {...fieldProps}
          kind="city"
          value={buildTypedAddress(typeof field.value === 'string' ? field.value : '')}
          onChange={(nextCity) => {
            field.onChange(nextCity.text);
          }}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}
