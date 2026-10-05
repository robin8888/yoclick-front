import { z } from 'zod';

import { i18n } from '@/shared/i18n';

export const inviteInstructorFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('validation.emailRequired') })
    .pipe(z.email({ error: () => i18n.t('validation.emailInvalid') })),
});
export type InviteInstructorFormValues = z.infer<typeof inviteInstructorFormSchema>;
