import type {
  RoomAgendaResponseDto,
  RoomAgendaResponseDtoRoomsItem,
  RoomAgendaResponseDtoRoomsItemSessionsItem,
} from '@/shared/api/generated/model';

export type RoomDay = RoomAgendaResponseDtoRoomsItem;
export type RoomSession = RoomAgendaResponseDtoRoomsItemSessionsItem;

/** Quedan plazas en la clase. */
export function hasFreeSeats(session: Pick<RoomSession, 'capacity' | 'bookedCount'>): boolean {
  return session.bookedCount < session.capacity;
}

/** Las plazas que quedan (nunca negativas). */
export function countFreeSeats(session: Pick<RoomSession, 'capacity' | 'bookedCount'>): number {
  return Math.max(session.capacity - session.bookedCount, 0);
}

/** Los profesores que dan clase en la sala ese día, sin repetir y por orden de hora. */
export function listTeachersOfRoomDay(room: RoomDay): string[] {
  const names = room.sessions.flatMap((session) =>
    session.teacher === null ? [] : [session.teacher.fullName],
  );
  return [...new Set(names)];
}

export interface FoundSession {
  session: RoomSession;
  /** `null` si la sesión no tiene sala. */
  roomName: string | null;
}

/** Una sesión del día por su id, esté en una sala o sin sala; `undefined` si no está. */
export function findSessionInRoomAgenda(
  agenda: RoomAgendaResponseDto,
  sessionId: string,
): FoundSession | undefined {
  for (const room of agenda.rooms) {
    const session = room.sessions.find((candidate) => candidate.id === sessionId);
    if (session !== undefined) return { session, roomName: room.name };
  }
  const sessionWithoutRoom = agenda.sessionsWithoutRoom.find(
    (candidate) => candidate.id === sessionId,
  );
  return sessionWithoutRoom === undefined
    ? undefined
    : { session: sessionWithoutRoom, roomName: null };
}

/** La clase ya terminó: su hora de fin quedó atrás. */
export function hasSessionEnded(session: Pick<RoomSession, 'endsAt'>, now: Date): boolean {
  return new Date(session.endsAt).getTime() <= now.getTime();
}

/** Se puede apuntar a alguien: no está cancelada ni terminada y quedan plazas (también la privada vacía). */
export function canJoinSession(session: RoomSession, now: Date): boolean {
  return (
    session.cancelledReason === null && !hasSessionEnded(session, now) && hasFreeSeats(session)
  );
}
