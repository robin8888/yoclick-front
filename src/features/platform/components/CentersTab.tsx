import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { PlatformCenterListResponseDtoDataItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { useCenterSearch } from '../hooks/useCenterSearch';
import { CenterFilters } from './CenterFilters';
import { CenterRow } from './CenterRow';

const LIST_STYLE = { gap: 12 } as const;

interface CentersTabProps {
  onCenterOpen: (centerId: string) => void;
}

/** Las filas de centros y, si hay más páginas, «Ver más». */
function CenterRows({
  search,
  rows,
  onCenterOpen,
}: Readonly<{
  search: ReturnType<typeof useCenterSearch>;
  rows: readonly PlatformCenterListResponseDtoDataItem[];
  onCenterOpen: (centerId: string) => void;
}>): React.JSX.Element {
  const { centers } = search;

  return (
    <>
      {rows.map((center) => (
        <CenterRow
          key={center.id}
          center={center}
          now={new Date()}
          onPress={() => {
            onCenterOpen(center.id);
          }}
        />
      ))}
      {centers.hasNextPage ? (
        <Button
          variant="outline"
          label={i18n.t('platform.centers.loadMore')}
          isLoading={centers.isFetchingNextPage}
          onPress={() => void centers.fetchNextPage()}
        />
      ) : null}
    </>
  );
}

/** Los estados de la lista: error con reintento, cargando, sin resultados, y los centros con «Ver más». */
function CentersBody({
  search,
  onCenterOpen,
}: Readonly<{
  search: ReturnType<typeof useCenterSearch>;
  onCenterOpen: (centerId: string) => void;
}>): React.JSX.Element {
  const { centers } = search;
  const rows = centers.data?.pages.flatMap((page) => page.data) ?? [];

  if (centers.isError) {
    return (
      <LoadErrorState
        title={i18n.t('platform.centers.errorTitle')}
        error={centers.error}
        onRetry={() => void centers.refetch()}
        isRetrying={centers.isFetching}
      />
    );
  }
  if (centers.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (rows.length === 0) {
    return (
      <EmptyState
        iconName="search"
        title={i18n.t('platform.centers.emptyTitle')}
        description={i18n.t('platform.centers.emptyDescription')}
        actionLabel={i18n.t('platform.centers.clearFilters')}
        onActionPress={search.clearFilters}
      />
    );
  }
  return <CenterRows search={search} rows={rows} onCenterOpen={onCenterOpen} />;
}

/** La lista de centros con buscador y filtro de estado. Se pide por páginas. */
export function CentersTab({ onCenterOpen }: Readonly<CentersTabProps>): React.JSX.Element {
  const search = useCenterSearch();

  return (
    <View style={LIST_STYLE}>
      <CenterFilters
        searchText={search.searchText}
        onSearchTextChange={search.setSearchText}
        selectedStatus={search.status}
        onStatusSelect={search.setStatus}
      />
      <CentersBody search={search} onCenterOpen={onCenterOpen} />
    </View>
  );
}
