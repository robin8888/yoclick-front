import { z } from 'zod';

/** `/(admin)/schedules/new`: la sala ya elegida y si se llega justo después de crearla. */
export const newScheduleRouteParamsSchema = z.object({
  roomId: z.string().min(1).optional(),
  isNewRoom: z.enum(['true']).optional(),
});
