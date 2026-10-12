import { z } from 'zod';

const TIME_PATTERN = /^\d{2}:\d{2}$/;

/**
 * Desde un hueco libre llegan el día y la hora; desde el botón flotante, solo el día; desde una
 * clase de una sala, el día y la sesión (ya se sabe servicio, profesor, sala y modo).
 */
export const newAppointmentRouteParamsSchema = z.object({
  date: z.iso.date(),
  time: z.string().regex(TIME_PATTERN).optional(),
  sessionId: z.string().min(1).optional(),
});
