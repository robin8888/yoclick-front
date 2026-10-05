import { i18n } from '@/shared/i18n';
import { RouteTabBar, type RouteTab, type RouteTabBarProps } from '@/ui/organisms/TabBar';

type TabBarOwnProps = Readonly<Omit<RouteTabBarProps, 'tabs'>>;

/** Pestañas del instructor: su agenda y su cuenta. */
function listStaffTabs(): readonly RouteTab[] {
  return [
    { routeName: 'agenda', iconName: 'calendar', label: i18n.t('staffAgenda.tabs.agenda') },
    { routeName: 'account', iconName: 'user', label: i18n.t('staffAgenda.tabs.account') },
  ];
}

/** Pestañas de administración: la agenda del centro, el registro de clases y la cuenta. */
function listAdminTabs(): readonly RouteTab[] {
  return [
    { routeName: 'agenda', iconName: 'calendar', label: i18n.t('staffAgenda.tabs.agenda') },
    { routeName: 'records', iconName: 'clock', label: i18n.t('staffAgenda.tabs.records') },
    { routeName: 'account', iconName: 'user', label: i18n.t('staffAgenda.tabs.account') },
  ];
}

export function StaffTabBar(props: TabBarOwnProps): React.JSX.Element {
  return <RouteTabBar {...props} tabs={listStaffTabs()} />;
}

export function AdminTabBar(props: TabBarOwnProps): React.JSX.Element {
  return <RouteTabBar {...props} tabs={listAdminTabs()} />;
}
