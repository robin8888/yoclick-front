import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';

import { i18n } from '@/shared/i18n';

const MAX_CSV_FILE_SIZE_BYTES = 2_000_000;
const CSV_MIME_TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'text/plain',
  // Android describe como «ms-excel» los CSV que guarda Excel.
  'application/vnd.ms-excel',
];

export interface PickedCsvFile {
  fileName: string;
  text: string;
}

interface CsvFilePicker {
  pickCsvFile: () => Promise<PickedCsvFile | null>;
  errorMessage: string | null;
  reportFileError: (message: string | null) => void;
}

async function readPickedFile(asset: DocumentPicker.DocumentPickerAsset): Promise<PickedCsvFile> {
  const response = await fetch(asset.uri);
  return { fileName: asset.name, text: await response.text() };
}

/** Abre el selector de archivos del sistema y devuelve el contenido del CSV elegido. */
export function useCsvFilePicker(): CsvFilePicker {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function pickCsvFile(): Promise<PickedCsvFile | null> {
    setErrorMessage(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: CSV_MIME_TYPES,
        copyToCacheDirectory: true,
      });
      const asset = result.assets?.[0];
      if (result.canceled || !asset) return null;
      if ((asset.size ?? 0) > MAX_CSV_FILE_SIZE_BYTES) {
        setErrorMessage(i18n.t('centerAdmin.importClients.file.tooLargeError'));
        return null;
      }
      return await readPickedFile(asset);
    } catch {
      setErrorMessage(i18n.t('centerAdmin.importClients.file.readError'));
      return null;
    }
  }

  return { pickCsvFile, errorMessage, reportFileError: setErrorMessage };
}
