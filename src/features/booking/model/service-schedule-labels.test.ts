import { describeServiceSchedules } from './service-schedule-labels';

const ROOM = { id: '0198f4a0-0000-7000-8000-000000000001', name: 'Sala 1' };

function buildSchedule(overrides: {
  weekday: number;
  startsAtTime?: string;
  endsAtTime?: string;
  room?: typeof ROOM | null;
  teacherName?: string;
}): {
  id: string;
  weekday: number;
  startsAtTime: string;
  endsAtTime: string;
  room: typeof ROOM | null;
  teacherName: string;
} {
  return {
    id: `0198f4a0-0000-7000-8000-0000000001${String(overrides.weekday).padStart(2, '0')}`,
    startsAtTime: '18:00',
    endsAtTime: '19:00',
    room: ROOM,
    teacherName: 'Marta',
    ...overrides,
  };
}

describe('describeServiceSchedules', () => {
  it('is empty without schedules', () => {
    expect(describeServiceSchedules([])).toEqual([]);
  });

  it('joins the days that share time, room and teacher', () => {
    const lines = describeServiceSchedules([
      buildSchedule({ weekday: 3 }),
      buildSchedule({ weekday: 1 }),
      buildSchedule({ weekday: 5 }),
    ]);

    expect(lines).toEqual(['lun, mié y vie · 18:00–19:00 · Sala 1 · con Marta']);
  });

  it('keeps a line per different slot and skips a missing room', () => {
    const lines = describeServiceSchedules([
      buildSchedule({ weekday: 2 }),
      buildSchedule({ weekday: 4, startsAtTime: '10:00', endsAtTime: '11:00', room: null }),
    ]);

    expect(lines).toEqual([
      'mar · 18:00–19:00 · Sala 1 · con Marta',
      'jue · 10:00–11:00 · con Marta',
    ]);
  });
});
