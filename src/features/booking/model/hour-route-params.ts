import { z } from 'zod';

const MAX_STAFF_NAME_LENGTH = 120;

/** El paso de día y hora de un servicio que se reserva por hora libre. */
export const hourRouteParamsSchema = z.object({ serviceId: z.uuid() });

/** La hora elegida, lo justo para resumirla y reservarla. `staffMembershipId` vacío = quien tenga hueco. */
export const confirmHourRouteParamsSchema = z.object({
  serviceId: z.uuid(),
  startsAt: z.iso.datetime(),
  staffMembershipId: z.uuid(),
  staffName: z.string().min(1).max(MAX_STAFF_NAME_LENGTH),
});
export type ConfirmHourRouteParams = z.infer<typeof confirmHourRouteParamsSchema>;
