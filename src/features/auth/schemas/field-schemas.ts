import { z } from 'zod';

import { i18n } from '@/shared/i18n';

// Mismos límites que el contrato (docs/api/openapi.yaml); los mensajes salen de es-ES.json.
export const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 256;
const MAX_EMAIL_LENGTH = 254;
const MIN_FULL_NAME_LENGTH = 2;
const MAX_FULL_NAME_LENGTH = 100;
const MIN_RECOVERY_CODE_LENGTH = 8;
const MAX_RECOVERY_CODE_LENGTH = 24;
const SIX_DIGIT_CODE_PATTERN = /^\d{6}$/;

export const emailFieldSchema = z
  .string()
  .trim()
  .min(1, { error: () => i18n.t('validation.emailRequired') })
  .max(MAX_EMAIL_LENGTH, { error: () => i18n.t('validation.emailInvalid') })
  .pipe(z.email({ error: () => i18n.t('validation.emailInvalid') }));

/** En el login solo se exige que haya algo: las reglas de longitud son del alta. */
export const existingPasswordFieldSchema = z
  .string()
  .min(1, { error: () => i18n.t('validation.passwordRequired') })
  .max(MAX_PASSWORD_LENGTH);

export const newPasswordFieldSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, { error: () => i18n.t('validation.passwordTooShort') })
  .max(MAX_PASSWORD_LENGTH, { error: () => i18n.t('validation.passwordTooShort') });

export const fullNameFieldSchema = z
  .string()
  .trim()
  .min(MIN_FULL_NAME_LENGTH, { error: () => i18n.t('validation.fullNameTooShort') })
  .max(MAX_FULL_NAME_LENGTH, { error: () => i18n.t('validation.fullNameTooShort') });

export const sixDigitCodeFieldSchema = z
  .string()
  .trim()
  .regex(SIX_DIGIT_CODE_PATTERN, { error: () => i18n.t('validation.verificationCodeInvalid') });

export const recoveryCodeFieldSchema = z
  .string()
  .trim()
  .min(MIN_RECOVERY_CODE_LENGTH, { error: () => i18n.t('validation.recoveryCodeRequired') })
  .max(MAX_RECOVERY_CODE_LENGTH, { error: () => i18n.t('validation.recoveryCodeRequired') });

export function buildRequiredConsentSchema(
  messageKey: 'privacyConsentRequired' | 'termsConsentRequired',
): z.ZodBoolean {
  return z.boolean().refine((isAccepted) => isAccepted, {
    error: () => i18n.t(`validation.${messageKey}`),
  });
}
