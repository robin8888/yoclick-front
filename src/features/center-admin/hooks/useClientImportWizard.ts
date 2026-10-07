import { useState } from 'react';

import type { ImportClientsResponseDto } from '@/shared/api/generated/model';

import type { LoadedImportFile } from '../model/client-import-file';
import type { ImportField, ImportSummary } from '../model/client-import-rows';
import { useImportClients } from './useImportClients';
import { useImportFile } from './useImportFile';

export type ClientImportStep = 'file' | 'columns' | 'review' | 'done';

export interface ClientImportWizard {
  step: ClientImportStep;
  loadedFile: LoadedImportFile | null;
  summary: ImportSummary;
  report: ImportClientsResponseDto | null;
  fileErrorMessage: string | null;
  importErrorMessage: string | null;
  isImporting: boolean;
  canReview: boolean;
  chooseFile: () => void;
  setColumnField: (columnIndex: number, field: ImportField) => void;
  goToReview: () => void;
  startImport: () => void;
  restart: () => void;
}

/** Los cuatro pasos de «Importar clientes»: archivo, columnas, revisión y resultado. */
export function useClientImportWizard(): ClientImportWizard {
  const [step, setStep] = useState<ClientImportStep>('file');
  const [report, setReport] = useState<ImportClientsResponseDto | null>(null);
  const file = useImportFile();
  const importer = useImportClients((importReport) => {
    setReport(importReport);
    setStep('done');
  });

  return {
    step,
    loadedFile: file.loadedFile,
    summary: file.summary,
    report,
    fileErrorMessage: file.errorMessage,
    importErrorMessage: importer.errorMessage,
    isImporting: importer.isImporting,
    canReview: file.canReview,
    chooseFile: () => {
      void file.pickFile().then((isFileLoaded) => {
        if (isFileLoaded) setStep('columns');
      });
    },
    setColumnField: file.setColumnField,
    goToReview: () => {
      setStep('review');
    },
    startImport: () => {
      importer.importClients(file.importRows);
    },
    restart: () => {
      file.clearFile();
      setReport(null);
      setStep('file');
    },
  };
}
