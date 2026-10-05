import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { attendanceCheckIn } from '@/shared/api/generated/endpoints/attendance/attendance';
import type { CheckInResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface CheckInScanner {
  handleQrScanned: (qrContent: string) => void;
  scannedCheckIn: CheckInResponseDto | null;
  problemMessage: string | null;
  isRegistering: boolean;
  scanAnother: () => void;
}

/** Del QR escaneado a la asistencia registrada: el servidor valida el código y la cita. */
export function useCheckInScanner(): CheckInScanner {
  const centerId = useActiveCenterId();
  // La cámara dispara el evento muchas veces por segundo con el mismo QR: se procesa una vez.
  const lastHandledQrContent = useRef<string | null>(null);
  const checkInMutation = useMutation({
    mutationFn: (qrContent: string) => attendanceCheckIn(centerId, { qrContent }),
  });

  return {
    handleQrScanned: (qrContent) => {
      if (checkInMutation.isPending || qrContent === lastHandledQrContent.current) return;
      lastHandledQrContent.current = qrContent;
      checkInMutation.mutate(qrContent, {
        // Permite reintentar con el mismo QR tras un fallo (p. ej. sin conexión).
        onError: () => {
          lastHandledQrContent.current = null;
        },
      });
    },
    scannedCheckIn: checkInMutation.data ?? null,
    problemMessage: checkInMutation.isError ? getApiErrorMessage(checkInMutation.error) : null,
    isRegistering: checkInMutation.isPending,
    scanAnother: () => {
      lastHandledQrContent.current = null;
      checkInMutation.reset();
    },
  };
}
