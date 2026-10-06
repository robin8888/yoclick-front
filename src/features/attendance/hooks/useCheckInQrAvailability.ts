import { useEffect, useState } from 'react';

import {
  calculateCheckInQrAvailability,
  type CheckInQrAvailability,
} from '../model/check-in-qr-availability';

/** `setTimeout` desborda con esperas mayores (≈ 24,8 días) y dispararía al instante. */
const MAX_TIMER_DELAY_MS = 2_147_483_647;

interface AppointmentWindow {
  startsAt: string;
  endsAt: string;
}

/**
 * Dice si ya se puede generar el QR de la cita y se actualiza solo al abrirse la ventana, sin que
 * la persona tenga que salir y volver a la pantalla.
 */
export function useCheckInQrAvailability(
  appointment: AppointmentWindow | undefined,
): CheckInQrAvailability | undefined {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const availability =
    appointment === undefined
      ? undefined
      : calculateCheckInQrAvailability({
          startsAtIso: appointment.startsAt,
          endsAtIso: appointment.endsAt,
          nowMs,
        });
  const opensAtIso = availability?.isAvailable === false ? availability.opensAtIso : undefined;

  useEffect(() => {
    if (opensAtIso === undefined) return;
    const millisecondsUntilOpening = Date.parse(opensAtIso) - Date.now();
    if (millisecondsUntilOpening > MAX_TIMER_DELAY_MS) return;
    const timerId = setTimeout(
      () => {
        setNowMs(Date.now());
      },
      Math.max(millisecondsUntilOpening, 0),
    );
    return () => {
      clearTimeout(timerId);
    };
  }, [opensAtIso]);

  return availability;
}
