import { z } from 'zod';

import type { AddressSuggestionsResponseDtoSuggestionsItem } from '@/shared/api/generated/model';

import type { AddressKind } from './address-kind';

/** Lo escrito y, si salió de una sugerencia, el punto del mapa que le corresponde. */
export const addressValueSchema = z.object({
  text: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});
export type AddressValue = z.infer<typeof addressValueSchema>;

export const EMPTY_ADDRESS: AddressValue = { text: '', latitude: null, longitude: null };

export function buildTypedAddress(text: string): AddressValue {
  return { text, latitude: null, longitude: null };
}

/** Sin mayúsculas ni acentos: «Bogotá» y «bogota» son la misma calle para quien escribe. */
function normalizeForComparison(text: string): string {
  return text
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Las coordenadas son de la calle elegida: se conservan mientras el texto siga nombrándola, así se
 * puede añadir el número, el piso o la puerta. Cambiar de calle las descarta: apuntarían a otro sitio.
 */
export function shouldKeepCoordinates(pickedStreet: string | null, text: string): boolean {
  if (pickedStreet === null) return false;
  return normalizeForComparison(text).includes(normalizeForComparison(pickedStreet));
}

export interface AddressTextChange {
  current: AddressValue;
  pickedStreet: string | null;
  nextText: string;
}

/** Escribir a mano nunca bloquea: solo decide si las coordenadas aún valen. */
export function applyTypedText({
  current,
  pickedStreet,
  nextText,
}: AddressTextChange): AddressValue {
  const isStillPickedStreet = shouldKeepCoordinates(pickedStreet, nextText);
  return {
    text: nextText,
    latitude: isStillPickedStreet ? current.latitude : null,
    longitude: isStillPickedStreet ? current.longitude : null,
  };
}

/** Una ciudad se guarda por su nombre; una dirección, con la línea completa que se vio en la lista. */
export function buildAddressFromSuggestion(
  suggestion: AddressSuggestionsResponseDtoSuggestionsItem,
  kind: AddressKind,
): AddressValue {
  const text = kind === 'city' ? (suggestion.city ?? suggestion.label) : suggestion.label;
  return { text, latitude: suggestion.latitude, longitude: suggestion.longitude };
}
