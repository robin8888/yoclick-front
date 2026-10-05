import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { attendanceIssueCode } from '@/shared/api/generated/endpoints/attendance/attendance';
import type { CheckInCodeResponseDto } from '@/shared/api/generated/model';

import { calculateRefreshDelayMs } from '../model/check-in-code-refresh';
import { useActiveCenterId } from './useActiveCenterId';

/**
 * El QR de asistencia lo firma el servidor y caduca en minutos: se pide al abrir la pantalla y se
 * renueva solo antes de vencer. No se conserva en caché al salir (es un dato personal, SEC-M9).
 */
export function useCheckInCode(): UseQueryResult<CheckInCodeResponseDto, ErrorType> {
  const centerId = useActiveCenterId();
  return useQuery({
    queryKey: ['checkin-code', centerId],
    queryFn: () => attendanceIssueCode(centerId),
    enabled: centerId !== '',
    gcTime: 0,
    refetchInterval: (query) =>
      query.state.data === undefined
        ? false
        : calculateRefreshDelayMs(query.state.data.expiresAt, Date.now()),
  });
}
