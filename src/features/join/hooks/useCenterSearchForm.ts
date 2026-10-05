import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type Control } from 'react-hook-form';

import {
  centerSearchFormSchema,
  type CenterSearchFormValues,
} from '../schemas/center-search.schema';

interface CenterSearchForm {
  control: Control<CenterSearchFormValues>;
  /** Texto ya enviado; vacío mientras no se ha buscado. */
  submittedQuery: string;
  submitSearch: () => void;
}

export function useCenterSearchForm(): CenterSearchForm {
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { control, handleSubmit } = useForm<CenterSearchFormValues>({
    resolver: zodResolver(centerSearchFormSchema),
    defaultValues: { searchQuery: '' },
  });
  const submitSearch = handleSubmit(({ searchQuery }) => {
    setSubmittedQuery(searchQuery);
  });

  return { control, submittedQuery, submitSearch: () => void submitSearch() };
}
