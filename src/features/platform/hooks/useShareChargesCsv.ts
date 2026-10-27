import { useMutation } from '@tanstack/react-query';
import { Share } from 'react-native';

import { getApiErrorMessage } from '@/shared/api/errors';
import { platformExportChargesCsv } from '@/shared/api/generated/endpoints/platform/platform';
import type { PlatformExportChargesCsvParams } from '@/shared/api/generated/model';

interface ShareChargesCsv {
  shareCsv: (range: PlatformExportChargesCsvParams) => void;
  isPreparing: boolean;
  shareErrorMessage: string | null;
  clearError: () => void;
}

/**
 * Descarga el CSV del gestor y abre el menú de compartir del sistema (correo, mensajes, guardar). Se
 * comparte como texto: así no hace falta escribir un fichero con los datos fiscales en el móvil (SEC-M9).
 */
export function useShareChargesCsv(): ShareChargesCsv {
  const mutation = useMutation({
    mutationFn: async (range: PlatformExportChargesCsvParams) => {
      const csvText = await platformExportChargesCsv(range);
      await Share.share({ message: csvText, title: `cobros-${range.fromMonth}-${range.toMonth}` });
    },
  });

  return {
    shareCsv: (range) => {
      mutation.mutate(range);
    },
    isPreparing: mutation.isPending,
    shareErrorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
    clearError: mutation.reset,
  };
}
