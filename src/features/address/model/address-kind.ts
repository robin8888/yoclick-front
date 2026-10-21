/** Qué se busca al escribir: una dirección con calle o solo el nombre de una ciudad. */
export type AddressKind = 'address' | 'city';

/** Los países donde opera Yoclick; el mismo conjunto que acepta la API. */
export type AddressCountryCode = 'ES' | 'CO';

const COLOMBIA_TIME_ZONE = 'America/Bogota';

/** El país se deduce de la zona horaria: no hay un campo «país» y España es el caso por defecto. */
export function getCountryCodeForTimeZone(timeZone: string): AddressCountryCode {
  return timeZone === COLOMBIA_TIME_ZONE ? 'CO' : 'ES';
}

/** La zona del móvil: para quien escribe una dirección antes de que haya un centro con zona propia. */
export function getDeviceCountryCode(): AddressCountryCode {
  return getCountryCodeForTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
}
