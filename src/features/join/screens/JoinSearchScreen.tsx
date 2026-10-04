import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterSearchOutcome } from '../components/CenterSearchOutcome';
import { useCenterDirectorySearch } from '../hooks/useCenterDirectorySearch';
import { useCenterSelection } from '../hooks/useCenterSelection';
import {
  centerSearchFormSchema,
  type CenterSearchFormValues,
} from '../schemas/center-search.schema';

/** Prototipo `jsearch`. Sin ordenar por cercanía: falta el permiso de ubicación (APP-2 pendiente). */
export function JoinSearchScreen(): React.JSX.Element {
  const router = useRouter();
  const [submittedQuery, setSubmittedQuery] = useState('');
  const searchResult = useCenterDirectorySearch(submittedQuery);
  const handleCenterSelect = useCenterSelection();
  const { control, handleSubmit } = useForm<CenterSearchFormValues>({
    resolver: zodResolver(centerSearchFormSchema),
    defaultValues: { searchQuery: '' },
  });
  const submitSearch = handleSubmit(({ searchQuery }) => {
    setSubmittedQuery(searchQuery);
  });

  return (
    <ScreenTemplate
      title={i18n.t('join.search.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <FormTextField
        control={control}
        name="searchQuery"
        label={i18n.t('join.search.fieldLabel')}
        leadingIconName="search"
        returnKeyType="search"
        onSubmitEditing={() => void submitSearch()}
      />
      <CenterSearchOutcome
        hasSearched={submittedQuery !== ''}
        searchResult={searchResult}
        onCenterSelect={handleCenterSelect}
        onJoinCodeRequest={() => {
          router.push('/join/code');
        }}
      />
    </ScreenTemplate>
  );
}
