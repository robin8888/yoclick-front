import type { PassListResponseDtoPassesItem } from '@/shared/api/generated/model';

type Pass = PassListResponseDtoPassesItem;

const NEVER_EXPIRES_TIME = Number.MAX_SAFE_INTEGER;

function getExpiryTime(pass: Pass): number {
  return pass.expiresAt === null ? NEVER_EXPIRES_TIME : Date.parse(pass.expiresAt);
}

/** Los bonos que se pueden usar ahora, el que antes caduca primero (el que se descuenta antes). */
export function getUsablePasses(passes: readonly Pass[]): Pass[] {
  return passes
    .filter(({ status }) => status === 'active')
    .sort((left, right) => getExpiryTime(left) - getExpiryTime(right));
}

/** Las clases que le quedan en total entre todos sus bonos usables. */
export function countRemainingSessions(passes: readonly Pass[]): number {
  return getUsablePasses(passes).reduce((total, pass) => total + pass.remainingSessions, 0);
}

/**
 * Las clases que aún puede agendar con sus bonos: lo que le queda menos las ya agendadas por venir
 * (sin descontar todavía), de los servicios que cubren sus bonos. Nunca negativo.
 */
export function countBookableSessions(
  passes: readonly Pass[],
  upcomingBookings: readonly {
    status: string;
    source?: string;
    service: { id: string };
  }[],
): number {
  const usable = getUsablePasses(passes);
  const hasPassForEveryService = usable.some(({ services }) => services.length === 0);
  const coveredServiceIds = new Set(usable.flatMap(({ services }) => services.map(({ id }) => id)));
  const reserved = upcomingBookings.filter(
    (booking) =>
      booking.status === 'confirmed' &&
      booking.source !== 'enrollment' &&
      (hasPassForEveryService || coveredServiceIds.has(booking.service.id)),
  ).length;
  return Math.max(countRemainingSessions(passes) - reserved, 0);
}

/** Lo que cuenta la tarjeta de inicio: el bono que se gastará antes, o «sin bono». */
export function pickHomePass(passes: readonly Pass[]): Pass | null {
  return getUsablePasses(passes)[0] ?? null;
}
