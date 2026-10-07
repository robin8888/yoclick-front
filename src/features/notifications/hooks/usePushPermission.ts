import * as Notifications from 'expo-notifications';
import { useCallback, useEffect } from 'react';
import { Linking } from 'react-native';
import { create } from 'zustand';

export type PushPermissionStatus = 'unknown' | 'undetermined' | 'granted' | 'denied';

interface PushPermissionState {
  status: PushPermissionStatus;
  setStatus: (status: PushPermissionStatus) => void;
}

// El permiso es del móvil, no de una pantalla: lo comparten el registro y la tarjeta que lo pide.
export const usePushPermissionStore = create<PushPermissionState>((set) => ({
  status: 'unknown',
  setStatus: (status) => {
    set({ status });
  },
}));

function toStatus(response: Notifications.NotificationPermissionsStatus): PushPermissionStatus {
  if (response.granted) return 'granted';
  return response.canAskAgain ? 'undetermined' : 'denied';
}

/** Lee del sistema el permiso actual (una vez, al arrancar). */
export function useSyncPushPermission(): void {
  const setStatus = usePushPermissionStore((state) => state.setStatus);

  // El permiso vive en el sistema operativo: es un sistema externo con el que se sincroniza.
  useEffect(() => {
    void Notifications.getPermissionsAsync().then((response) => {
      setStatus(toStatus(response));
    });
  }, [setStatus]);
}

interface PushPermission {
  status: PushPermissionStatus;
  /** Pide el permiso al sistema; hay que llamarlo tras explicar para qué sirve. */
  requestPermission: () => Promise<void>;
  /** Con el permiso denegado el sistema ya no vuelve a preguntar: se llega por los ajustes. */
  openSettings: () => void;
}

/** El estado del permiso de avisos de este móvil y cómo pedirlo. */
export function usePushPermission(): PushPermission {
  const status = usePushPermissionStore((state) => state.status);
  const setStatus = usePushPermissionStore((state) => state.setStatus);

  const requestPermission = useCallback(async () => {
    setStatus(toStatus(await Notifications.requestPermissionsAsync()));
  }, [setStatus]);

  return {
    status,
    requestPermission,
    openSettings: () => {
      void Linking.openSettings();
    },
  };
}
