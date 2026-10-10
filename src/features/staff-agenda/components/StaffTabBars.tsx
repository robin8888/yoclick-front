import { usePathname, useRouter, type Href } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import { useUnreadNotificationCount } from '@/features/notifications';
import { getSectorVocabulary, hasRoomManagement, i18n } from '@/shared/i18n';
import { PathTabBar, type PathTab } from '@/ui/organisms/TabBar';

interface StaffTabsRequest {
  clientsLabel: string;
  unreadNoticeCount: number;
}

/** Prototipo `iagenda`: Agenda, Clientes, Avisos (con su contador) y Perfil. */
function listStaffTabs({ clientsLabel, unreadNoticeCount }: StaffTabsRequest): readonly PathTab[] {
  return [
    {
      id: 'agenda',
      label: i18n.t('staffAgenda.tabs.agenda'),
      iconName: 'calendar',
      href: '/(staff)/(tabs)/agenda',
      activePaths: ['/agenda', '/sessions', '/scan'],
    },
    {
      id: 'clients',
      label: clientsLabel,
      iconName: 'users',
      href: '/(staff)/(tabs)/clients',
      activePaths: ['/clients'],
    },
    {
      id: 'notifications',
      label: i18n.t('staffAgenda.tabs.notifications'),
      iconName: 'bell',
      href: '/(staff)/(tabs)/notifications',
      activePaths: ['/notifications'],
      badgeCount: unreadNoticeCount,
    },
    {
      id: 'profile',
      label: i18n.t('staffAgenda.tabs.profile'),
      iconName: 'user',
      href: '/(staff)/(tabs)/profile',
      activePaths: ['/profile'],
    },
  ];
}

interface AdminTabsRequest {
  clientsLabel: string;
  /** Las academias llevan «Gestión» (salas y profesores) entre Contenido y Marca. */
  hasManagementTab: boolean;
}

const MANAGEMENT_TAB: PathTab = {
  id: 'management',
  label: i18n.t('centerAdmin.tabs.management'),
  iconName: 'settings',
  href: '/(admin)/(tabs)/management',
  activePaths: ['/management', '/rooms'],
};

/** Las pantallas de «Servicios y horario» cuelgan de «Marca» (prototipo); las salas, de «Gestión» si existe. */
function listBrandTabPaths(hasManagementTab: boolean): string[] {
  const paths = ['/brand', '/services', '/hours', '/team'];
  return hasManagementTab ? paths : [...paths, '/rooms'];
}

function listMainAdminTabs(clientsLabel: string): readonly PathTab[] {
  return [
    {
      id: 'agenda',
      label: i18n.t('staffAgenda.tabs.agenda'),
      iconName: 'calendar',
      href: '/(admin)/(tabs)/agenda',
      activePaths: ['/agenda', '/scan'],
    },
    {
      id: 'clients',
      label: clientsLabel,
      iconName: 'users',
      href: '/(admin)/(tabs)/clients',
      activePaths: ['/clients'],
    },
    {
      id: 'content',
      label: i18n.t('centerAdmin.tabs.content'),
      iconName: 'file',
      href: '/(admin)/(tabs)/content',
      activePaths: ['/content'],
    },
  ];
}

/** Prototipo `aagenda`: Agenda, Clientes, Contenido, (Gestión), Marca y Más. */
function listAdminTabs({ clientsLabel, hasManagementTab }: AdminTabsRequest): readonly PathTab[] {
  return [
    ...listMainAdminTabs(clientsLabel),
    ...(hasManagementTab ? [MANAGEMENT_TAB] : []),
    {
      id: 'brand',
      label: i18n.t('centerAdmin.tabs.brand'),
      iconName: 'palette',
      href: '/(admin)/(tabs)/brand',
      activePaths: listBrandTabPaths(hasManagementTab),
    },
    {
      id: 'more',
      label: i18n.t('centerAdmin.tabs.more'),
      iconName: 'more',
      href: '/(admin)/(tabs)/more',
      activePaths: ['/more', '/records', '/invite-clients', '/invite-person'],
    },
  ];
}

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

/** La barra del profesional, visible en todas sus pantallas. */
export function StaffTabBar(): React.JSX.Element {
  const router = useRouter();
  const clientsLabel = capitalize(getSectorVocabulary(useActiveCenterSectorId()).client.plural);
  const unreadNoticeCount = useUnreadNotificationCount();

  return (
    <PathTabBar
      tabs={listStaffTabs({ clientsLabel, unreadNoticeCount })}
      currentPath={usePathname()}
      onTabPress={(href) => {
        router.navigate(href as Href);
      }}
    />
  );
}

/** La barra de administración, visible en todas sus pantallas. */
export function AdminTabBar(): React.JSX.Element {
  const router = useRouter();
  const sectorId = useActiveCenterSectorId();
  const clientsLabel = capitalize(getSectorVocabulary(sectorId).client.plural);

  return (
    <PathTabBar
      tabs={listAdminTabs({ clientsLabel, hasManagementTab: hasRoomManagement(sectorId) })}
      currentPath={usePathname()}
      onTabPress={(href) => {
        router.navigate(href as Href);
      }}
    />
  );
}
