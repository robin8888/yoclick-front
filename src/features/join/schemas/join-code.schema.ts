import { z } from 'zod';

import { i18n } from '@/shared/i18n';

import { isJoinCodeWellFormed } from '../model/join-code';

export const joinCodeFormSchema = z.object({
  joinCode: z.string().refine(isJoinCodeWellFormed, {
    error: () => i18n.t('validation.joinCodeInvalid'),
  }),
});

export type JoinCodeFormValues = z.infer<typeof joinCodeFormSchema>;
