import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { ClientListResponseDtoClientsItem } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { StaffClientRow } from '../components/StaffClientRow';
import { createStaffClientCardStyle } from '../components/StaffClientRow.styles';
import { useActiveClientCount } from '../hooks/useActiveClientCount';
import { useClientFilters } from '../hooks/useClientFilters';
import { useClientList } from '../hooks/useClientList';
import { describeClientLevel } from '../model/client-display';

interface StaffClientListProps {
  list: ReturnType<typeof useClientList>;
  sectorId: string | undefined;
  isFiltered: boolean;
  onClearSearch: () => void;
}

function NoStaffClients({
  isFiltered,
  clientWord,
  onClearSearch,
}: Readonly<{
  isFiltered: boolean;
  clientWord: string;
  onClearSearch: () => void;
}>): React.JSX.Element {
  const router = useRouter();

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
      actionLabel={
        isFiltered ? i18n.t('clients.clearSearchAction') : i18n.t('clients.staffEmptyAction')
      }
      onActionPress={
        isFiltered
          ? onClearSearch
          : () => {
              router.navigate('/(staff)/(tabs)/agenda');
            }
      }
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
  const theme = useTheme();

  return (
    <>
      <View style={createStaffClientCardStyle(theme)}>
        {clients.map((client, index) => (
          <StaffClientRow
            key={client.membershipId}
            client={client}
            levelLabel={describeClientLevel(client.level, vocabulary.levels)}
            isLast={index === clients.length - 1}
          />
        ))}
      </View>
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
  onClearSearch,
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
        onClearSearch={onClearSearch}
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
  const activeCount = useActiveClientCount();
  const vocabulary = getSectorVocabulary(sectorId);

  return (
    <ScreenTemplate
      title={i18n.t('clients.staffTitle', { clientWord: vocabulary.client.plural })}
      subtitle={
        activeCount === undefined
          ? undefined
          : i18n.t('clients.staffSubtitle', {
              count: activeCount,
              clientWord: activeCount === 1 ? vocabulary.client.singular : vocabulary.client.plural,
            })
      }
    >
      <Input
        value={filters.searchText}
        onChangeText={filters.changeSearchText}
        accessibilityLabel={i18n.t('clients.staffSearch', {
          clientWord: vocabulary.client.singular,
        })}
        placeholder={i18n.t('clients.staffSearch', { clientWord: vocabulary.client.singular })}
        leadingIconName="search"
        autoCapitalize="none"
        returnKeyType="search"
      />
      <StaffClientList
        list={list}
        sectorId={sectorId}
        isFiltered={filters.isFiltered}
        onClearSearch={() => {
          filters.changeSearchText('');
        }}
      />
    </ScreenTemplate>
  );
}
