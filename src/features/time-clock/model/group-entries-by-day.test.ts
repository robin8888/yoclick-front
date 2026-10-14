import type { TimeEntryResponseDto } from '@/shared/api/generated/model';

import { groupEntriesByDay } from './group-entries-by-day';

function buildEntry(overrides: Partial<TimeEntryResponseDto>): TimeEntryResponseDto {
  return {
    id: 'entry',
    staffMembershipId: 'staff',
    workDate: '2026-10-05',
    clockInAt: '2026-10-05T07:00:00.000Z',
    clockOutAt: '2026-10-05T11:00:00.000Z',
    isOpen: false,
    workedMinutes: 240,
    inSource: 'qr',
    outSource: 'qr',
    isEdited: false,
    originalClockInAt: null,
    originalClockOutAt: null,
    editedAt: null,
    ...overrides,
  };
}

describe('groupEntriesByDay', () => {
  it('returns nothing without entries', () => {
    expect(groupEntriesByDay([])).toEqual([]);
  });

  it('groups split shifts of the same day and adds up the minutes', () => {
    const morning = buildEntry({ id: 'morning' });
    const afternoon = buildEntry({
      id: 'afternoon',
      clockInAt: '2026-10-05T14:00:00.000Z',
      clockOutAt: '2026-10-05T17:00:00.000Z',
      workedMinutes: 180,
    });

    const days = groupEntriesByDay([afternoon, morning]);

    expect(days).toHaveLength(1);
    expect(days[0]?.workedMinutes).toBe(420);
    expect(days[0]?.entries.map(({ id }) => id)).toEqual(['morning', 'afternoon']);
  });

  it('puts the most recent day first', () => {
    const days = groupEntriesByDay([
      buildEntry({ id: 'first', workDate: '2026-10-02' }),
      buildEntry({ id: 'last', workDate: '2026-10-09' }),
    ]);

    expect(days.map(({ workDate }) => workDate)).toEqual(['2026-10-09', '2026-10-02']);
  });
});
