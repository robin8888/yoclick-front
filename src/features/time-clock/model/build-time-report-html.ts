import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';

import type { WorkDay } from './group-entries-by-day';
import { formatWorkedMinutes } from './worked-time';

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (character) => HTML_ESCAPES[character] ?? character);
}

export interface TimeReportInput {
  staffName: string;
  centerName: string;
  monthTitle: string;
  /** Los días con fichajes del mes, en el orden en que se quieren leer. */
  days: readonly WorkDay[];
  totalWorkedMinutes: number;
  timeZone: string;
}

function buildDayRows(days: readonly WorkDay[], timeZone: string): string {
  const missingOut = escapeHtml(i18n.t('timeClock.report.openOut'));
  return days
    .flatMap((day) =>
      day.entries.map((entry) => {
        const dayLabel = formatShortDate(`${day.workDate}T12:00:00.000Z`, timeZone);
        const outTime =
          entry.clockOutAt === null ? missingOut : formatTime24h(entry.clockOutAt, timeZone);
        const editedMark = entry.isEdited ? ' *' : '';
        return `<tr><td>${escapeHtml(dayLabel)}</td><td>${formatTime24h(entry.clockInAt, timeZone)}${editedMark}</td><td>${outTime}${editedMark}</td><td class="number">${escapeHtml(formatWorkedMinutes(entry.workedMinutes))}</td></tr>`;
      }),
    )
    .join('');
}

const REPORT_STYLES = `
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: black; padding: 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .meta { color: dimgray; font-size: 13px; margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
  th { text-align: left; border-bottom: 2px solid black; padding: 8px 6px; }
  td { border-bottom: 1px solid lightgray; padding: 8px 6px; }
  .number { text-align: right; }
  .total { margin-top: 16px; font-size: 16px; font-weight: bold; text-align: right; }
  .note { margin-top: 12px; color: dimgray; font-size: 12px; }
`;

/** El informe mensual como una página HTML: quién, dónde, el mes, cada fichaje y el total. */
export function buildTimeReportHtml(input: Readonly<TimeReportInput>): string {
  const hasEditedEntry = input.days.some((day) => day.entries.some((entry) => entry.isEdited));
  const editedNote = hasEditedEntry
    ? `<p class="note">${escapeHtml(i18n.t('timeClock.report.editedNote'))}</p>`
    : '';

  return `<html><head><meta charset="utf-8"><style>${REPORT_STYLES}</style></head><body>
<h1>${escapeHtml(i18n.t('timeClock.report.title'))}</h1>
<p class="meta">${escapeHtml(i18n.t('timeClock.report.staffLabel'))}: ${escapeHtml(input.staffName)}</p>
<p class="meta">${escapeHtml(i18n.t('timeClock.report.centerLabel'))}: ${escapeHtml(input.centerName)}</p>
<p class="meta">${escapeHtml(i18n.t('timeClock.report.monthLabel'))}: ${escapeHtml(input.monthTitle)}</p>
<table>
<thead><tr><th>${escapeHtml(i18n.t('timeClock.report.dayColumn'))}</th><th>${escapeHtml(i18n.t('timeClock.report.inColumn'))}</th><th>${escapeHtml(i18n.t('timeClock.report.outColumn'))}</th><th class="number">${escapeHtml(i18n.t('timeClock.report.workedColumn'))}</th></tr></thead>
<tbody>${buildDayRows(input.days, input.timeZone)}</tbody>
</table>
<p class="total">${escapeHtml(i18n.t('timeClock.report.totalLabel'))}: ${escapeHtml(formatWorkedMinutes(input.totalWorkedMinutes))}</p>
${editedNote}
</body></html>`;
}
