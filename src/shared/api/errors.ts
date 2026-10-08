import esES from '@/shared/i18n/es-ES.json';

import { isApiError, isNetworkError, UNKNOWN_ERROR_CODE, type FieldError } from './api-error';

// Códigos estables del backend: `ERROR_CATALOG` de yoclick-api (src/shared/errors/error-catalog.es.ts)
// y los de negocio de docs/spec/03-api.md. El test de errors.test.ts exige un mensaje para cada uno:
// al añadir un código nuevo, hay que añadirlo aquí y en es-ES.json.
export const KNOWN_API_ERROR_CODES = [
  'BAD_REQUEST',
  'VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'METHOD_NOT_ALLOWED',
  'CONFLICT',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
  'PRECONDITION_FAILED',
  'PRECONDITION_REQUIRED',
  'IDEMPOTENCY_KEY_REQUIRED',
  'IDEMPOTENCY_KEY_REUSED',
  'IDEMPOTENCY_IN_PROGRESS',
  'RATE_LIMITED',
  'CONSENT_REQUIRED',
  'EMAIL_DOMAIN_NOT_ALLOWED',
  'PASSWORD_BREACHED',
  'VERIFICATION_CODE_INVALID',
  'REAUTHENTICATION_FAILED',
  'ACCOUNT_OWNS_CENTER',
  'INVALID_CREDENTIALS',
  'EMAIL_NOT_VERIFIED',
  'ACCOUNT_LOCKED',
  'SESSION_INVALID',
  'INTERNAL_ERROR',
  'SLOT_UNAVAILABLE',
  'SESSION_FULL',
  'ALREADY_BOOKED',
  'OUTSIDE_BOOKING_WINDOW',
  'CANCEL_OUT_OF_POLICY',
  'NO_BALANCE',
  'PAYMENT_REQUIRED',
  'PAYMENT_FAILED',
  'CLIENT_LIMIT_REACHED',
  'JOIN_CODE_INVALID',
  'INVITATION_INVALID',
  'LOGO_INVALID',
  'LOGO_TOO_LARGE',
  'VIDEO_NOT_INCLUDED',
  'VIDEO_TOO_LARGE',
  'VIDEO_QUOTA_EXCEEDED',
  'VIDEO_NOT_REVIEWABLE',
  'TECHNIQUE_VIDEO_LIMIT_REACHED',
  'PROFILE_CONSENT_REQUIRED',
  'PROFILE_EMPTY',
  'PROFILE_NOT_REVIEWABLE',
  'CERTIFICATION_LIMIT_REACHED',
  'REVIEW_NOT_ALLOWED',
  'REVIEW_NOT_MODERABLE',
  'PRIVACY_REQUEST_ALREADY_OPEN',
  'PRIVACY_REQUEST_CLOSED',
  'MEMBERSHIP_BLOCKED',
  'MFA_REQUIRED',
  'MFA_CODE_INVALID',
  'MFA_ALREADY_ENABLED',
  'MFA_NOT_ENABLED',
  'MFA_REQUIRED_FOR_ROLE',
  'ALREADY_MEMBER',
  'CENTER_LIMIT_REACHED',
  'TEAM_CHANGE_NOT_ALLOWED',
  'BOOKING_NOT_CANCELLABLE',
  'BOOKING_NOT_RESCHEDULABLE',
  'RESCHEDULE_TOO_LATE',
  'CHECKIN_CODE_INVALID',
  'CHECKIN_NO_BOOKING',
  'BOOKING_NOT_STARTABLE',
  'SESSION_ALREADY_OPEN',
  'SESSION_NOT_STARTED',
  'CHECKIN_TOKEN_EXPIRED',
  'CHECKIN_WRONG_SESSION',
  'APP_VERSION_UNSUPPORTED',
] as const;

export type KnownApiErrorCode = (typeof KNOWN_API_ERROR_CODES)[number];

type ErrorMessageCatalog = Readonly<Record<string, string>>;

const errorMessages: ErrorMessageCatalog = esES.errors;
const fieldErrorMessages: ErrorMessageCatalog = esES.fieldErrors;
const NETWORK_FAILURE_CODES = { offline: 'NETWORK_OFFLINE', timeout: 'NETWORK_TIMEOUT' } as const;
const FALLBACK_FIELD_ERROR_CODE = 'invalid';

function resolveErrorCode(error: unknown): string {
  if (isNetworkError(error)) return NETWORK_FAILURE_CODES[error.reason];
  if (isApiError(error)) return error.code;
  return UNKNOWN_ERROR_CODE;
}

/**
 * Mensaje es-ES para cualquier fallo. Se traduce por `code`, nunca por `title` ni `detail`
 * del servidor, así que un código nuevo que la app aún no conozca cae en un mensaje genérico
 * sin culpar a quien lo lee.
 */
export function getApiErrorMessage(error: unknown): string {
  const resolvedCode = resolveErrorCode(error);
  return errorMessages[resolvedCode] ?? errorMessages[UNKNOWN_ERROR_CODE] ?? '';
}

export function getFieldErrorMessage(fieldError: FieldError): string {
  return fieldErrorMessages[fieldError.code] ?? fieldErrorMessages[FALLBACK_FIELD_ERROR_CODE] ?? '';
}
