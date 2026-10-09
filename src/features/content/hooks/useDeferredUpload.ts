import { useRef } from 'react';
import { Platform } from 'react-native';

export type UploadKind = 'video' | 'pdf';

interface DeferredUpload {
  /** Cierra la hoja de «¿Qué quieres subir?» y abre el selector cuando ya no se está viendo. */
  choose: (kind: UploadKind) => void;
  /** Para la hoja: avisa de que terminó de cerrarse y ya se puede abrir el selector. */
  handleSheetClosed: () => void;
}

/**
 * iOS no deja abrir el selector de ficheros o de fotos mientras otra hoja modal se está cerrando:
 * el selector falla sin explicación. En iOS se espera al aviso de «hoja cerrada»; en Android el
 * selector se abre al momento.
 */
export function useDeferredUpload(request: {
  hideSheet: () => void;
  upload: { uploadVideo: () => void; uploadPdf: () => void };
}): DeferredUpload {
  const pendingKind = useRef<UploadKind | null>(null);
  const startUpload = (kind: UploadKind): void => {
    if (kind === 'video') request.upload.uploadVideo();
    else request.upload.uploadPdf();
  };

  return {
    choose: (kind) => {
      request.hideSheet();
      if (Platform.OS === 'ios') pendingKind.current = kind;
      else startUpload(kind);
    },
    handleSheetClosed: () => {
      const kind = pendingKind.current;
      pendingKind.current = null;
      if (kind !== null) startUpload(kind);
    },
  };
}
