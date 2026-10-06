import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { joinFindCenterByCode } from '@/shared/api/generated/endpoints/join/join';
import type { PublicCenterResponseDto } from '@/shared/api/generated/model';

import { normalizeJoinCode } from '../model/join-code';
import { mapPublicCenterToPendingCenter, type JoinSource } from '../model/pending-center';
import { usePendingCenterStore } from '../model/pending-center-store';

/** Busca el centro del código y, si existe, lo deja como centro elegido para el resto del flujo. */
export function useFindCenterByJoinCode(
  joinSource: JoinSource = 'code',
): UseMutationResult<PublicCenterResponseDto, ErrorType, string> {
  const selectPendingCenter = usePendingCenterStore((state) => state.selectPendingCenter);

  return useMutation<PublicCenterResponseDto, ErrorType, string>({
    mutationFn: (rawCode) => joinFindCenterByCode(normalizeJoinCode(rawCode)),
    onSuccess: (center, rawCode) => {
      selectPendingCenter(
        mapPublicCenterToPendingCenter(center, normalizeJoinCode(rawCode), joinSource),
      );
    },
  });
}
