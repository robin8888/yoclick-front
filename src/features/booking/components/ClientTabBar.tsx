import { useRouter, usePathname, type Href } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { PathTabBar, type PathTab } from '@/ui/organisms/TabBar';

/** Las pestañas del alumno: Inicio, Reservar, Mis citas, Practicar y Perfil, con sus pantallas hijas. */
function listClientTabs(): readonly PathTab[] {
  return [
    {
      id: 'home',
      label: i18n.t('booking.tabs.home'),
      iconName: 'home',
      href: '/(client)/(tabs)/home',
      activePaths: ['/home', '/access-qr'],
    },
    {
      id: 'book',
      label: i18n.t('booking.tabs.book'),
      iconName: 'plus',
      href: '/(client)/(tabs)/book',
      activePaths: ['/book'],
    },
    {
      id: 'bookings',
      label: i18n.t('booking.tabs.bookings'),
      iconName: 'calendar',
      href: '/(client)/(tabs)/bookings',
      activePaths: ['/bookings'],
    },
    {
      id: 'practice',
      label: i18n.t('booking.tabs.practice'),
      iconName: 'play',
      href: '/(client)/(tabs)/practice',
      activePaths: ['/practice'],
    },
    {
      id: 'profile',
      label: i18n.t('booking.tabs.profile'),
      iconName: 'user',
      href: '/(client)/(tabs)/profile',
      activePaths: ['/profile', '/centers'],
    },
  ];
}

/** La barra del alumno, visible en todas sus pantallas. */
export function ClientTabBar(): React.JSX.Element {
  const router = useRouter();

  return (
    <PathTabBar
      tabs={listClientTabs()}
      currentPath={usePathname()}
      onTabPress={(href) => {
        router.navigate(href as Href);
      }}
    />
  );
}
