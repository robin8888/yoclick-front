import type { ImportClientsRequestDtoRowsItem } from '@/shared/api/generated/model';

import { parseCsvText } from './client-import-csv';
import { buildImportRows, guessImportFields, type ImportField } from './client-import-rows';

export interface LoadedImportFile {
  fileName: string;
  /** La primera fila es la cabecera. */
  tableRows: string[][];
  fieldByColumn: ImportField[];
}

/** `null` si el archivo no trae ni cabecera ni al menos una fila de datos. */
export function readImportFile(fileName: string, text: string): LoadedImportFile | null {
  const tableRows = parseCsvText(text);
  const [headerRow, ...dataRows] = tableRows;
  if (!headerRow || dataRows.length === 0) return null;
  return { fileName, tableRows, fieldByColumn: guessImportFields(headerRow) };
}

export function withColumnField(
  file: LoadedImportFile,
  columnIndex: number,
  field: ImportField,
): LoadedImportFile {
  return {
    ...file,
    fieldByColumn: file.fieldByColumn.map((existing, index) =>
      index === columnIndex ? field : existing,
    ),
  };
}

export function buildRowsFromImportFile(file: LoadedImportFile): ImportClientsRequestDtoRowsItem[] {
  return buildImportRows({ dataRows: file.tableRows.slice(1), fieldByColumn: file.fieldByColumn });
}

/** Hace falta al menos una columna de nombre o de correo para que haya algo que importar. */
export function hasIdentityColumn(file: LoadedImportFile): boolean {
  return file.fieldByColumn.some((field) => field === 'name' || field === 'email');
}
