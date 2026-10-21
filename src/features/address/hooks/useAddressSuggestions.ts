import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { geocodeSearchSuggestions } from '@/shared/api/generated/endpoints/geocode/geocode';
import type { AddressSuggestionsResponseDtoSuggestionsItem } from '@/shared/api/generated/model';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

import type { AddressCountryCode, AddressKind } from '../model/address-kind';

/** Una petición por cada tecla gastaría la cuota del proveedor gratuito: se espera a que pare de escribir. */
export const SUGGESTION_DEBOUNCE_MS = 400;
/** Con menos letras la lista sería media ciudad. */
export const MIN_SUGGESTION_QUERY_LENGTH = 4;
const SUGGESTION_STALE_TIME_MS = 300_000;

interface AddressSuggestionsRequest {
  text: string;
  kind: AddressKind;
  countryCode?: AddressCountryCode | undefined;
  /** A falso no se busca: la lista se cierra al elegir una sugerencia. */
  isEnabled: boolean;
}

export interface AddressSuggestionsState {
  suggestions: readonly AddressSuggestionsResponseDtoSuggestionsItem[];
  isSearching: boolean;
  /** Ya se buscó, sin fallo, y no hay nada que ofrecer. */
  hasNoResults: boolean;
  error: unknown;
}

/** Las direcciones que propone el servidor para lo escrito. Las coordenadas viajan con cada una. */
export function useAddressSuggestions({
  text,
  kind,
  countryCode,
  isEnabled,
}: AddressSuggestionsRequest): AddressSuggestionsState {
  const searchText = useDebouncedValue(text.trim(), SUGGESTION_DEBOUNCE_MS);
  const isSearchable = isEnabled && searchText.length >= MIN_SUGGESTION_QUERY_LENGTH;

  const query = useQuery({
    queryKey: ['address-suggestions', kind, countryCode ?? null, searchText],
    queryFn: ({ signal }) =>
      geocodeSearchSuggestions(
        { query: searchText, kind, ...(countryCode === undefined ? {} : { countryCode }) },
        { signal },
      ),
    enabled: isSearchable,
    staleTime: SUGGESTION_STALE_TIME_MS,
    retry: false,
    placeholderData: keepPreviousData,
  });

  if (!isSearchable)
    return { suggestions: [], isSearching: false, hasNoResults: false, error: null };

  const suggestions = query.data?.suggestions ?? [];
  const isSettled = query.isSuccess && !query.isPlaceholderData;
  return {
    suggestions,
    isSearching: query.isFetching,
    hasNoResults: isSettled && suggestions.length === 0,
    error: query.error,
  };
}
