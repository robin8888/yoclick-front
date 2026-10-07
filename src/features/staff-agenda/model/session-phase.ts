/** Minutos antes de la hora de inicio desde los que se puede abrir la clase (lo mismo que la API). */
export const EARLY_START_MINUTES = 15;

const MILLISECONDS_PER_MINUTE = 60_000;

export type SessionPhase = 'cancelled' | 'not-started' | 'in-progress' | 'finished';

interface SessionPhaseInput {
  status: string;
  startedAt: string | null;
  endedAt: string | null;
}

/** En qué punto está una clase: sin empezar, en curso, terminada o cancelada. */
export function resolveSessionPhase({
  status,
  startedAt,
  endedAt,
}: SessionPhaseInput): SessionPhase {
  if (status === 'cancelled') return 'cancelled';
  if (endedAt !== null) return 'finished';
  return startedAt === null ? 'not-started' : 'in-progress';
}

interface StartWindowInput {
  startsAt: string;
  endsAt: string;
  now: Date;
}

/**
 * ¿Se puede iniciar ya? Desde 15 minutos antes de la hora hasta que acaba la cita. Es solo para
 * activar o desactivar el botón: la API es quien decide de verdad.
 */
export function isWithinStartWindow({ startsAt, endsAt, now }: StartWindowInput): boolean {
  const opensAt = new Date(startsAt).getTime() - EARLY_START_MINUTES * MILLISECONDS_PER_MINUTE;
  const closesAt = new Date(endsAt).getTime();
  return now.getTime() >= opensAt && now.getTime() <= closesAt;
}

/** Una cita que aún no ha empezado ni se ha cancelado se puede cancelar desde la agenda. */
export function canCancelAppointment(
  booking: SessionPhaseInput & { startsAt: string },
  now: Date,
): boolean {
  return (
    resolveSessionPhase(booking) === 'not-started' &&
    now.getTime() < new Date(booking.startsAt).getTime()
  );
}
