import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';

import { buildRoomTimeline } from './room-timeline';

function buildSession(overrides: Record<string, unknown>) {
  return {
    id: 'session-1',
    startsAt: '2026-10-12T15:00:00.000Z', // 17:00 en Madrid
    endsAt: '2026-10-12T16:00:00.000Z',
    mode: 'group',
    capacity: 10,
    bookedCount: 3,
    service: { id: 'service-salsa', name: 'Salsa', color: null },
    teacher: { membershipId: 'staff-ana', fullName: 'Ana Ruiz' },
    attendees: [],
    ...overrides,
  };
}

function buildAgenda(rooms: unknown[]): RoomAgendaResponseDto {
  return {
    date: '2026-10-12',
    timezone: 'Europe/Madrid',
    openingRanges: [{ opensAt: '16:00', closesAt: '19:00' }],
    rooms,
    sessionsWithoutRoom: [],
  } as unknown as RoomAgendaResponseDto;
}

describe('buildRoomTimeline', () => {
  it('has a row for every hour the center is open', () => {
    const timeline = buildRoomTimeline(buildAgenda([]));

    expect(timeline.map(({ label }) => label)).toEqual(['16:00', '17:00', '18:00']);
    expect(timeline.every(({ blocks }) => blocks.length === 0)).toBe(true);
  });

  it('puts each class of each room in the hour it starts, with the people still missing', () => {
    const timeline = buildRoomTimeline(
      buildAgenda([
        {
          id: 'room-b',
          name: 'Tatami',
          capacity: 4,
          staff: null,
          sessions: [buildSession({ id: 's2', capacity: 4, bookedCount: 1 })],
        },
        {
          id: 'room-a',
          name: 'Sala de baile',
          capacity: 10,
          staff: null,
          sessions: [buildSession({})],
        },
      ]),
    );

    const seventeen = timeline.find(({ label }) => label === '17:00');
    expect(seventeen?.blocks.map(({ roomName, missingCount }) => [roomName, missingCount])).toEqual(
      [
        ['Sala de baile', 7],
        ['Tatami', 3],
      ],
    );
  });

  it('counts nobody missing in a full class or a private appointment', () => {
    const timeline = buildRoomTimeline(
      buildAgenda([
        {
          id: 'room-a',
          name: 'Sala de baile',
          capacity: 10,
          staff: null,
          sessions: [
            buildSession({ id: 'full', bookedCount: 10 }),
            buildSession({ id: 'private', mode: 'private', capacity: 1, bookedCount: 1 }),
          ],
        },
      ]),
    );

    const blocks = timeline.find(({ label }) => label === '17:00')?.blocks ?? [];
    expect(blocks.map(({ missingCount }) => missingCount)).toEqual([0, 0]);
  });

  it('keeps a class that starts outside the opening hours', () => {
    const timeline = buildRoomTimeline(
      buildAgenda([
        {
          id: 'room-a',
          name: 'Sala de baile',
          capacity: 10,
          staff: null,
          sessions: [buildSession({ startsAt: '2026-10-12T18:00:00.000Z' })],
        },
      ]),
    );

    expect(timeline.map(({ label }) => label)).toContain('20:00');
  });
});
