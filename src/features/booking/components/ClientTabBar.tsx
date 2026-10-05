import { i18n } from '@/shared/i18n';
import { RouteTabBar, type RouteTab, type RouteTabBarProps } from '@/ui/organisms/TabBar';

/** Las pestañas del alumno, en este orden: Inicio, Reservar, Mis citas, Practicar y Perfil. */
function listClientTabs(): readonly RouteTab[] {
  return [
    { routeName: 'home', iconName: 'home', label: i18n.t('booking.tabs.home') },
    { routeName: 'book', iconName: 'plus', label: i18n.t('booking.tabs.book') },
    { routeName: 'bookings', iconName: 'calendar', label: i18n.t('booking.tabs.bookings') },
    { routeName: 'practice', iconName: 'play', label: i18n.t('booking.tabs.practice') },
    { routeName: 'profile', iconName: 'user', label: i18n.t('booking.tabs.profile') },
  ];
}

export function ClientTabBar(props: Readonly<Omit<RouteTabBarProps, 'tabs'>>): React.JSX.Element {
  return <RouteTabBar {...props} tabs={listClientTabs()} />;
}
