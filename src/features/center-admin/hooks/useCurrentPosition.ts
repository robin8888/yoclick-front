import * as Location from 'expo-location';
import { useState } from 'react';

import type { MapPoint } from '@/shared/lib/location-link';

export type CurrentPositionStatus = 'idle' | 'locating' | 'denied' | 'failed';

interface CurrentPosition {
  status: CurrentPositionStatus;
  /** Pide el permiso en el momento de usarlo y, con él, entrega el punto donde está el móvil. */
  locate: (onPosition: (point: MapPoint) => void) => void;
}

async function readCurrentPoint(): Promise<MapPoint | 'denied'> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) return 'denied';
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

/** Dónde está el móvil ahora, para fijar el punto exacto de una clase estando en el sitio. */
export function useCurrentPosition(): CurrentPosition {
  const [status, setStatus] = useState<CurrentPositionStatus>('idle');

  return {
    status,
    locate: (onPosition) => {
      setStatus('locating');
      readCurrentPoint()
        .then((result) => {
          if (result === 'denied') {
            setStatus('denied');
            return;
          }
          setStatus('idle');
          onPosition(result);
        })
        .catch(() => {
          setStatus('failed');
        });
    },
  };
}
