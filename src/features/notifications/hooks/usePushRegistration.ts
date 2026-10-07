import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { meRegisterPushDevice } from '@/shared/api/generated/endpoints/me/me';
import { useSessionStore } from '@/shared/auth/session-store';

import { readEasProjectId } from '../model/push-token';
import { usePushTokenStore } from '../model/push-token-store';
import type { PushPermissionStatus } from './usePushPermission';

const ANDROID_CHANNEL_ID = 'default';

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Avisos',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function registerThisPhone(): Promise<void> {
  await ensureAndroidChannel();
  const projectId = readEasProjectId();
  const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : {});
  await meRegisterPushDevice({
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
  });
  usePushTokenStore.getState().setRegisteredToken(token);
}

/**
 * Con sesión iniciada y el permiso concedido, da de alta este móvil para recibir avisos. Se repite
 * cada vez que se abre la sesión: el token puede cambiar, y así el móvil pasa a la cuenta actual.
 * Devuelve `true` si no se ha podido: sin token no hay aviso al móvil, pero la persona los sigue
 * viendo dentro de la app.
 */
export function usePushRegistration(permissionStatus: PushPermissionStatus): boolean {
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const shouldRegister = isSignedIn && permissionStatus === 'granted';
  const [hasFailed, setHasFailed] = useState(false);

  // Registrar el móvil es sincronizar con un sistema externo (el servicio de avisos).
  useEffect(() => {
    if (!shouldRegister) return;
    registerThisPhone()
      .then(() => {
        setHasFailed(false);
      })
      .catch(() => {
        setHasFailed(true);
      });
  }, [shouldRegister]);

  return hasFailed;
}
