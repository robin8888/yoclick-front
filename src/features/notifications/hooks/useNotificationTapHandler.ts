import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useSessionStore } from '@/shared/auth/session-store';

import { getNotificationsRoute } from '../model/notification-route';

// Con la app abierta el aviso también se muestra (por defecto el sistema lo ocultaría).
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

/**
 * Al tocar un aviso del sistema se abre la lista de avisos de la zona de quien lo recibe. El
 * rol lo da la sesión (nunca el aviso): la app muestra lo que corresponde a su rol, y es la API
 * quien decide qué puede ver cada uno.
 */
export function useNotificationTapHandler(role: string | undefined): void {
  const router = useRouter();
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');

  // Escuchar al sistema operativo es sincronizar con un sistema externo.
  useEffect(() => {
    if (!isSignedIn) return undefined;
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push(getNotificationsRoute(role));
    });
    return () => {
      subscription.remove();
    };
  }, [isSignedIn, role, router]);
}
