const MILLISECONDS_PER_MINUTE = 60_000;

/** El QR caduca a los 5 minutos: solo se genera cuando la persona está a punto de llegar. */
export const CHECK_IN_QR_LEAD_TIME_MINUTES = 15;

export interface CheckInQrWindowInput {
  startsAtIso: string;
  endsAtIso: string;
  nowMs: number;
}

export type CheckInQrAvailability =
  { isAvailable: true } | { isAvailable: false; opensAtIso: string };

/** Disponible desde 15 minutos antes de empezar la cita hasta que termina. */
export function calculateCheckInQrAvailability({
  startsAtIso,
  endsAtIso,
  nowMs,
}: CheckInQrWindowInput): CheckInQrAvailability {
  const opensAtMs =
    Date.parse(startsAtIso) - CHECK_IN_QR_LEAD_TIME_MINUTES * MILLISECONDS_PER_MINUTE;
  const isInsideWindow = nowMs >= opensAtMs && nowMs <= Date.parse(endsAtIso);
  if (isInsideWindow) return { isAvailable: true };
  return { isAvailable: false, opensAtIso: new Date(opensAtMs).toISOString() };
}
