import { usePathname, useRouter, type Href } from 'expo-router';

import { useActiveCenterModules, useActiveCenterSectorId } from '@/features/join';
import { useUnreadNotificationCount } from '@/features/notifications';
import { getSectorVocabulary, hasRoomManagement, i18n } from '@/shared/i18n';
import { PathTabBar, type PathTab } from '@/ui/organisms/TabBar';

interface StaffTabsRequest {
  clientsLabel: string;
  unreadNoticeCount: number;
}

/** Prototipo `iagenda`: Inicio (con la agenda), Clientes, Avisos (con su contador) y Perfil. */
function listStaffTabs({ clientsLabel, unreadNoticeCount }: StaffTabsRequest): readonly PathTab[] {
  return [
    {
      id: 'home',
      label: i18n.t('staffAgenda.tabs.home'),
      iconName: 'home',
      href: '/(staff)/(tabs)/agenda',
      activePaths: ['/agenda', '/day-agenda', '/sessions', '/scan', '/work-qr', '/attendance'],
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
  /** Con salas, «Salas y horarios» se abre desde Inicio: sus pantallas cuelgan de él. */
  hasRoomManagement: boolean;
  /** Sin contenido (centro de citas) no hay pestaña de contenido. */
  hasContent: boolean;
}

/** Las pantallas de «Servicios y horario» cuelgan de «Marca» (prototipo); las salas, de la agenda si hay gestión. */
function listBrandTabPaths(hasRoomManagement: boolean): string[] {
  const paths = ['/brand', '/services', '/hours', '/team'];
  return hasRoomManagement ? paths : [...paths, '/rooms'];
}

const MANAGEMENT_PATHS = ['/management', '/rooms', '/schedules'];

function listMainAdminTabs(request: AdminTabsRequest): readonly PathTab[] {
  const { clientsLabel, hasRoomManagement, hasContent } = request;
  const tabs: PathTab[] = [
    {
      id: 'home',
      label: i18n.t('centerAdmin.tabs.home'),
      iconName: 'home',
      href: '/(admin)/(tabs)/agenda',
      activePaths: [
        '/agenda',
        '/day-agenda',
        '/scan',
        // «Salas y horarios» se abre desde Inicio.
        ...(hasRoomManagement ? MANAGEMENT_PATHS : []),
      ],
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
  return hasContent ? tabs : tabs.filter((tab) => tab.id !== 'content');
}

/** Inicio (donde están la agenda y los accesos del centro), Clientes, Contenido, Marca y Más. */
function listAdminTabs(request: AdminTabsRequest): readonly PathTab[] {
  return [
    ...listMainAdminTabs(request),
    {
      id: 'brand',
      label: i18n.t('centerAdmin.tabs.brand'),
      iconName: 'palette',
      href: '/(admin)/(tabs)/brand',
      activePaths: listBrandTabPaths(request.hasRoomManagement),
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
  const modules = useActiveCenterModules();

  return (
    <PathTabBar
      tabs={listAdminTabs({
        clientsLabel,
        hasRoomManagement: hasRoomManagement(sectorId) && modules.rooms,
        hasContent: modules.content,
      })}
      currentPath={usePathname()}
      onTabPress={(href) => {
        router.navigate(href as Href);
      }}
    />
  );
}
