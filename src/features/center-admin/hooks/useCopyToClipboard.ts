import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';

const COPIED_FEEDBACK_MS = 2_000;

interface CopyToClipboard {
  copyText: (text: string) => void;
  /** `true` unos segundos tras copiar: el botón lo dice con palabras, no solo con color. */
  isCopied: boolean;
}

/** Copia un texto al portapapeles y avisa un momento de que ya está copiado. */
export function useCopyToClipboard(): CopyToClipboard {
  const [isCopied, setIsCopied] = useState(false);

  // El aviso se apaga solo: es un temporizador, es decir, un sistema externo.
  useEffect(() => {
    if (!isCopied) return undefined;
    const timer = setTimeout(() => {
      setIsCopied(false);
    }, COPIED_FEEDBACK_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [isCopied]);

  return {
    copyText: (text) => {
      void Clipboard.setStringAsync(text).then(() => {
        setIsCopied(true);
      });
    },
    isCopied,
  };
}
