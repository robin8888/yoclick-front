import { z } from 'zod';

const MAX_STAFF_NAME_LENGTH = 120;

// Los parámetros de ruta no son de fiar (deep links, restauración de navegación): se validan.
export const serviceRouteParamsSchema = z.object({ serviceId: z.uuid() });

/** El paso de día y clase: el servicio; quién la da y en qué sala lo decide el centro. */
export const slotRouteParamsSchema = z.object({ serviceId: z.uuid() });

export type SlotRouteParams = z.infer<typeof slotRouteParamsSchema>;

/** La clase elegida: lo justo para resumirla y apuntarse a ella. */
export const confirmBookingRouteParamsSchema = z.object({
  serviceId: z.uuid(),
  classSessionId: z.uuid(),
  startsAt: z.iso.datetime(),
  staffName: z.string().min(1).max(MAX_STAFF_NAME_LENGTH),
});
export type ConfirmBookingRouteParams = z.infer<typeof confirmBookingRouteParamsSchema>;

export const bookedRouteParamsSchema = z.object({ bookingId: z.uuid() });

/** Cambiar la hora de una cita: lo justo para pedir los huecos del mismo servicio y persona. */
export const rescheduleRouteParamsSchema = z.object({
  bookingId: z.uuid(),
  serviceId: z.uuid(),
  staffMembershipId: z.uuid(),
  serviceName: z.string().min(1).max(MAX_STAFF_NAME_LENGTH),
  startsAt: z.iso.datetime(),
});
export type RescheduleRouteParams = z.infer<typeof rescheduleRouteParamsSchema>;
