import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { parseJoinQrContent } from '../model/join-qr-content';
import { useFindCenterByJoinCode } from './useFindCenterByJoinCode';

export type JoinQrScanProblem = { kind: 'unrecognized' } | { kind: 'lookup'; error: unknown };

interface JoinQrScanner {
  handleQrScanned: (qrContent: string) => void;
  scanProblem: JoinQrScanProblem | null;
  isLookingUpCenter: boolean;
}

/** Del QR al centro: valida el contenido, busca el centro y pasa a confirmarlo. */
export function useJoinQrScanner(): JoinQrScanner {
  const router = useRouter();
  const findCenter = useFindCenterByJoinCode();
  const [scanProblem, setScanProblem] = useState<JoinQrScanProblem | null>(null);
  // La cámara dispara el evento muchas veces por segundo con el mismo QR: se procesa una vez.
  const lastHandledQrContent = useRef<string | null>(null);

  const handleQrScanned = (qrContent: string): void => {
    if (findCenter.isPending || qrContent === lastHandledQrContent.current) return;
    lastHandledQrContent.current = qrContent;

    const joinCode = parseJoinQrContent(qrContent);
    if (joinCode === null) {
      setScanProblem({ kind: 'unrecognized' });
      return;
    }
    setScanProblem(null);
    findCenter.mutate(joinCode, {
      onSuccess: (center) => {
        router.push(`/join/${center.id}`);
      },
      onError: (error) => {
        // Permite volver a escanear el mismo QR tras un fallo de red.
        lastHandledQrContent.current = null;
        setScanProblem({ kind: 'lookup', error });
      },
    });
  };

  return { handleQrScanned, scanProblem, isLookingUpCenter: findCenter.isPending };
}
