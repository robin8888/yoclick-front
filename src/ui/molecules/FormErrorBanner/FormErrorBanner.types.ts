export type FormBannerTone = 'error' | 'success';

export interface FormErrorBannerProps {
  /** Mensaje ya traducido (p. ej. con `getApiErrorMessage`). */
  message: string;
  /** `error` se anuncia como alerta; `success` solo informa (confirmaciones). */
  tone?: FormBannerTone;
}
