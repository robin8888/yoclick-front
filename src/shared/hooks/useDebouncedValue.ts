import { useEffect, useState } from 'react';

/** El valor, pero solo cuando deja de cambiar durante `delayMs`: evita una petición por cada tecla. */
export function useDebouncedValue<TValue>(value: TValue, delayMs: number): TValue {
  const [debouncedValue, setDebouncedValue] = useState(value);

  // El temporizador es un sistema externo: se reinicia en cada cambio y se cancela al desmontar.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
