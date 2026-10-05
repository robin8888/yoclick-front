import { i18n } from '@/shared/i18n';
import { RouteTabBar, type RouteTab, type RouteTabBarProps } from '@/ui/organisms/TabBar';

/** Las pestañas del alumno, en este orden: Inicio, Agendar y Citas. */
function listClientTabs(): readonly RouteTab[] {
  return [
    { routeName: 'home', iconName: 'home', label: i18n.t('booking.tabs.home') },
    { routeName: 'book', iconName: 'plus', label: i18n.t('booking.tabs.book') },
    { routeName: 'bookings', iconName: 'calendar', label: i18n.t('booking.tabs.bookings') },
  ];
}

export function ClientTabBar(props: Readonly<Omit<RouteTabBarProps, 'tabs'>>): React.JSX.Element {
  return <RouteTabBar {...props} tabs={listClientTabs()} />;
}
