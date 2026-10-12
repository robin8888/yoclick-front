import { useCenterSettings } from './useCenterSettings';

/** La zona horaria del centro; `null` mientras se cargan sus ajustes. */
export function useCenterTimeZone(): string | null {
  return useCenterSettings().data?.timezone ?? null;
}

/** La del móvil: solo para proponer «hoy» antes de conocer la del centro. */
export function getDeviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
