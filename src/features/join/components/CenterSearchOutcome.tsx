import type { UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import type {
  CenterSearchResponseDto,
  CenterSearchResponseDtoCentersItem,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { CenterSearchResults } from './CenterSearchResults';
import { LoadErrorState } from './LoadErrorState';

interface CenterSearchOutcomeProps {
  hasSearched: boolean;
  searchResult: UseQueryResult<CenterSearchResponseDto, ErrorType>;
  onCenterSelect: (center: CenterSearchResponseDtoCentersItem) => void;
  onJoinCodeRequest: () => void;
}

/** Los cuatro estados de la búsqueda: sin buscar, cargando, error con reintento y resultados. */
export function CenterSearchOutcome({
  hasSearched,
  searchResult,
  onCenterSelect,
  onJoinCodeRequest,
}: Readonly<CenterSearchOutcomeProps>): React.JSX.Element | null {
  if (!hasSearched)
    return (
      <Text color="ink2" align="center">
        {i18n.t('join.search.idleHint')}
      </Text>
    );
  if (searchResult.isFetching) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} rowCount={3} />;
  }
  if (searchResult.isError) {
    return (
      <LoadErrorState
        title={i18n.t('join.search.errorTitle')}
        error={searchResult.error}
        onRetry={() => void searchResult.refetch()}
      />
    );
  }
  if (searchResult.data === undefined) return null;
  return (
    <CenterSearchResults
      centers={searchResult.data.centers}
      onCenterSelect={onCenterSelect}
      onJoinCodeRequest={onJoinCodeRequest}
    />
  );
}
