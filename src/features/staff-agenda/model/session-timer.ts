const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const TWO_DIGITS = 2;
const MILLISECONDS_PER_SECOND = 1000;

export interface SessionTimerState {
  readonly elapsedSeconds: number;
  /** Lo que falta hasta la duración prevista; 0 si ya se ha pasado. */
  readonly remainingSeconds: number;
  readonly isOvertime: boolean;
  /** Segundos que se ha pasado de la duración prevista; 0 si no se ha pasado. */
  readonly overtimeSeconds: number;
  /** De 0 a 1: cuánto de la duración prevista ha transcurrido (tope 1). */
  readonly progressFraction: number;
}

interface SessionTimerRequest {
  startedAt: Date;
  plannedDurationSeconds: number;
  now: Date;
}

/**
 * Estado del temporizador a partir de la hora de inicio que guarda el servidor, no de un contador
 * local: así sigue bien si la app se cierra, se cambia de móvil o el reloj se atrasa un momento.
 */
export function computeSessionTimer({
  startedAt,
  plannedDurationSeconds,
  now,
}: SessionTimerRequest): SessionTimerState {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - startedAt.getTime()) / MILLISECONDS_PER_SECOND),
  );
  const overtimeSeconds = Math.max(0, elapsedSeconds - plannedDurationSeconds);
  const progressFraction =
    plannedDurationSeconds <= 0 ? 1 : Math.min(1, elapsedSeconds / plannedDurationSeconds);
  return {
    elapsedSeconds,
    remainingSeconds: Math.max(0, plannedDurationSeconds - elapsedSeconds),
    isOvertime: overtimeSeconds > 0,
    overtimeSeconds,
    progressFraction,
  };
}

function padToTwoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

/** «45:07» o, a partir de una hora, «1:05:07». */
export function formatTimerDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((safeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = safeSeconds % SECONDS_PER_MINUTE;
  const minutesAndSeconds = `${padToTwoDigits(minutes)}:${padToTwoDigits(seconds)}`;
  return hours === 0 ? minutesAndSeconds : `${String(hours)}:${minutesAndSeconds}`;
}
