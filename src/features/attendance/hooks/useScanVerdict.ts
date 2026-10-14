import { useActiveCenterSectorId } from '@/features/join';
import type { CheckInResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary } from '@/shared/i18n';

import { buildScanVerdict, type ScanVerdict } from '../model/scan-verdict';

// Hasta que la API incluya la zona en la reserva (docs/api-requests.md).
const CENTER_TIME_ZONE = 'Europe/Madrid';

/** El veredicto del escaneo con las palabras del sector del centro; `null` sin resultado. */
export function useScanVerdict(checkIn: CheckInResponseDto | null): ScanVerdict | null {
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  if (checkIn === null) return null;
  return buildScanVerdict({
    checkIn,
    roleWords: {
      clientWord: vocabulary.client.singular,
      staffWord: vocabulary.staff.singular,
    },
    timeZone: CENTER_TIME_ZONE,
  });
}
