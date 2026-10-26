import { ApiError } from '@/shared/api/api-error';
import { getApiErrorMessage } from '@/shared/api/errors';

/** El centro vende bonos y la persona no tiene ninguno en vigor para ese servicio. */
export const PASS_NEEDED_ERROR_CODE = 'PASS_NEEDED_TO_BOOK';

export function isPassNeededError(error: unknown): boolean {
  return error instanceof ApiError && error.code === PASS_NEEDED_ERROR_CODE;
}

export interface BookingFailure {
  /** El motivo para enseñar en el aviso; `null` si no hay fallo o si es el del bono. */
  createErrorMessage: string | null;
  /** Falta un bono: se pide adquirirlo en vez de enseñar un error. */
  isPassNeeded: boolean;
}

/** Cómo se cuenta un fallo al reservar: el del bono tiene su propia hoja, el resto un aviso. */
export function describeBookingFailure(error: unknown): BookingFailure {
  if (error === null || error === undefined)
    return { createErrorMessage: null, isPassNeeded: false };
  if (isPassNeededError(error)) return { createErrorMessage: null, isPassNeeded: true };
  return { createErrorMessage: getApiErrorMessage(error), isPassNeeded: false };
}
