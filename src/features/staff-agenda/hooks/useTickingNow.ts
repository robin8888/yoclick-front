import { useEffect, useState } from 'react';

const ONE_SECOND_MS = 1000;

/** La hora actual, refrescada cada segundo mientras la pantalla está montada (para el temporizador). */
export function useTickingNow(tickIntervalMs: number = ONE_SECOND_MS): Date {
  const [now, setNow] = useState(() => new Date());

  // Sincroniza con un temporizador (sistema externo): refresca la hora y lo limpia al desmontar.
  useEffect(() => {
    const intervalHandle = setInterval(() => {
      setNow(new Date());
    }, tickIntervalMs);
    return () => {
      clearInterval(intervalHandle);
    };
  }, [tickIntervalMs]);

  return now;
}
