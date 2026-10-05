import { useEffect, useState } from 'react';

const ONE_SECOND_MS = 1000;

interface ResendCooldown {
  /** Segundos que faltan para poder reenviar; 0 = ya se puede. */
  secondsLeft: number;
  startCooldown: () => void;
}

/** Cuenta atrás tras reenviar el código: evita pulsaciones repetidas y llegar al límite de envíos. */
export function useResendCooldown(cooldownSeconds: number): ResendCooldown {
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Sincroniza con un temporizador (sistema externo): cuenta hacia atrás mientras queda tiempo.
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timerHandle = setTimeout(() => {
      setSecondsLeft((previousSeconds) => previousSeconds - 1);
    }, ONE_SECOND_MS);
    return () => {
      clearTimeout(timerHandle);
    };
  }, [secondsLeft]);

  return {
    secondsLeft,
    startCooldown: () => {
      setSecondsLeft(cooldownSeconds);
    },
  };
}
