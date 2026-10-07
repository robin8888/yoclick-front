import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  clientsImport,
  getClientsListQueryKey,
} from '@/shared/api/generated/endpoints/clients/clients';
import type {
  ImportClientsRequestDtoRowsItem,
  ImportClientsResponseDto,
} from '@/shared/api/generated/model';

import { MAX_IMPORT_ROWS, splitIntoImportBatches } from '../model/client-import-rows';
import { useActiveCenterId } from './useActiveCenterId';

interface ImportClients {
  importClients: (rows: readonly ImportClientsRequestDtoRowsItem[]) => void;
  isImporting: boolean;
  errorMessage: string | null;
}

/** Los números de fila de cada tanda son relativos a ella: se recuentan desde el principio del archivo. */
async function importInBatches(
  centerId: string,
  rows: readonly ImportClientsRequestDtoRowsItem[],
): Promise<ImportClientsResponseDto> {
  const total: ImportClientsResponseDto = { createdCount: 0, updatedCount: 0, skipped: [] };
  for (const [batchIndex, batch] of splitIntoImportBatches(rows).entries()) {
    const report = await clientsImport(centerId, { rows: batch });
    total.createdCount += report.createdCount;
    total.updatedCount += report.updatedCount;
    total.skipped.push(
      ...report.skipped.map((skippedRow) => ({
        ...skippedRow,
        rowNumber: skippedRow.rowNumber + batchIndex * MAX_IMPORT_ROWS,
      })),
    );
  }
  return total;
}

/** Envía las filas del archivo; no es optimista: el informe lo da el servidor. */
export function useImportClients(
  onImported: (report: ImportClientsResponseDto) => void,
): ImportClients {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (rows: readonly ImportClientsRequestDtoRowsItem[]) =>
      importInBatches(centerId, rows),
    onSuccess: (report) => {
      void queryClient.invalidateQueries({ queryKey: getClientsListQueryKey(centerId) });
      onImported(report);
    },
  });

  return {
    importClients: (rows) => {
      mutation.mutate(rows);
    },
    isImporting: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
