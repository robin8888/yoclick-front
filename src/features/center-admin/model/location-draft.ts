import { EMPTY_ADDRESS, type AddressValue } from '@/features/address';
import type { MapPoint } from '@/shared/lib/location-link';
import type { SessionLocationFacts } from '@/shared/lib/session-location';

/** Lo que se rellena en el formulario: «es fuera del centro», el nombre del sitio y su dirección. */
export interface LocationDraft {
  isOutside: boolean;
  name: string;
  address: AddressValue;
  /** El punto fijado a mano (GPS o enlace): manda sobre el de la dirección. */
  pin: MapPoint | null;
}

export const EMPTY_LOCATION_DRAFT: LocationDraft = {
  isOutside: false,
  name: '',
  address: EMPTY_ADDRESS,
  pin: null,
};

/** El formulario de una ubicación que ya existe (o vacío si la clase es en el centro). */
export function buildLocationDraft(location: SessionLocationFacts | null): LocationDraft {
  if (location === null) return EMPTY_LOCATION_DRAFT;
  return {
    isOutside: true,
    name: location.name,
    address: {
      text: location.address ?? '',
      latitude: location.latitude,
      longitude: location.longitude,
    },
    pin: null,
  };
}

/** Fuera del centro, el sitio necesita un nombre para poder avisar de él. */
export function isLocationNameMissing(draft: LocationDraft): boolean {
  return draft.isOutside && draft.name.trim() === '';
}

/** Lo que se envía al servidor: `null` si la clase es en el centro o aún no tiene nombre. */
export function toLocationRequest(draft: LocationDraft): SessionLocationFacts | null {
  const name = draft.name.trim();
  if (!draft.isOutside || name === '') return null;
  const addressText = draft.address.text.trim();
  const { latitude, longitude } = draft.pin ?? draft.address;
  const hasPoint = latitude !== null && longitude !== null;
  return {
    name,
    address: addressText === '' ? null : addressText,
    latitude: hasPoint ? latitude : null,
    longitude: hasPoint ? longitude : null,
  };
}

/** Si dos ubicaciones son la misma, para enviar solo lo que cambia. */
export function isSameLocationRequest(
  first: SessionLocationFacts | null,
  second: SessionLocationFacts | null,
): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}
