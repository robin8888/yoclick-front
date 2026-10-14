import type { TimeEntryResponseDto } from '@/shared/api/generated/model';

import { buildTimeReportHtml } from './build-time-report-html';

function buildEntry(overrides: Partial<TimeEntryResponseDto>): TimeEntryResponseDto {
  return {
    id: 'entry',
    staffMembershipId: 'staff',
    workDate: '2026-10-05',
    clockInAt: '2026-10-05T07:02:00.000Z',
    clockOutAt: '2026-10-05T12:05:00.000Z',
    isOpen: false,
    workedMinutes: 303,
    inSource: 'qr',
    outSource: 'qr',
    isEdited: false,
    originalClockInAt: null,
    originalClockOutAt: null,
    editedAt: null,
    ...overrides,
  };
}

const BASE_INPUT = {
  staffName: 'Ana <Pérez>',
  centerName: 'Academia Norte',
  monthTitle: 'Octubre de 2026',
  totalWorkedMinutes: 303,
  timeZone: 'Europe/Madrid',
} as const;

describe('buildTimeReportHtml', () => {
  it('writes who, where, the month, the times in the center time zone and the total', () => {
    const html = buildTimeReportHtml({
      ...BASE_INPUT,
      days: [{ workDate: '2026-10-05', entries: [buildEntry({})], workedMinutes: 303 }],
    });

    expect(html).toContain('Academia Norte');
    expect(html).toContain('Octubre de 2026');
    expect(html).toContain('09:02');
    expect(html).toContain('14:05');
    expect(html).toContain('5 h 3 min');
  });

  it('escapes the names so they cannot inject markup', () => {
    const html = buildTimeReportHtml({ ...BASE_INPUT, days: [] });

    expect(html).toContain('Ana &lt;Pérez&gt;');
    expect(html).not.toContain('<Pérez>');
  });

  it('marks edited entries and explains the mark', () => {
    const html = buildTimeReportHtml({
      ...BASE_INPUT,
      days: [
        { workDate: '2026-10-05', entries: [buildEntry({ isEdited: true })], workedMinutes: 303 },
      ],
    });

    expect(html).toContain('09:02 *');
    expect(html).toContain('Fichaje editado por la persona');
  });

  it('shows a dash when the leave time is missing', () => {
    const html = buildTimeReportHtml({
      ...BASE_INPUT,
      days: [
        {
          workDate: '2026-10-05',
          entries: [buildEntry({ clockOutAt: null, isOpen: true, workedMinutes: 0 })],
          workedMinutes: 0,
        },
      ],
    });

    expect(html).toContain('<td>—</td>');
  });
});
