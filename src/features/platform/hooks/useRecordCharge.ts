import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { platformRecordCharge } from '@/shared/api/generated/endpoints/platform/platform';
import type { RecordPlatformChargeRequestDto } from '@/shared/api/generated/model';

import { invalidatePlatformQueries } from './invalidatePlatformQueries';

interface RecordCharge {
  recordCharge: (request: RecordPlatformChargeRequestDto, onRecorded: () => void) => void;
  isRecording: boolean;
  recordErrorMessage: string | null;
  clearError: () => void;
}

/** Apunta un cobro a mano. No es optimista: se espera al servidor, que calcula el IVA y lo audita. */
export function useRecordCharge(): RecordCharge {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: RecordPlatformChargeRequestDto) => platformRecordCharge(request),
  });

  return {
    recordCharge: (request, onRecorded) => {
      mutation.mutate(request, {
        onSuccess: () => {
          void invalidatePlatformQueries(queryClient).then(onRecorded);
        },
      });
    },
    isRecording: mutation.isPending,
    recordErrorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
    clearError: mutation.reset,
  };
}
