import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';

import {
  checkRoomBlockAvailability,
  describeDayTimeRanges,
  listBusyRangesOfRoom,
} from './room-block-availability';

const ROOM_ID = 'room-a';
const DATE = '2026-10-14';
// 16:00 en Madrid (UTC+2 en octubre).
const NOW = new Date('2026-10-14T14:00:00.000Z');
const EARLIER = new Date('2026-10-13T08:00:00.000Z');

function buildAgenda(overrides: Record<string, unknown> = {}): RoomAgendaResponseDto {
  return {
    timezone: 'Europe/Madrid',
    openingRanges: [{ opensAt: '09:00', closesAt: '21:00' }],
    rooms: [
      {
        id: ROOM_ID,
        name: 'Sala de baile',
        capacity: 10,
        staff: null,
        sessions: [
          {
            id: 'session-1',
            startsAt: '2026-10-14T16:00:00.000Z', // 18:00
            endsAt: '2026-10-14T17:00:00.000Z', // 19:00
            cancelledReason: null,
          },
          {
            id: 'session-cancelled',
            startsAt: '2026-10-14T12:00:00.000Z', // 14:00
            endsAt: '2026-10-14T13:00:00.000Z',
            cancelledReason: 'blocked',
          },
        ],
        blocks: [
          {
            id: 'block-1',
            startsAt: '2026-10-14T18:00:00.000Z', // 20:00
            endsAt: '2026-10-14T19:00:00.000Z', // 21:00
            reason: 'rental',
            note: null,
          },
        ],
      },
    ],
    sessionsWithoutRoom: [],
    ...overrides,
  } as unknown as RoomAgendaResponseDto;
}

function check(times: { startsAtTime: string; endsAtTime: string }, now = EARLIER) {
  return checkRoomBlockAvailability({
    agenda: buildAgenda(),
    roomId: ROOM_ID,
    date: DATE,
    now,
    ...times,
  });
}

describe('checkRoomBlockAvailability', () => {
  it('accepts a free future slot inside the opening hours', () => {
    expect(check({ startsAtTime: '10:00', endsAtTime: '12:00' })).toEqual({ status: 'available' });
  });

  it('refuses a slot that starts in the past even if the room is free then', () => {
    expect(check({ startsAtTime: '15:00', endsAtTime: '17:00' }, NOW)).toEqual({
      status: 'in_the_past',
    });
  });

  it('refuses a slot over a class and lists what is busy', () => {
    expect(check({ startsAtTime: '17:30', endsAtTime: '18:30' })).toEqual({
      status: 'occupied',
      busyRanges: [
        { startsAtTime: '18:00', endsAtTime: '19:00' },
        { startsAtTime: '20:00', endsAtTime: '21:00' },
      ],
    });
  });

  it('refuses a slot over another block', () => {
    expect(check({ startsAtTime: '20:30', endsAtTime: '21:00' }).status).toBe('occupied');
  });

  it('accepts a slot that only touches the edge of a class', () => {
    expect(check({ startsAtTime: '19:00', endsAtTime: '20:00' })).toEqual({ status: 'available' });
  });

  it('ignores cancelled classes', () => {
    expect(check({ startsAtTime: '14:00', endsAtTime: '15:00' })).toEqual({ status: 'available' });
  });

  it('refuses a slot outside the opening hours and says when the center opens', () => {
    expect(check({ startsAtTime: '07:00', endsAtTime: '08:30' })).toEqual({
      status: 'outside_opening_hours',
      openingRanges: [{ startsAtTime: '09:00', endsAtTime: '21:00' }],
    });
  });

  it('does not forbid anything for opening hours when the day has none configured', () => {
    const result = checkRoomBlockAvailability({
      agenda: buildAgenda({ openingRanges: [] }),
      roomId: ROOM_ID,
      date: DATE,
      startsAtTime: '07:00',
      endsAtTime: '08:00',
      now: EARLIER,
    });

    expect(result).toEqual({ status: 'available' });
  });
});

describe('listBusyRangesOfRoom', () => {
  it('returns nothing for a room that is not in the agenda', () => {
    expect(listBusyRangesOfRoom(buildAgenda(), 'room-unknown')).toEqual([]);
  });

  it('describes the ranges in one line', () => {
    expect(
      describeDayTimeRanges([
        { startsAtTime: '18:00', endsAtTime: '19:00' },
        { startsAtTime: '20:00', endsAtTime: '21:00' },
      ]),
    ).toBe('18:00–19:00, 20:00–21:00');
  });
});
