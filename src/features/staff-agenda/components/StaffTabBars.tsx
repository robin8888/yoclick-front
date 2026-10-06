import { usePathname, useRouter, type Href } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { PathTabBar, type PathTab } from '@/ui/organisms/TabBar';

/** Pestañas del profesional: su agenda y su cuenta, con las pantallas que cuelgan de cada una. */
function listStaffTabs(): readonly PathTab[] {
  return [
    {
      id: 'agenda',
      label: i18n.t('staffAgenda.tabs.agenda'),
      iconName: 'calendar',
      href: '/(staff)/(tabs)/agenda',
      activePaths: ['/agenda', '/sessions', '/scan'],
    },
    {
      id: 'account',
      label: i18n.t('staffAgenda.tabs.account'),
      iconName: 'user',
      href: '/(staff)/(tabs)/account',
      activePaths: ['/account'],
    },
  ];
}

/** Prototipo `aagenda`: Agenda, Clientes, Contenido, Marca y Más, con las pantallas de cada una. */
function listAdminTabs(clientsLabel: string): readonly PathTab[] {
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
    {
      id: 'brand',
      label: i18n.t('centerAdmin.tabs.brand'),
      iconName: 'palette',
      href: '/(admin)/(tabs)/brand',
      // En el prototipo «Servicios y horario» cuelga de «Marca».
      activePaths: ['/brand', '/services', '/hours', '/rooms', '/team'],
    },
    {
      id: 'more',
      label: i18n.t('centerAdmin.tabs.more'),
      iconName: 'more',
      href: '/(admin)/(tabs)/more',
      activePaths: ['/more', '/records', '/invite-clients', '/invite-team'],
    },
  ];
}

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

/** La barra del profesional, visible en todas sus pantallas. */
export function StaffTabBar(): React.JSX.Element {
  const router = useRouter();

  return (
    <PathTabBar
      tabs={listStaffTabs()}
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
  const clientsLabel = capitalize(getSectorVocabulary(useActiveCenterSectorId()).client.plural);

  return (
    <PathTabBar
      tabs={listAdminTabs(clientsLabel)}
      currentPath={usePathname()}
      onTabPress={(href) => {
        router.navigate(href as Href);
      }}
    />
  );
}
