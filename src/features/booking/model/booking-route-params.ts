import { z } from 'zod';

const MAX_STAFF_NAME_LENGTH = 120;

// Los parámetros de ruta no son de fiar (deep links, restauración de navegación): se validan.
export const serviceRouteParamsSchema = z.object({ serviceId: z.uuid() });

export const confirmBookingRouteParamsSchema = z.object({
  serviceId: z.uuid(),
  startsAt: z.iso.datetime(),
  staffMembershipId: z.uuid(),
  staffName: z.string().min(1).max(MAX_STAFF_NAME_LENGTH),
});
export type ConfirmBookingRouteParams = z.infer<typeof confirmBookingRouteParamsSchema>;

export const bookedRouteParamsSchema = z.object({ bookingId: z.uuid() });
