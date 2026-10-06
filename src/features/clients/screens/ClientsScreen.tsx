import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClientFilters } from '../components/ClientFilters';
import { ClientListSection } from '../components/ClientListSection';
import { GroupListSection } from '../components/GroupListSection';
import { useClientFilters } from '../hooks/useClientFilters';
import { useClientList } from '../hooks/useClientList';
import { useGroupList } from '../hooks/useGroupList';

type ClientsTab = 'clients' | 'groups';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

function buildTabs(clientWord: string, clientCount: number, groupCount: number) {
  return [
    { value: 'clients', label: i18n.t('clients.tabs.clients', { clientWord, count: clientCount }) },
    { value: 'groups', label: i18n.t('clients.tabs.groups', { count: groupCount }) },
  ] as const;
}

/** Prototipo `aclients`: «Alumnos (n)» y «Grupos (n)», con buscador por nombre y filtro por estado. */
export function ClientsScreen(): React.JSX.Element {
  const router = useRouter();
  const sectorId = useActiveCenterSectorId();
  const clientWord = capitalize(getSectorVocabulary(sectorId).client.plural);
  const [tab, setTab] = useState<ClientsTab>('clients');
  const filters = useClientFilters();
  const clients = useClientList(filters);
  const groups = useGroupList();
  const tabs = buildTabs(
    clientWord,
    clients.data?.pages[0]?.totalClientCount ?? 0,
    groups.data?.groups.length ?? 0,
  );

  return (
    <ScreenTemplate title={i18n.t('clients.title', { clientWord })}>
      <SegmentedControl options={tabs} selectedValue={tab} onValueChange={setTab} />
      {tab === 'groups' ? (
        <GroupListSection groups={groups} sectorId={sectorId} />
      ) : (
        <>
          <ClientFilters
            searchText={filters.searchText}
            statusFilter={filters.statusFilter}
            inviteLabel={i18n.t('clients.inviteAction', { clientWord })}
            onSearchTextChange={filters.changeSearchText}
            onStatusFilterChange={filters.changeStatusFilter}
            onInvitePress={() => {
              router.push('/(admin)/invite-clients');
            }}
          />
          <ClientListSection list={clients} sectorId={sectorId} isFiltered={filters.isFiltered} />
        </>
      )}
    </ScreenTemplate>
  );
}
