import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import type { ClientListResponseDtoClientsItem } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import type { useClientList } from '../hooks/useClientList';
import { describeClientLevel } from '../model/client-display';
import { ClientRow } from './ClientRow';

interface ClientListSectionProps {
  list: ReturnType<typeof useClientList>;
  sectorId: string | undefined;
  /** Hay búsqueda o filtro: «nadie coincide» en lugar de «aún no tienes». */
  isFiltered: boolean;
}

interface NoClientsProps {
  isFiltered: boolean;
  clientWord: string;
}

function NoClients({ isFiltered, clientWord }: Readonly<NoClientsProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <EmptyState
      iconName="users"
      title={
        isFiltered ? i18n.t('clients.noResultsTitle') : i18n.t('clients.emptyTitle', { clientWord })
      }
      description={
        isFiltered ? i18n.t('clients.noResultsDescription') : i18n.t('clients.emptyDescription')
      }
      actionLabel={i18n.t('clients.inviteAction', { clientWord })}
      onActionPress={() => {
        router.push('/(admin)/invite-clients');
      }}
    />
  );
}

interface ClientRowsProps {
  list: ReturnType<typeof useClientList>;
  clients: readonly ClientListResponseDtoClientsItem[];
  vocabulary: ReturnType<typeof getSectorVocabulary>;
}

function ClientRows({ list, clients, vocabulary }: Readonly<ClientRowsProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      {clients.map((client) => (
        <ClientRow
          key={client.membershipId}
          client={client}
          levelLabel={describeClientLevel(client.level, vocabulary.levels)}
          onPress={() => {
            router.push({
              pathname: '/(admin)/clients/[membershipId]',
              params: { membershipId: client.membershipId },
            });
          }}
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

/** La lista de clientes: carga, error con reintento, vacío, sin resultados o las filas con «Ver más». */
export function ClientListSection({
  list,
  sectorId,
  isFiltered,
}: Readonly<ClientListSectionProps>): React.JSX.Element {
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
    return <NoClients isFiltered={isFiltered} clientWord={vocabulary.client.plural} />;
  }
  return <ClientRows list={list} clients={clients} vocabulary={vocabulary} />;
}
