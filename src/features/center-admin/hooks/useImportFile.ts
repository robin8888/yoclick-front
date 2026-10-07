import { useState } from 'react';

import type { ImportClientsRequestDtoRowsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import {
  buildRowsFromImportFile,
  hasIdentityColumn,
  readImportFile,
  withColumnField,
  type LoadedImportFile,
} from '../model/client-import-file';
import {
  summarizeImportRows,
  type ImportField,
  type ImportSummary,
} from '../model/client-import-rows';
import { useCsvFilePicker } from './useCsvFilePicker';

interface ImportFile {
  loadedFile: LoadedImportFile | null;
  importRows: ImportClientsRequestDtoRowsItem[];
  summary: ImportSummary;
  canReview: boolean;
  errorMessage: string | null;
  /** Resuelve `true` si se eligió y se leyó un archivo con datos. */
  pickFile: () => Promise<boolean>;
  setColumnField: (columnIndex: number, field: ImportField) => void;
  clearFile: () => void;
}

const NO_ROWS: ImportClientsRequestDtoRowsItem[] = [];
const EMPTY_SUMMARY: ImportSummary = { importableCount: 0, withoutEmailCount: 0, repeatedCount: 0 };

/** El CSV elegido, qué es cada columna y las filas que saldrían de ahí. */
export function useImportFile(): ImportFile {
  const [loadedFile, setLoadedFile] = useState<LoadedImportFile | null>(null);
  const filePicker = useCsvFilePicker();
  const importRows = loadedFile ? buildRowsFromImportFile(loadedFile) : NO_ROWS;

  async function pickFile(): Promise<boolean> {
    const pickedFile = await filePicker.pickCsvFile();
    if (!pickedFile) return false;
    const readFile = readImportFile(pickedFile.fileName, pickedFile.text);
    if (!readFile) {
      filePicker.reportFileError(i18n.t('centerAdmin.importClients.file.emptyError'));
      return false;
    }
    setLoadedFile(readFile);
    return true;
  }

  return {
    loadedFile,
    importRows,
    summary: loadedFile ? summarizeImportRows(importRows) : EMPTY_SUMMARY,
    canReview: loadedFile !== null && hasIdentityColumn(loadedFile) && importRows.length > 0,
    errorMessage: filePicker.errorMessage,
    pickFile,
    setColumnField: (columnIndex, field) => {
      setLoadedFile((current) =>
        current ? withColumnField(current, columnIndex, field) : current,
      );
    },
    clearFile: () => {
      setLoadedFile(null);
    },
  };
}
