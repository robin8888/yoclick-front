import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { ClientListResponseDtoClientsItem } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { StaffClientRow } from '../components/StaffClientRow';
import { useClientFilters } from '../hooks/useClientFilters';
import { useClientList } from '../hooks/useClientList';
import { describeClientLevel } from '../model/client-display';

interface StaffClientListProps {
  list: ReturnType<typeof useClientList>;
  sectorId: string | undefined;
  isFiltered: boolean;
}

function NoStaffClients({
  isFiltered,
  clientWord,
  onRetry,
}: Readonly<{ isFiltered: boolean; clientWord: string; onRetry: () => void }>): React.JSX.Element {
  return (
    <EmptyState
      iconName="users"
      title={
        isFiltered
          ? i18n.t('clients.noResultsTitle')
          : i18n.t('clients.staffEmptyTitle', { clientWord })
      }
      description={
        isFiltered
          ? i18n.t('clients.noResultsDescription')
          : i18n.t('clients.staffEmptyDescription')
      }
      actionLabel={getSharedStateCopy().retryLabel}
      onActionPress={onRetry}
    />
  );
}

interface StaffClientRowsProps {
  list: ReturnType<typeof useClientList>;
  clients: readonly ClientListResponseDtoClientsItem[];
  vocabulary: ReturnType<typeof getSectorVocabulary>;
}

function StaffClientRows({
  list,
  clients,
  vocabulary,
}: Readonly<StaffClientRowsProps>): React.JSX.Element {
  return (
    <>
      {clients.map((client) => (
        <StaffClientRow
          key={client.membershipId}
          client={client}
          levelLabel={describeClientLevel(client.level, vocabulary.levels)}
        />
      ))}
      {list.hasNextPage ? (
        <Button
          variant="outline"
          label={i18n.t('clients.loadMore')}
          isLoading={list.isFetchingNextPage}
          onPress={() => void list.fetchNextPage()}
        />
      ) : null}
    </>
  );
}

function StaffClientList({
  list,
  sectorId,
  isFiltered,
}: Readonly<StaffClientListProps>): React.JSX.Element {
  const vocabulary = getSectorVocabulary(sectorId);
  const clients = list.data?.pages.flatMap((page) => page.clients) ?? [];

  if (list.isError) {
    return (
      <LoadErrorState
        title={i18n.t('clients.loadError')}
        error={list.error}
        onRetry={() => void list.refetch()}
        isRetrying={list.isFetching}
      />
    );
  }
  if (list.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (clients.length === 0) {
    return (
      <NoStaffClients
        isFiltered={isFiltered}
        clientWord={vocabulary.client.plural}
        onRetry={() => void list.refetch()}
      />
    );
  }
  return <StaffClientRows list={list} clients={clients} vocabulary={vocabulary} />;
}

/** Prototipo `iclients`: «Mis clientes», las personas que han reservado contigo, con buscador. */
export function StaffClientsScreen(): React.JSX.Element {
  const sectorId = useActiveCenterSectorId();
  const filters = useClientFilters();
  const list = useClientList({ searchText: filters.searchText, statusFilter: 'all' });

  return (
    <ScreenTemplate
      title={i18n.t('clients.staffTitle', {
        clientWord: getSectorVocabulary(sectorId).client.plural,
      })}
    >
      <Input
        value={filters.searchText}
        onChangeText={filters.changeSearchText}
        accessibilityLabel={i18n.t('clients.search.label')}
        placeholder={i18n.t('clients.search.placeholder')}
        leadingIconName="search"
        autoCapitalize="none"
        returnKeyType="search"
      />
      <StaffClientList list={list} sectorId={sectorId} isFiltered={filters.isFiltered} />
    </ScreenTemplate>
  );
}
