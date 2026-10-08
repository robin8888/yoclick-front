import { z } from 'zod';

import { i18n } from '@/shared/i18n';

import { parseInviteContact } from './invite-contact';

export const invitePersonFormSchema = z.object({
  contact: z
    .string()
    .trim()
    .refine((contact) => parseInviteContact(contact) !== null, {
      error: () => i18n.t('centerAdmin.team.contactInvalid'),
    }),
});
export type InvitePersonFormValues = z.infer<typeof invitePersonFormSchema>;
