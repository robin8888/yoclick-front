import { useRouter, type Href } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { HeaderIconButton } from '@/ui/molecules/HeaderIconButton';

import { useUnreadNotificationCount } from '../hooks/useNotifications';
import { RingingBell } from './RingingBell';

interface NotificationBellProps {
  /** Dónde está la pantalla de avisos en la zona de quien la abre. */
  href: Href;
}

/** La campana de la cabecera con los avisos sin leer; tintinea con ondas mientras haya alguno y abre la lista de avisos. */
export function NotificationBell({ href }: Readonly<NotificationBellProps>): React.JSX.Element {
  const router = useRouter();
  const unreadCount = useUnreadNotificationCount();

  return (
    <RingingBell isRinging={unreadCount > 0}>
      <HeaderIconButton
        iconName="bell"
        accessibilityLabel={i18n.t('notifications.bellLabel', { count: unreadCount })}
        badgeCount={unreadCount}
        onPress={() => {
          router.push(href);
        }}
      />
    </RingingBell>
  );
}
