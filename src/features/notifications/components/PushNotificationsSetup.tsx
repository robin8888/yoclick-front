import { useMyCenters } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';

import { useNotificationTapHandler } from '../hooks/useNotificationTapHandler';
import { usePushPermission, useSyncPushPermission } from '../hooks/usePushPermission';
import { usePushRegistration } from '../hooks/usePushRegistration';

/**
 * Deja funcionando los avisos push mientras la app está abierta: lee el permiso, registra el móvil
 * cuando está concedido y abre los avisos al tocarlos. No dibuja nada.
 */
export function PushNotificationsSetup(): null {
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const { data: myCenters } = useMyCenters({ isEnabled: isSignedIn });
  const role = myCenters?.memberships.find(
    (membership) => membership.centerId === activeCenterId,
  )?.role;
  const { status } = usePushPermission();

  useSyncPushPermission();
  usePushRegistration(status);
  useNotificationTapHandler(role);
  return null;
}
