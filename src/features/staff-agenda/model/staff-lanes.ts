import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';

import type { AgendaStaffMember } from './center-agenda-summary';

/** Una «sala» que representa a un profesional: ocupa una persona, no un espacio. */
const STAFF_LANE_CAPACITY = 1;

/**
 * La agenda de un centro sin salas con la misma forma que la de uno con salas: cada profesional
 * hace de «sala» (su letra, su color y sus citas), así el centro ve la misma rejilla por horas.
 * Las citas sin profesional se quedan en «sin sala».
 */
export function groupAgendaByStaff(
  agenda: RoomAgendaResponseDto,
  teamStaff: readonly AgendaStaffMember[],
): RoomAgendaResponseDto {
  const sessions = [
    ...agenda.rooms.flatMap((room) => room.sessions),
    ...agenda.sessionsWithoutRoom,
  ];
  const knownMembershipIds = new Set(teamStaff.map((member) => member.membershipId));
  const extraStaff = sessions
    .flatMap((session) => (session.teacher === null ? [] : [session.teacher]))
    .filter(({ membershipId }) => !knownMembershipIds.has(membershipId));
  const uniqueExtraStaff = [
    ...new Map(extraStaff.map((member) => [member.membershipId, member])).values(),
  ];

  return {
    ...agenda,
    rooms: [...teamStaff, ...uniqueExtraStaff].map(({ membershipId, fullName }) => ({
      id: membershipId,
      name: fullName,
      capacity: STAFF_LANE_CAPACITY,
      staff: null,
      sessions: sessions.filter((session) => session.teacher?.membershipId === membershipId),
    })),
    sessionsWithoutRoom: sessions.filter((session) => session.teacher === null),
  };
}
