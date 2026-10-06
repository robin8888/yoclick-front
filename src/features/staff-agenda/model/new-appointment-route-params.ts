import { z } from 'zod';

const TIME_PATTERN = /^\d{2}:\d{2}$/;

/** Desde un hueco libre llegan el día y la hora; desde el botón flotante, solo el día. */
export const newAppointmentRouteParamsSchema = z.object({
  date: z.iso.date(),
  time: z.string().regex(TIME_PATTERN).optional(),
});
