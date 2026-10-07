import type { ImportClientsRequestDtoRowsItem } from '@/shared/api/generated/model';
import { ImportClientsRequestDtoRowsItemLevel } from '@/shared/api/generated/model';

/** El mismo tope que la API: un archivo más grande se divide en varios. */
export const MAX_IMPORT_ROWS = 500;

const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 30;

const EMAIL_PART_COUNT = 2;

/** Una comprobación básica: la API valida el formato exacto y rechazaría el envío entero si fallara. */
function isPlausibleEmail(text: string): boolean {
  const parts = text.split('@');
  const domain = parts[1] ?? '';
  const isFreeOfSpaces = !/\s/.test(text);
  return (
    parts.length === EMAIL_PART_COUNT &&
    parts[0] !== '' &&
    domain.includes('.') &&
    !domain.endsWith('.') &&
    isFreeOfSpaces
  );
}

export const IMPORT_FIELDS = ['name', 'email', 'phone', 'level', 'skip'] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];

const FIELD_HEADER_PATTERNS: readonly { field: ImportField; pattern: RegExp }[] = [
  { field: 'email', pattern: /mail|correo/ },
  { field: 'phone', pattern: /tel|m[óo]vil|phone|celular/ },
  { field: 'level', pattern: /nivel|level/ },
  { field: 'name', pattern: /nombre|name|apellido|cliente|alumn/ },
];

/** Propone qué es cada columna a partir de su cabecera; la persona puede corregirlo. */
export function guessImportFields(headerRow: readonly string[]): ImportField[] {
  const usedFields = new Set<ImportField>();
  return headerRow.map((header) => {
    const normalizedHeader = header.toLowerCase();
    const match = FIELD_HEADER_PATTERNS.find(
      ({ field, pattern }) => !usedFields.has(field) && pattern.test(normalizedHeader),
    );
    if (!match) return 'skip';
    usedFields.add(match.field);
    return match.field;
  });
}

const LEVEL_WORDS: readonly { level: ImportClientsRequestDtoRowsItemLevel; pattern: RegExp }[] = [
  {
    level: ImportClientsRequestDtoRowsItemLevel.beginner,
    pattern: /princip|inicia|beginner|b[áa]sico/,
  },
  { level: ImportClientsRequestDtoRowsItemLevel.intermediate, pattern: /intermedi/ },
  { level: ImportClientsRequestDtoRowsItemLevel.advanced, pattern: /avanza|advanced|experto/ },
];

export function parseImportLevel(text: string): ImportClientsRequestDtoRowsItemLevel | null {
  const normalizedText = text.toLowerCase();
  return LEVEL_WORDS.find(({ pattern }) => pattern.test(normalizedText))?.level ?? null;
}

export interface ImportSource {
  /** Las filas de datos, sin la cabecera. */
  dataRows: readonly (readonly string[])[];
  fieldByColumn: readonly ImportField[];
}

function readColumn(
  row: readonly string[],
  fields: readonly ImportField[],
  field: ImportField,
): string {
  const columnIndex = fields.indexOf(field);
  return columnIndex === -1 ? '' : (row[columnIndex] ?? '');
}

/** Filas sin nombre y sin correo (renglones sueltos del Excel) se descartan; con uno de los dos, se envían. */
export function buildImportRows(source: ImportSource): ImportClientsRequestDtoRowsItem[] {
  const { dataRows, fieldByColumn } = source;
  return dataRows
    .map((row) => ({
      fullName: readColumn(row, fieldByColumn, 'name'),
      email: readColumn(row, fieldByColumn, 'email'),
      phone: readColumn(row, fieldByColumn, 'phone'),
      level: parseImportLevel(readColumn(row, fieldByColumn, 'level')),
    }))
    .filter(({ fullName, email }) => fullName !== '' || email !== '')
    .map(({ fullName, email, phone, level }) => ({
      fullName: (fullName === '' ? email : fullName).slice(0, MAX_NAME_LENGTH),
      // La API rechaza el envío entero si una dirección no es válida: aquí cuenta como «sin correo».
      email: isPlausibleEmail(email) ? email : null,
      phone: phone === '' ? null : phone.slice(0, MAX_PHONE_LENGTH),
      level,
    }));
}

export interface ImportSummary {
  importableCount: number;
  withoutEmailCount: number;
  repeatedCount: number;
}

/** Lo que se verá en el paso de revisión: cuántas filas entrarán y cuáles no, antes de enviar nada. */
export function summarizeImportRows(
  rows: readonly ImportClientsRequestDtoRowsItem[],
): ImportSummary {
  const seenEmails = new Set<string>();
  const summary: ImportSummary = { importableCount: 0, withoutEmailCount: 0, repeatedCount: 0 };
  for (const { email } of rows) {
    if (!email) summary.withoutEmailCount += 1;
    else if (seenEmails.has(email.toLowerCase())) summary.repeatedCount += 1;
    else {
      seenEmails.add(email.toLowerCase());
      summary.importableCount += 1;
    }
  }
  return summary;
}

export function splitIntoImportBatches(
  rows: readonly ImportClientsRequestDtoRowsItem[],
): ImportClientsRequestDtoRowsItem[][] {
  const batches: ImportClientsRequestDtoRowsItem[][] = [];
  for (let start = 0; start < rows.length; start += MAX_IMPORT_ROWS) {
    batches.push(rows.slice(start, start + MAX_IMPORT_ROWS));
  }
  return batches;
}
