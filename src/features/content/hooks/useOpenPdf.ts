import { useState } from 'react';
import { Linking } from 'react-native';

interface OpenPdf {
  hasFailed: boolean;
  /** Abre el PDF en el lector o el navegador del móvil, desde donde se puede guardar. */
  open: () => void;
}

/** Abrir el enlace firmado de un PDF; si el móvil no puede, queda dicho para avisar. */
export function useOpenPdf(documentUrl: string | null): OpenPdf {
  const [hasFailed, setHasFailed] = useState(false);

  return {
    hasFailed,
    open: () => {
      if (documentUrl === null) return;
      setHasFailed(false);
      Linking.openURL(documentUrl).catch(() => {
        setHasFailed(true);
      });
    },
  };
}
