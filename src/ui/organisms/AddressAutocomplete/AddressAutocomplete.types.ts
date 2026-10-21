import type { FormFieldProps } from '@/ui/molecules/FormField';

/** Una sugerencia ya lista para mostrar; `id` distingue filas con el mismo texto. */
export interface AddressOption {
  id: string;
  title: string;
}

type AddressFieldInputProps = Pick<
  FormFieldProps,
  'label' | 'helperText' | 'errorMessage' | 'autoComplete' | 'autoCapitalize'
>;

export interface AddressAutocompleteProps extends AddressFieldInputProps {
  value: string;
  onChangeText: (nextText: string) => void;
  options: readonly AddressOption[];
  /** Texto accesible mientras se busca («Buscando direcciones…»); si falta, no se muestra el aviso. */
  searchingMessage?: string | undefined;
  /** «Sin resultados» o «no se puede sugerir ahora»: se dice con palabras, no con un hueco vacío. */
  statusMessage?: string | undefined;
  /** Crédito de la fuente de los datos; se muestra debajo de la lista mientras hay sugerencias. */
  attributionText?: string | undefined;
  onOptionSelect: (optionId: string) => void;
}
