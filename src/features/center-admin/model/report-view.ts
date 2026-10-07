const MONTH_ABBREVIATIONS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;
const PERCENT = 100;
const MONTH_NUMBER_DIGITS = 2;
const NON_BREAKING_SPACE = ' ';
const BYTE_ORDER_MARK = '﻿';
const EMPTY_VALUE = '—';

/** «2026-09» → «sep». */
export function formatReportMonth(monthKey: string): string {
  const monthNumber = Number(monthKey.slice(-MONTH_NUMBER_DIGITS));
  return MONTH_ABBREVIATIONS[monthNumber - 1] ?? monthKey;
}

/** «78 %»; «—» cuando no hay dato (un porcentaje de nada no significa nada). */
export function formatReportPercent(percent: number | null): string {
  return percent === null ? EMPTY_VALUE : `${String(percent)}${NON_BREAKING_SPACE}%`;
}

export type IncomeChange =
  | { kind: 'unknown' }
  | { kind: 'same' }
  | { kind: 'up'; percent: number }
  | { kind: 'down'; percent: number };

/** Cuánto sube o baja el ingreso frente al periodo anterior; sin base anterior no hay comparación. */
export function describeIncomeChange(currentCents: number, previousCents: number): IncomeChange {
  if (previousCents <= 0) return { kind: 'unknown' };
  const percent = Math.round(((currentCents - previousCents) / previousCents) * PERCENT);
  if (percent === 0) return { kind: 'same' };
  return percent > 0 ? { kind: 'up', percent } : { kind: 'down', percent: -percent };
}

/** Altura de una barra (0–100) respecto a la más alta; la más alta ocupa todo. */
export function scaleToPercent(value: number, maximum: number): number {
  return maximum <= 0 ? 0 : Math.round((value / maximum) * PERCENT);
}

export interface StaffCsvRow {
  fullName: string;
  sessionCount: number;
  hours: number;
  occupancyPercent: number | null;
}

/** Con «;» y coma decimal para que Excel en español lo abra por columnas. */
export function buildStaffReportCsv(
  headers: readonly [string, string, string, string],
  rows: readonly StaffCsvRow[],
): string {
  const lines = [
    headers,
    ...rows.map(({ fullName, sessionCount, hours, occupancyPercent }) => [
      fullName,
      String(sessionCount),
      String(hours).replace('.', ','),
      occupancyPercent === null ? '' : String(occupancyPercent),
    ]),
  ];
  return `${BYTE_ORDER_MARK}${lines.map((line) => line.map(escapeCsvCell).join(';')).join('\n')}`;
}

function escapeCsvCell(cell: string): string {
  return /[;"\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
}
