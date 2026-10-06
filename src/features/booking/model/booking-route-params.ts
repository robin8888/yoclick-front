import { z } from 'zod';

const MAX_STAFF_NAME_LENGTH = 120;

/** Elección del paso «instructor» cuando da igual quién: se asigna a quien tenga hueco. */
export const ANY_STAFF_CHOICE = 'any';

// Los parámetros de ruta no son de fiar (deep links, restauración de navegación): se validan.
export const serviceRouteParamsSchema = z.object({ serviceId: z.uuid() });

/** El paso de día y hora: con `staffMembershipId` solo se ofrecen las horas de esa persona. */
export const slotRouteParamsSchema = z.object({
  serviceId: z.uuid(),
  staffMembershipId: z.uuid().optional(),
});

export type SlotRouteParams = z.infer<typeof slotRouteParamsSchema>;

export const confirmBookingRouteParamsSchema = z.object({
  serviceId: z.uuid(),
  startsAt: z.iso.datetime(),
  staffMembershipId: z.uuid(),
  staffName: z.string().min(1).max(MAX_STAFF_NAME_LENGTH),
});
export type ConfirmBookingRouteParams = z.infer<typeof confirmBookingRouteParamsSchema>;

export const bookedRouteParamsSchema = z.object({ bookingId: z.uuid() });
