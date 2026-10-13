import type {
  MyBookingsResponseDtoBookingsItem,
  PassListResponseDtoPassesItem,
} from '@/shared/api/generated/model';

import { getUsablePasses } from './pass-summary';

export interface ServicePassBalance {
  /** El bono que se gastará antes (el que antes caduca). */
  passId: string;
  passName: string;
  expiresAt: string | null;
  /** Clases que le quedan en total, entre todos sus bonos que valen para el servicio. */
  remainingSessions: number;
  /** Clases ya agendadas por venir que se gastarán de esos bonos. */
  reservedSessions: number;
  /** Las que aún puede agendar: lo que le queda menos lo ya agendado (nunca negativo). */
  bookableSessions: number;
}

type UpcomingBooking = Pick<MyBookingsResponseDtoBookingsItem, 'status' | 'source'> & {
  service: Pick<MyBookingsResponseDtoBookingsItem['service'], 'id'>;
};

/**
 * El bono (o los bonos) que se pueden gastar en ese servicio y cuántas clases quedan por agendar:
 * las que le quedan menos las que ya tiene agendadas por venir (aún sin descontar). Así el bono de
 * 10 con 5 clases agendadas ofrece 5, y no se pueden agendar clases «gratis». Vacío = vale para todos.
 */
export function getServicePassBalance(
  passes: readonly PassListResponseDtoPassesItem[],
  serviceId: string,
  upcomingBookings: readonly UpcomingBooking[] = [],
): ServicePassBalance | null {
  const matching = getUsablePasses(passes).filter(
    ({ services }) => services.length === 0 || services.some(({ id }) => id === serviceId),
  );
  const [first] = matching;
  if (first === undefined) return null;

  const hasPassForEveryService = matching.some(({ services }) => services.length === 0);
  const coveredServiceIds = new Set(
    matching.flatMap(({ services }) => services.map(({ id }) => id)),
  );
  const reservedSessions = upcomingBookings.filter(
    (booking) =>
      booking.status === 'confirmed' &&
      booking.source !== 'enrollment' &&
      (hasPassForEveryService || coveredServiceIds.has(booking.service.id)),
  ).length;
  const remainingSessions = matching.reduce((total, pass) => total + pass.remainingSessions, 0);

  return {
    passId: first.id,
    passName: first.name,
    expiresAt: first.expiresAt,
    remainingSessions,
    reservedSessions,
    bookableSessions: Math.max(remainingSessions - reservedSessions, 0),
  };
}
