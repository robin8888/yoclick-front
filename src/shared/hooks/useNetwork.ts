import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export interface NetworkStatus {
  readonly isOffline: boolean;
}

/**
 * `null` significa «aún no se sabe»: no se muestra «sin conexión» por una duda. Solo un `false`
 * explícito (sin red, o red sin salida a internet) cuenta como desconectado.
 */
export function isOfflineFromNetInfoState(
  state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>,
): boolean {
  return state.isConnected === false || state.isInternetReachable === false;
}

export function useNetwork(): NetworkStatus {
  const [isOffline, setIsOffline] = useState(false);

  // Se suscribe a un sistema externo (el estado de red del móvil): es el uso legítimo del efecto.
  useEffect(() => {
    let isSubscribed = true;
    void NetInfo.fetch().then((state) => {
      if (isSubscribed) setIsOffline(isOfflineFromNetInfoState(state));
    });
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(isOfflineFromNetInfoState(state));
    });
    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  return { isOffline };
}
