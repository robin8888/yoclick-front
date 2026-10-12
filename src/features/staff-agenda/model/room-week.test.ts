import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';

import { listRoomIdsWithClasses, listWeekIsoDates } from './room-week';

describe('listWeekIsoDates', () => {
  it.each([
    ['a Monday', '2026-10-12'],
    ['a Thursday', '2026-10-15'],
    ['a Sunday', '2026-10-18'],
  ])('lists Monday to Sunday of the week of %s', (_caseName, isoDate) => {
    expect(listWeekIsoDates(isoDate)).toEqual([
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
    ]);
  });
});

describe('listRoomIdsWithClasses', () => {
  it('keeps the rooms with a class that is still on, and nothing while the day is loading', () => {
    const agenda = {
      rooms: [
        { id: 'busy', sessions: [{ cancelledReason: null }] },
        { id: 'cancelled', sessions: [{ cancelledReason: 'Festivo' }] },
        { id: 'free', sessions: [] },
      ],
    } as unknown as RoomAgendaResponseDto;

    expect(listRoomIdsWithClasses(agenda)).toEqual(['busy']);
    expect(listRoomIdsWithClasses(undefined)).toEqual([]);
  });
});
