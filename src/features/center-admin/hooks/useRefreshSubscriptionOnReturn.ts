import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { getCentersGetSubscriptionQueryKey } from '@/shared/api/generated/endpoints/centers/centers';

import { useActiveCenterId } from './useActiveCenterId';

/**
 * El pago se hace en el navegador: al volver a la app se recarga la suscripción, para que el plan nuevo
 * aparezca sin tener que salir y entrar. Sincroniza con un sistema externo (el estado de la app).
 */
export function useRefreshSubscriptionOnReturn(): void {
  const queryClient = useQueryClient();
  const centerId = useActiveCenterId();

  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void queryClient.invalidateQueries({ queryKey: getCentersGetSubscriptionQueryKey(centerId) });
    });
    return () => {
      listener.remove();
    };
  }, [queryClient, centerId]);
}
