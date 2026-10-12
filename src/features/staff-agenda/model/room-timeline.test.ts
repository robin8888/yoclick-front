import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';

import {
  buildRoomTimeline,
  filterTimelineByRoom,
  filterTimelineByService,
  listServicesOfTimeline,
} from './room-timeline';

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
    schedule: null,
    cancelledReason: null,
    attendees: [],
    ...overrides,
  };
}

function buildRoom(overrides: Record<string, unknown>) {
  return {
    id: 'room-a',
    name: 'Sala de baile',
    capacity: 10,
    staff: null,
    sessions: [],
    blocks: [],
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
    expect(
      timeline.every(({ blocks, roomBlocks }) => blocks.length === 0 && roomBlocks.length === 0),
    ).toBe(true);
  });

  it('puts each class of each room in the hour it starts, with the people still missing', () => {
    const timeline = buildRoomTimeline(
      buildAgenda([
        buildRoom({
          id: 'room-b',
          name: 'Tatami',
          capacity: 4,
          sessions: [buildSession({ id: 's2', capacity: 4, bookedCount: 1 })],
        }),
        buildRoom({ sessions: [buildSession({})] }),
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

  it('counts nobody missing in a full class, a private appointment or a cancelled day', () => {
    const timeline = buildRoomTimeline(
      buildAgenda([
        buildRoom({
          sessions: [
            buildSession({ id: 'full', bookedCount: 10 }),
            buildSession({ id: 'private', mode: 'private', capacity: 1, bookedCount: 1 }),
            buildSession({ id: 'cancelled', cancelledReason: 'Profesora enferma' }),
          ],
        }),
      ]),
    );

    const blocks = timeline.find(({ label }) => label === '17:00')?.blocks ?? [];
    expect(blocks.map(({ missingCount }) => missingCount)).toEqual([0, 0, 0]);
  });

  it('keeps a class that starts outside the opening hours', () => {
    const timeline = buildRoomTimeline(
      buildAgenda([
        buildRoom({ sessions: [buildSession({ startsAt: '2026-10-12T18:00:00.000Z' })] }),
      ]),
    );

    expect(timeline.map(({ label }) => label)).toContain('20:00');
  });

  it('keeps only one room when the legend filters, and everything with no filter', () => {
    const timeline = buildRoomTimeline(
      buildAgenda([
        buildRoom({ id: 'room-a', sessions: [buildSession({ id: 's1' })] }),
        buildRoom({ id: 'room-b', name: 'Tatami', sessions: [buildSession({ id: 's2' })] }),
      ]),
    );

    const onlyTatami = filterTimelineByRoom(timeline, 'room-b');
    const seventeen = onlyTatami.find(({ label }) => label === '17:00');

    expect(seventeen?.blocks.map(({ roomName }) => roomName)).toEqual(['Tatami']);
    expect(filterTimelineByRoom(timeline, null)).toEqual(timeline);
  });

  it('lists the services of the day once and keeps only one when filtering by service', () => {
    const salsa = buildSession({ id: 's1' });
    const bachata = buildSession({
      id: 's2',
      service: { id: 'service-bachata', name: 'Bachata', color: null },
    });
    const timeline = buildRoomTimeline(
      buildAgenda([buildRoom({ sessions: [salsa, bachata, buildSession({ id: 's3' })] })]),
    );

    expect(listServicesOfTimeline(timeline).map(({ name }) => name)).toEqual(['Bachata', 'Salsa']);
    const onlyBachata = filterTimelineByService(timeline, 'service-bachata');
    const seventeen = onlyBachata.find(({ label }) => label === '17:00');
    expect(seventeen?.blocks.map(({ session }) => session.id)).toEqual(['s2']);
    expect(filterTimelineByService(timeline, null)).toEqual(timeline);
  });

  it('shows a blocked room in the hour the block starts, even outside the opening hours', () => {
    const timeline = buildRoomTimeline(
      buildAgenda([
        buildRoom({
          blocks: [
            {
              id: 'block-1',
              startsAt: '2026-10-12T08:00:00.000Z', // 10:00 en Madrid
              endsAt: '2026-10-12T12:00:00.000Z',
              reason: 'rental',
              note: 'Asociación de vecinos',
            },
          ],
        }),
      ]),
    );

    const ten = timeline.find(({ label }) => label === '10:00');
    expect(timeline.map(({ label }) => label)).toEqual(['10:00', '16:00', '17:00', '18:00']);
    expect(ten?.roomBlocks.map(({ roomName, block }) => [roomName, block.reason])).toEqual([
      ['Sala de baile', 'rental'],
    ]);
  });
});
