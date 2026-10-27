import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';

import { groupAgendaByStaff } from './staff-lanes';

type Session = RoomAgendaResponseDto['sessionsWithoutRoom'][number];

function buildSession(id: string, teacher: Session['teacher']): Session {
  return {
    id,
    startsAt: '2026-10-26T09:00:00.000Z',
    endsAt: '2026-10-26T10:00:00.000Z',
    mode: 'private',
    capacity: 1,
    bookedCount: 1,
    service: { id: 'service-1', name: 'Manicura', color: null },
    teacher,
    schedule: null,
    location: null,
    cancelledReason: null,
    startedAt: null,
    endedAt: null,
    attendees: [],
  };
}

function buildAgenda(sessionsWithoutRoom: Session[]): RoomAgendaResponseDto {
  return {
    date: '2026-10-26',
    timezone: 'Europe/Madrid',
    openingRanges: [],
    rooms: [],
    sessionsWithoutRoom,
  };
}

const ANA = { membershipId: 'membership-ana', fullName: 'Ana' };
const LUCIA = { membershipId: 'membership-lucia', fullName: 'Lucía' };

describe('groupAgendaByStaff', () => {
  it('gives each professional a lane with their appointments, even when they have none', () => {
    const agenda = buildAgenda([buildSession('session-1', ANA)]);

    const lanes = groupAgendaByStaff(agenda, [ANA, LUCIA]).rooms;

    expect(lanes.map((lane) => [lane.id, lane.sessions.length])).toEqual([
      ['membership-ana', 1],
      ['membership-lucia', 0],
    ]);
  });

  it('adds a lane for a professional who is not in the team list but has an appointment', () => {
    const agenda = buildAgenda([buildSession('session-1', LUCIA)]);

    const lanes = groupAgendaByStaff(agenda, [ANA]).rooms;

    expect(lanes.map((lane) => lane.name)).toEqual(['Ana', 'Lucía']);
  });

  it('keeps appointments without a professional apart', () => {
    const agenda = buildAgenda([buildSession('session-1', null)]);

    const grouped = groupAgendaByStaff(agenda, [ANA]);

    expect(grouped.sessionsWithoutRoom.map((session) => session.id)).toEqual(['session-1']);
    expect(grouped.rooms[0]?.sessions).toEqual([]);
  });
});
