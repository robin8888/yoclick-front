import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterSearchBar } from '../components/CenterSearchBar';
import { CenterSearchOutcome } from '../components/CenterSearchOutcome';
import { useCenterDirectorySearch } from '../hooks/useCenterDirectorySearch';
import { useCenterSearchForm } from '../hooks/useCenterSearchForm';
import { useCenterSelection } from '../hooks/useCenterSelection';

// Logotipo completo en blanco, del mismo tamaño que en el inicio de sesión y el registro.
const SEARCH_LOGO_HEIGHT = 110;

/** Prototipo `jsearch`. Sin ordenar por cercanía: falta el permiso de ubicación (APP-2 pendiente). */
export function JoinSearchScreen(): React.JSX.Element {
  const router = useRouter();
  const { control, submittedQuery, submitSearch } = useCenterSearchForm();
  const searchResult = useCenterDirectorySearch(submittedQuery);
  const handleCenterSelect = useCenterSelection();

  return (
    <ScreenTemplate
      title={i18n.t('join.search.title')}
      subtitle={i18n.t('join.search.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<Logo variant="lockup" height={SEARCH_LOGO_HEIGHT} />}
      footer={
        <Button
          label={i18n.t('join.search.submitLabel')}
          isFullWidth
          isLoading={searchResult.isFetching}
          onPress={submitSearch}
        />
      }
    >
      <CenterSearchBar control={control} onSubmitEditing={submitSearch} />
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
