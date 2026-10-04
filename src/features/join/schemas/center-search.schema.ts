import { z } from 'zod';

import { i18n } from '@/shared/i18n';

import { MIN_SEARCH_QUERY_LENGTH } from '../model/search-query';

export const centerSearchFormSchema = z.object({
  searchQuery: z
    .string()
    .trim()
    .min(MIN_SEARCH_QUERY_LENGTH, { error: () => i18n.t('validation.searchQueryTooShort') }),
});

export type CenterSearchFormValues = z.infer<typeof centerSearchFormSchema>;
