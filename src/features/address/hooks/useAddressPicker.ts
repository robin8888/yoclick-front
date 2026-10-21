import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import type { AddressSuggestionsResponseDtoSuggestionsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import type { AddressOption } from '@/ui/organisms/AddressAutocomplete';

import type { AddressCountryCode, AddressKind } from '../model/address-kind';
import {
  applyTypedText,
  buildAddressFromSuggestion,
  type AddressValue,
} from '../model/address-value';
import { useAddressSuggestions } from './useAddressSuggestions';

interface AddressPickerRequest {
  kind: AddressKind;
  countryCode?: AddressCountryCode | undefined;
  value: AddressValue;
  onChange: (nextAddress: AddressValue) => void;
}

export interface AddressPicker {
  options: AddressOption[];
  searchingMessage: string | undefined;
  statusMessage: string | undefined;
  attributionText: string;
  handleTextChange: (nextText: string) => void;
  handleOptionSelect: (optionId: string) => void;
}

function buildOptionId(
  suggestion: AddressSuggestionsResponseDtoSuggestionsItem,
  index: number,
): string {
  return `${String(index)}:${String(suggestion.latitude)},${String(suggestion.longitude)}`;
}

function buildOptions(
  suggestions: readonly AddressSuggestionsResponseDtoSuggestionsItem[],
): AddressOption[] {
  return suggestions.map((suggestion, index) => ({
    id: buildOptionId(suggestion, index),
    title: suggestion.label,
  }));
}

function buildStatusMessage(hasNoResults: boolean, error: unknown): string | undefined {
  if (error !== null && error !== undefined) return getApiErrorMessage(error);
  return hasNoResults ? i18n.t('address.noResults') : undefined;
}

/** Une lo escrito, las sugerencias del servidor y la elegida: el campo solo pinta lo que devuelve. */
export function useAddressPicker({
  kind,
  countryCode,
  value,
  onChange,
}: AddressPickerRequest): AddressPicker {
  // Tras elegir, la lista se cierra hasta que se vuelva a escribir.
  const [isListOpen, setIsListOpen] = useState(false);
  const [pickedStreet, setPickedStreet] = useState<string | null>(null);
  const { suggestions, isSearching, hasNoResults, error } = useAddressSuggestions({
    text: value.text,
    kind,
    countryCode,
    isEnabled: isListOpen,
  });

  function handleTextChange(nextText: string): void {
    setIsListOpen(true);
    onChange(applyTypedText({ current: value, pickedStreet, nextText }));
  }

  function handleOptionSelect(optionId: string): void {
    const picked = suggestions.find(
      (suggestion, index) => buildOptionId(suggestion, index) === optionId,
    );
    if (picked === undefined) return;
    setIsListOpen(false);
    setPickedStreet(picked.street);
    onChange(buildAddressFromSuggestion(picked, kind));
  }

  return {
    options: isListOpen ? buildOptions(suggestions) : [],
    searchingMessage: isListOpen && isSearching ? i18n.t('address.searching') : undefined,
    statusMessage: isListOpen ? buildStatusMessage(hasNoResults, error) : undefined,
    // Las sugerencias vienen de OpenStreetMap (ODbL): la licencia pide citarlo donde se muestran.
    attributionText: i18n.t('address.attribution'),
    handleTextChange,
    handleOptionSelect,
  };
}
