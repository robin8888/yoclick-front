import { z } from 'zod';

import { i18n } from '@/shared/i18n';

import { EXPERIENCE_DURATIONS } from '../model/starting-level';
import {
  buildRequiredConsentSchema,
  emailFieldSchema,
  existingPasswordFieldSchema,
  fullNameFieldSchema,
  newPasswordFieldSchema,
  recoveryCodeFieldSchema,
  sixDigitCodeFieldSchema,
} from './field-schemas';

export const loginFormSchema = z.object({
  email: emailFieldSchema,
  password: existingPasswordFieldSchema,
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerAccountFormSchema = z.object({
  fullName: fullNameFieldSchema,
  email: emailFieldSchema,
  password: newPasswordFieldSchema,
  // Cada consentimiento va separado y desmarcado (SEC-23); el de novedades es opcional.
  isPrivacyAccepted: buildRequiredConsentSchema('privacyConsentRequired'),
  isTermsAccepted: buildRequiredConsentSchema('termsConsentRequired'),
  isMarketingAccepted: z.boolean(),
});
export type RegisterAccountFormValues = z.infer<typeof registerAccountFormSchema>;

export const registerGoalsFormSchema = z.object({
  experience: z.enum(EXPERIENCE_DURATIONS, {
    error: () => i18n.t('validation.experienceRequired'),
  }),
  goalIds: z.array(z.string()),
});
export type RegisterGoalsFormValues = z.infer<typeof registerGoalsFormSchema>;

export const verifyEmailFormSchema = z.object({ code: sixDigitCodeFieldSchema });
export type VerifyEmailFormValues = z.infer<typeof verifyEmailFormSchema>;

export const forgotPasswordFormSchema = z.object({ email: emailFieldSchema });
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z.object({
  code: sixDigitCodeFieldSchema,
  newPassword: newPasswordFieldSchema,
});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export const mfaAppCodeFormSchema = z.object({ code: sixDigitCodeFieldSchema });
export type MfaAppCodeFormValues = z.infer<typeof mfaAppCodeFormSchema>;

export const mfaRecoveryCodeFormSchema = z.object({ recoveryCode: recoveryCodeFieldSchema });
export type MfaRecoveryCodeFormValues = z.infer<typeof mfaRecoveryCodeFormSchema>;
