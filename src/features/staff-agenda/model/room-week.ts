import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { addDaysToIsoDate, getWeekdayOfIsoDate } from '@/shared/lib/format';

const DAYS_PER_WEEK = 7;
/** Cuántos puntos caben debajo de un día de la franja. */
export const MAX_DOTS_PER_DAY = 4;

/** Los siete días (de lunes a domingo) de la semana en la que cae la fecha. */
export function listWeekIsoDates(isoDate: string): string[] {
  const weekday = getWeekdayOfIsoDate(isoDate) ?? 1;
  const monday = addDaysToIsoDate(isoDate, 1 - weekday);
  return Array.from({ length: DAYS_PER_WEEK }, (_unused, offset) =>
    addDaysToIsoDate(monday, offset),
  );
}

/** Las salas con alguna clase en pie ese día, en el orden del centro (para los puntos del día). */
export function listRoomIdsWithClasses(agenda: RoomAgendaResponseDto | undefined): string[] {
  if (agenda === undefined) return [];
  return agenda.rooms
    .filter((room) => room.sessions.some((session) => session.cancelledReason === null))
    .map((room) => room.id);
}
