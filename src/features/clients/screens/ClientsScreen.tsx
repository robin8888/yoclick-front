import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { CountTabs } from '@/ui/molecules/CountTabs';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClientFilters } from '../components/ClientFilters';
import { ClientListSection } from '../components/ClientListSection';
import { GroupListSection } from '../components/GroupListSection';
import { useClientFilters } from '../hooks/useClientFilters';
import { useClientList } from '../hooks/useClientList';
import { useGroupList } from '../hooks/useGroupList';

type ClientsTab = 'clients' | 'groups' | 'families';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

function buildTabs(
  clientWord: string,
  counts: { clients: number; groups: number; families: number },
) {
  return [
    { value: 'clients', label: clientWord, count: counts.clients },
    { value: 'groups', label: i18n.t('clients.tabs.groupsLabel'), count: counts.groups },
    { value: 'families', label: i18n.t('clients.tabs.familiesLabel'), count: counts.families },
  ] as const;
}

/** La pestaña de alumnos: buscador, filtro por estado y la lista. */
function StudentsTab({
  filters,
  list,
  sectorId,
  clientWord,
}: Readonly<{
  filters: ReturnType<typeof useClientFilters>;
  list: ReturnType<typeof useClientList>;
  sectorId: string | undefined;
  clientWord: string;
}>): React.JSX.Element {
  const router = useRouter();

  return (
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
      <ClientListSection list={list} sectorId={sectorId} isFiltered={filters.isFiltered} />
    </>
  );
}

interface TabContentProps {
  tab: ClientsTab;
  sectorId: string | undefined;
  clientWord: string;
  filters: ReturnType<typeof useClientFilters>;
  clients: ReturnType<typeof useClientList>;
  families: ReturnType<typeof useClientList>;
  groups: ReturnType<typeof useGroupList>;
}

/** Lo que enseña la pestaña elegida: alumnos, grupos o familias. */
function TabContent({
  tab,
  sectorId,
  clientWord,
  filters,
  clients,
  families,
  groups,
}: Readonly<TabContentProps>): React.JSX.Element {
  if (tab === 'groups') return <GroupListSection groups={groups} sectorId={sectorId} />;
  if (tab === 'families') {
    return (
      <ClientListSection list={families} sectorId={sectorId} isFiltered={filters.isFiltered} />
    );
  }
  return (
    <StudentsTab filters={filters} list={clients} sectorId={sectorId} clientWord={clientWord} />
  );
}

/** Prototipo `aclients`: «Alumnos (n)», «Grupos (n)» y «Familias (n)», con buscador y filtro por estado. */
export function ClientsScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const sectorId = useActiveCenterSectorId();
  const clientWord = capitalize(getSectorVocabulary(sectorId).client.plural);
  const [tab, setTab] = useState<ClientsTab>('clients');
  const filters = useClientFilters();
  const clients = useClientList(filters);
  const groups = useGroupList();
  const families = useClientList({ ...filters, kind: 'guardians' });
  const firstPage = clients.data?.pages[0];
  const tabs = buildTabs(clientWord, {
    clients: firstPage?.totalClientCount ?? 0,
    groups: groups.data?.groups.length ?? 0,
    families: firstPage?.guardianCount ?? 0,
  });

  return (
    <ScreenTemplate onBackPress={onBackPress} title={i18n.t('clients.title', { clientWord })}>
      <CountTabs options={tabs} selectedValue={tab} onValueChange={setTab} />
      <TabContent
        tab={tab}
        sectorId={sectorId}
        clientWord={clientWord}
        filters={filters}
        clients={clients}
        families={families}
        groups={groups}
      />
    </ScreenTemplate>
  );
}
