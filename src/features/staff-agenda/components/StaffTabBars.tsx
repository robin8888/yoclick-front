import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { RouteTabBar, type RouteTab, type RouteTabBarProps } from '@/ui/organisms/TabBar';

type TabBarOwnProps = Readonly<Omit<RouteTabBarProps, 'tabs'>>;

/** Pestañas del instructor: su agenda y su cuenta. */
function listStaffTabs(): readonly RouteTab[] {
  return [
    { routeName: 'agenda', iconName: 'calendar', label: i18n.t('staffAgenda.tabs.agenda') },
    { routeName: 'account', iconName: 'user', label: i18n.t('staffAgenda.tabs.account') },
  ];
}

/** Prototipo `aagenda`: Agenda, Clientes, Contenido, Marca y Más. */
function listAdminTabs(clientsLabel: string): readonly RouteTab[] {
  return [
    { routeName: 'agenda', iconName: 'calendar', label: i18n.t('staffAgenda.tabs.agenda') },
    { routeName: 'clients', iconName: 'users', label: clientsLabel },
    { routeName: 'content', iconName: 'file', label: i18n.t('centerAdmin.tabs.content') },
    { routeName: 'brand', iconName: 'palette', label: i18n.t('centerAdmin.tabs.brand') },
    { routeName: 'more', iconName: 'more', label: i18n.t('centerAdmin.tabs.more') },
  ];
}

export function StaffTabBar(props: TabBarOwnProps): React.JSX.Element {
  return <RouteTabBar {...props} tabs={listStaffTabs()} />;
}

export function AdminTabBar(props: TabBarOwnProps): React.JSX.Element {
  const { plural } = getSectorVocabulary(useActiveCenterSectorId()).client;
  const clientsLabel = `${plural.charAt(0).toUpperCase()}${plural.slice(1)}`;
  return <RouteTabBar {...props} tabs={listAdminTabs(clientsLabel)} />;
}
