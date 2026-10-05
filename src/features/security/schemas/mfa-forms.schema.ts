import { z } from 'zod';

import { i18n } from '@/shared/i18n';

const SIX_DIGIT_CODE_PATTERN = /^\d{6}$/;
const MAX_PASSWORD_LENGTH = 256;

export const mfaPasswordFormSchema = z.object({
  password: z
    .string()
    .min(1, { error: () => i18n.t('validation.passwordRequired') })
    .max(MAX_PASSWORD_LENGTH),
});
export type MfaPasswordFormValues = z.infer<typeof mfaPasswordFormSchema>;

export const mfaCodeFormSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(SIX_DIGIT_CODE_PATTERN, { error: () => i18n.t('validation.verificationCodeInvalid') }),
});
export type MfaCodeFormValues = z.infer<typeof mfaCodeFormSchema>;
