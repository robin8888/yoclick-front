import { formatNumericDate } from '@/shared/lib/format/numeric-date';

export const PRIVACY_RIGHT_KINDS = ['access', 'rectification', 'erasure', 'objection'] as const;
export type PrivacyRightKind = (typeof PRIVACY_RIGHT_KINDS)[number];

export const DELETE_ACCOUNT_CONFIRMATION_WORD = 'ELIMINAR';
const ISO_DATE_LENGTH = 10;

/** «25/10/2026» a partir de un instante ISO. */
export function formatRequestDate(isoInstant: string): string {
  return formatNumericDate(isoInstant.slice(0, ISO_DATE_LENGTH));
}

/** Para borrar la cuenta hay que escribir la palabra tal cual, sin importar mayúsculas ni espacios de más. */
export function isDeleteConfirmationWritten(typedText: string): boolean {
  return typedText.trim().toUpperCase() === DELETE_ACCOUNT_CONFIRMATION_WORD;
}
