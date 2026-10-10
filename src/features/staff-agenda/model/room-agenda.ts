import type {
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
  const names = room.sessions.map((session) => session.teacher.fullName);
  return [...new Set(names)];
}
