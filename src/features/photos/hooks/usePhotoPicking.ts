import { useRef, useState } from 'react';
import { Platform } from 'react-native';

import { i18n } from '@/shared/i18n';

import type { PhotoShape, PhotoSource } from '../model/photo-image';
import { pickPreparedPhoto } from './pick-prepared-photo';

interface PhotoPickingRequest {
  shape: PhotoShape;
  /** Recibe la foto ya reducida y en JPEG. */
  onPhoto: (photo: Blob) => void;
  /** Si se da, la hoja ofrece «Quitar foto». */
  onRemove?: (() => void) | undefined;
}

export interface PhotoPicking {
  isSheetVisible: boolean;
  isPreparing: boolean;
  problemMessage: string | null;
  canRemove: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  choose: (source: PhotoSource) => void;
  remove: () => void;
  /** La hoja terminó de cerrarse (iOS): ahora ya se puede abrir la cámara o la galería. */
  handleSheetClosed: () => void;
}

interface PhotoPreparation {
  isPreparing: boolean;
  problemMessage: string | null;
  startPick: (source: PhotoSource) => void;
}

/** Abre la cámara o la galería, reduce la foto elegida y la entrega; los fallos se dicen con palabras. */
function usePhotoPreparation(request: PhotoPickingRequest): PhotoPreparation {
  const [isPreparing, setIsPreparing] = useState(false);
  const [problemMessage, setProblemMessage] = useState<string | null>(null);

  async function pick(source: PhotoSource): Promise<void> {
    setProblemMessage(null);
    setIsPreparing(true);
    const outcome = await pickPreparedPhoto(source, request.shape).finally(() => {
      setIsPreparing(false);
    });
    if (outcome.kind === 'photo') request.onPhoto(outcome.blob);
    if (outcome.kind === 'camera-denied') setProblemMessage(i18n.t('photos.problem.cameraDenied'));
  }

  return {
    isPreparing,
    problemMessage,
    startPick: (source) => {
      pick(source).catch(() => {
        setProblemMessage(i18n.t('photos.problem.unreadable'));
      });
    },
  };
}

/**
 * Todo el recorrido de elegir una foto: la hoja de opciones, la cámara o la galería y reducirla.
 * iOS no abre el selector mientras otra hoja modal se cierra, así que allí se espera al aviso de
 * «hoja cerrada»; en Android se abre al momento.
 */
export function usePhotoPicking(request: PhotoPickingRequest): PhotoPicking {
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const pendingSource = useRef<PhotoSource | null>(null);
  const preparation = usePhotoPreparation(request);

  return {
    isSheetVisible,
    isPreparing: preparation.isPreparing,
    problemMessage: preparation.problemMessage,
    canRemove: request.onRemove !== undefined,
    openSheet: () => {
      setIsSheetVisible(true);
    },
    closeSheet: () => {
      setIsSheetVisible(false);
    },
    choose: (source) => {
      setIsSheetVisible(false);
      if (Platform.OS === 'ios') pendingSource.current = source;
      else preparation.startPick(source);
    },
    remove: () => {
      setIsSheetVisible(false);
      request.onRemove?.();
    },
    handleSheetClosed: () => {
      const source = pendingSource.current;
      pendingSource.current = null;
      if (source !== null) preparation.startPick(source);
    },
  };
}
