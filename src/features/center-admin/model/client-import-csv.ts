const DELIMITER_CANDIDATES = [',', ';', '\t'] as const;
const BYTE_ORDER_MARK = '﻿';

/** Excel en español guarda con «;» y otros programas con «,» o tabulador: gana el que más se repite en la cabecera. */
function detectDelimiter(headerLine: string): string {
  const countByDelimiter = DELIMITER_CANDIDATES.map((delimiter) => ({
    delimiter,
    count: headerLine.split(delimiter).length - 1,
  }));
  const [firstCandidate, ...otherCandidates] = countByDelimiter;
  const mostFrequent = otherCandidates.reduce(
    (best, current) => (current.count > best.count ? current : best),
    firstCandidate ?? { delimiter: ',', count: 0 },
  );
  return mostFrequent.delimiter;
}

interface CsvParserState {
  rows: string[][];
  currentRow: string[];
  currentCell: string;
  isInsideQuotes: boolean;
}

function finishCell(state: CsvParserState): void {
  state.currentRow.push(state.currentCell.trim());
  state.currentCell = '';
}

function finishRow(state: CsvParserState): void {
  finishCell(state);
  const isBlankLine = state.currentRow.every((cell) => cell === '');
  if (!isBlankLine) state.rows.push(state.currentRow);
  state.currentRow = [];
}

/** Dentro de comillas todo es texto; `""` es una comilla y una sola `"` cierra. Devuelve cuántos caracteres extra se leyeron. */
function readQuotedCharacter(state: CsvParserState, character: string, next: string): number {
  if (character !== '"') {
    state.currentCell += character;
    return 0;
  }
  if (next === '"') {
    state.currentCell += '"';
    return 1;
  }
  state.isInsideQuotes = false;
  return 0;
}

function readPlainCharacter(state: CsvParserState, character: string, delimiter: string): void {
  if (character === '"') state.isInsideQuotes = true;
  else if (character === delimiter) finishCell(state);
  else if (character === '\n') finishRow(state);
  else if (character !== '\r') state.currentCell += character;
}

/**
 * Lee un CSV (con comillas, saltos de línea dentro de comillas, BOM y cualquiera de los tres
 * separadores habituales). Las líneas en blanco se ignoran; la primera fila es la cabecera.
 */
export function parseCsvText(text: string): string[][] {
  const content = text.startsWith(BYTE_ORDER_MARK) ? text.slice(1) : text;
  const delimiter = detectDelimiter(content.split(/\r?\n/, 1)[0] ?? '');
  const state: CsvParserState = {
    rows: [],
    currentRow: [],
    currentCell: '',
    isInsideQuotes: false,
  };

  for (let index = 0; index < content.length; index += 1) {
    const character = content.charAt(index);
    if (state.isInsideQuotes) {
      index += readQuotedCharacter(state, character, content.charAt(index + 1));
    } else {
      readPlainCharacter(state, character, delimiter);
    }
  }
  if (state.currentCell !== '' || state.currentRow.length > 0) finishRow(state);
  return state.rows;
}
