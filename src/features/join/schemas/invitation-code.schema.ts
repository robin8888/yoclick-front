import { z } from 'zod';

import { i18n } from '@/shared/i18n';

// Mismo límite que el contrato (`code`: 1 a 24 caracteres).
const MAX_INVITATION_CODE_LENGTH = 24;

export const invitationCodeFormSchema = z.object({
  invitationCode: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('validation.invitationCodeRequired') })
    .max(MAX_INVITATION_CODE_LENGTH, { error: () => i18n.t('errors.INVITATION_INVALID') }),
});
export type InvitationCodeFormValues = z.infer<typeof invitationCodeFormSchema>;
